import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ConfigProvider} from 'antd';
import App from './App.tsx';
import './index.css';
import {notionTheme} from './lib/theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={notionTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
);
