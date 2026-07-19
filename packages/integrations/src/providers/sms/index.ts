export { twilio } from './twilio';
export { messagebird } from './messagebird';

import { messagebird } from './messagebird';
import { twilio } from './twilio';

export const smsProviders = [twilio, messagebird];
