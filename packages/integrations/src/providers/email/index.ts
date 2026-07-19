export { resend } from './resend';
export { smtp } from './smtp';
export { mailgun } from './mailgun';

import { mailgun } from './mailgun';
import { resend } from './resend';
import { smtp } from './smtp';

export const emailProviders = [resend, smtp, mailgun];
