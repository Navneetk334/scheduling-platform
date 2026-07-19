import { Injectable } from '@nestjs/common';

export interface RenderedTemplate {
  subject: string | null;
  html: string | null;
  text: string;
  /** Variables referenced in the template but not supplied at render time. */
  missingVariables: string[];
}

interface RenderableTemplate {
  subject?: string | null;
  bodyHtml?: string | null;
  bodyText: string;
}

const TOKEN_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders branded email/SMS templates. Uses a safe `{{variable}}` syntax with
 * HTML escaping in the HTML body (SMS/plain-text bodies are left unescaped).
 * Missing variables are reported rather than leaving raw tokens in output.
 */
@Injectable()
export class TemplateRenderer {
  render(template: RenderableTemplate, variables: Record<string, string>): RenderedTemplate {
    const missing = new Set<string>();

    const substitute = (input: string, escape: boolean): string =>
      input.replace(TOKEN_PATTERN, (_match, key: string) => {
        const value = variables[key];
        if (value === undefined) {
          missing.add(key);
          return '';
        }
        return escape ? escapeHtml(value) : value;
      });

    return {
      subject: template.subject ? substitute(template.subject, false) : null,
      html: template.bodyHtml ? substitute(template.bodyHtml, true) : null,
      text: substitute(template.bodyText, false),
      missingVariables: [...missing],
    };
  }

  /** Extract the set of `{{variable}}` names declared across a template. */
  extractVariables(template: RenderableTemplate): string[] {
    const found = new Set<string>();
    for (const source of [template.subject, template.bodyHtml, template.bodyText]) {
      if (!source) continue;
      for (const match of source.matchAll(TOKEN_PATTERN)) {
        if (match[1]) found.add(match[1]);
      }
    }
    return [...found];
  }
}
