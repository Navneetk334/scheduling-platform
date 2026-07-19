/**
 * A minimal, dependency-free SMTP client built on Node's `net`/`tls` sockets.
 * Supports implicit TLS (port 465), STARTTLS (587/25) and AUTH LOGIN/PLAIN.
 * Intentionally small — it covers the transactional-send path the platform
 * needs without pulling in a mail library.
 */

import { connect as netConnect, type Socket } from 'node:net';
import { connect as tlsConnect, type TLSSocket } from 'node:tls';

import { IntegrationError, IntegrationErrorKind } from '../../core';

export interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean; // true = implicit TLS (465)
  readonly username?: string;
  readonly password?: string;
  readonly connectionTimeoutMs?: number;
  readonly clientName?: string;
}

export interface SmtpMail {
  readonly from: string; // bare address
  readonly fromName?: string;
  readonly to: readonly string[];
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
  readonly subject: string;
  readonly html?: string;
  readonly text?: string;
  readonly replyTo?: string;
}

type AnySocket = Socket | TLSSocket;

function encodeHeader(value: string): string {
  // RFC 2047 encoded-word for non-ASCII subjects.
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

function buildMessage(mail: SmtpMail): string {
  const boundary = `=_inv_${Date.now().toString(36)}`;
  const headers: string[] = [
    `From: ${mail.fromName ? `${encodeHeader(mail.fromName)} <${mail.from}>` : mail.from}`,
    `To: ${mail.to.join(', ')}`,
    ...(mail.cc?.length ? [`Cc: ${mail.cc.join(', ')}`] : []),
    ...(mail.replyTo ? [`Reply-To: ${mail.replyTo}`] : []),
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
  ];

  let body: string;
  if (mail.html && mail.text) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    body = [
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      mail.text,
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      mail.html,
      `--${boundary}--`,
      '',
    ].join('\r\n');
  } else if (mail.html) {
    headers.push('Content-Type: text/html; charset=utf-8');
    body = mail.html;
  } else {
    headers.push('Content-Type: text/plain; charset=utf-8');
    body = mail.text ?? '';
  }

  // Dot-stuffing: escape lines beginning with a period.
  const stuffed = body.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
  return `${headers.join('\r\n')}\r\n\r\n${stuffed}`;
}

class SmtpSession {
  private buffer = '';
  private resolver: ((line: string) => void) | null = null;
  private rejecter: ((err: Error) => void) | null = null;

  constructor(private readonly socket: AnySocket) {
    socket.setEncoding('utf8');
    socket.on('data', (chunk: string) => this.onData(chunk));
    socket.on('error', (err: Error) => this.rejecter?.(err));
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    // A full reply ends with a line "NNN <text>" (space after code).
    const match = /^\d{3} [^\n]*\r?\n/m.exec(this.buffer);
    if (match && this.resolver) {
      const line = this.buffer;
      this.buffer = '';
      const resolve = this.resolver;
      this.resolver = null;
      resolve(line);
    }
  }

  read(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
  }

  async command(line: string, expected: number): Promise<string> {
    this.socket.write(`${line}\r\n`);
    const response = await this.read();
    this.expect(response, expected, line.split(' ')[0] ?? 'SMTP');
    return response;
  }

  writeRaw(data: string): void {
    this.socket.write(data);
  }

  expect(response: string, code: number, verb: string): void {
    if (!response.trimStart().startsWith(String(code))) {
      throw new IntegrationError(`SMTP ${verb} failed: ${response.trim()}`, {
        kind: response.startsWith('4') ? IntegrationErrorKind.Transient : IntegrationErrorKind.Provider,
      });
    }
  }
}

function openSocket(config: SmtpConfig): Promise<AnySocket> {
  const timeout = config.connectionTimeoutMs ?? 15_000;
  return new Promise((resolve, reject) => {
    const socket = config.secure
      ? tlsConnect({ host: config.host, port: config.port, servername: config.host })
      : netConnect({ host: config.host, port: config.port });
    const onConnect = (): void => {
      socket.setTimeout(0);
      resolve(socket);
    };
    socket.setTimeout(timeout, () => {
      socket.destroy();
      reject(new IntegrationError('SMTP connection timed out.', { kind: IntegrationErrorKind.Transient }));
    });
    socket.once(config.secure ? 'secureConnect' : 'connect', onConnect);
    socket.once('error', reject);
  });
}

function upgradeToTls(socket: Socket, host: string): Promise<TLSSocket> {
  return new Promise((resolve, reject) => {
    const tls = tlsConnect({ socket, servername: host }, () => resolve(tls));
    tls.once('error', reject);
  });
}

/** Connect, negotiate TLS + AUTH, then QUIT — used as a health probe. */
export async function verifySmtpConnection(config: SmtpConfig): Promise<void> {
  let socket = await openSocket(config);
  let session = new SmtpSession(socket);
  const clientName = config.clientName ?? 'invincible-pros';
  try {
    await session.read();
    let ehlo = await session.command(`EHLO ${clientName}`, 250);
    if (!config.secure && /STARTTLS/i.test(ehlo)) {
      await session.command('STARTTLS', 220);
      socket = await upgradeToTls(socket, config.host);
      session = new SmtpSession(socket);
      ehlo = await session.command(`EHLO ${clientName}`, 250);
    }
    if (config.username && config.password) {
      if (/AUTH[ =-].*PLAIN/i.test(ehlo)) {
        const token = Buffer.from(`\u0000${config.username}\u0000${config.password}`).toString('base64');
        await session.command(`AUTH PLAIN ${token}`, 235);
      } else {
        await session.command('AUTH LOGIN', 334);
        await session.command(Buffer.from(config.username).toString('base64'), 334);
        await session.command(Buffer.from(config.password).toString('base64'), 235);
      }
    }
    await session.command('QUIT', 221).catch(() => undefined);
  } finally {
    socket.destroy();
  }
}

/** Send a single message and close the connection. Returns the server reply. */
export async function sendSmtpMail(config: SmtpConfig, mail: SmtpMail): Promise<string> {
  let socket = await openSocket(config);
  let session = new SmtpSession(socket);
  const clientName = config.clientName ?? 'invincible-pros';

  try {
    await session.read(); // greeting (220)
    let ehlo = await session.command(`EHLO ${clientName}`, 250);

    if (!config.secure && /STARTTLS/i.test(ehlo)) {
      await session.command('STARTTLS', 220);
      socket = await upgradeToTls(socket, config.host);
      session = new SmtpSession(socket);
      ehlo = await session.command(`EHLO ${clientName}`, 250);
    }

    if (config.username && config.password) {
      if (/AUTH[ =-].*PLAIN/i.test(ehlo)) {
        const token = Buffer.from(`\u0000${config.username}\u0000${config.password}`).toString('base64');
        await session.command(`AUTH PLAIN ${token}`, 235);
      } else {
        await session.command('AUTH LOGIN', 334);
        await session.command(Buffer.from(config.username).toString('base64'), 334);
        await session.command(Buffer.from(config.password).toString('base64'), 235);
      }
    }

    await session.command(`MAIL FROM:<${mail.from}>`, 250);
    for (const rcpt of [...mail.to, ...(mail.cc ?? []), ...(mail.bcc ?? [])]) {
      await session.command(`RCPT TO:<${rcpt}>`, 250);
    }
    await session.command('DATA', 354);
    session.writeRaw(`${buildMessage(mail)}\r\n.\r\n`);
    const result = await session.read();
    session.expect(result, 250, 'DATA');

    await session.command('QUIT', 221).catch(() => undefined);
    return result.trim();
  } finally {
    socket.destroy();
  }
}
