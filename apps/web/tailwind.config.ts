import preset from '@invincible/ui/tailwind-preset';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    // Include the UI package sources so its utility classes are generated.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
