import { createRoot } from 'react-dom/client';

import { Dashboard } from '../routes/App';

import '@/shared/styles/globals.css';

createRoot(document.getElementById('root')!).render(<Dashboard />);
