export { googleMeet } from './google-meet';
export { zoom } from './zoom';
export { microsoftTeamsVideo } from './microsoft-teams';

import { googleMeet } from './google-meet';
import { microsoftTeamsVideo } from './microsoft-teams';
import { zoom } from './zoom';

export const videoProviders = [googleMeet, zoom, microsoftTeamsVideo];
