// Builds the extension pages (popup, dashboard, welcome) into dist/.
import { build } from 'vite';

await build({ configFile: 'vite.config.ts' });

console.log('\nBuilt dist/. Load it from chrome://extensions → Load unpacked.');
