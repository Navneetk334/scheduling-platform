export { googleCalendar } from './google-calendar';
export { microsoftOutlook } from './microsoft-outlook';
export { appleCalendar } from './apple-calendar';

import { appleCalendar } from './apple-calendar';
import { googleCalendar } from './google-calendar';
import { microsoftOutlook } from './microsoft-outlook';

export const calendarProviders = [googleCalendar, microsoftOutlook, appleCalendar];
