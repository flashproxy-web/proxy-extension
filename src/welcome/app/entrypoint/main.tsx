import { createRoot } from 'react-dom/client';

import { Welcome } from '@/welcome/pages/welcome';
import '@/shared/styles/globals.css';

createRoot(document.getElementById('root')!).render(<Welcome />);
