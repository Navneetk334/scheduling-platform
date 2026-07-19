export { hubspot } from './hubspot';
export { salesforce } from './salesforce';
export { zohoCrm } from './zoho';
export { pipedrive } from './pipedrive';

import { hubspot } from './hubspot';
import { pipedrive } from './pipedrive';
import { salesforce } from './salesforce';
import { zohoCrm } from './zoho';

export const crmProviders = [hubspot, salesforce, zohoCrm, pipedrive];
