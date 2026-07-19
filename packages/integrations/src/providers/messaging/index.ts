export { slack } from './slack';
export { microsoftTeamsChat } from './microsoft-teams';
export { discord } from './discord';

import { discord } from './discord';
import { microsoftTeamsChat } from './microsoft-teams';
import { slack } from './slack';

export const messagingProviders = [slack, microsoftTeamsChat, discord];
