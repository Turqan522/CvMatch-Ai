import React from 'react';
import { createRoot } from 'react-dom/client';
import Account from './Account';
import './styles.css';
import './theme.css';
import './premium-ui.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><Account/></React.StrictMode>);
