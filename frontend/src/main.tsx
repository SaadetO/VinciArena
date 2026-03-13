import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { UserContextProvider } from './contexts/UserContext.tsx';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './themes.tsx';
import { ProfilePage } from './pages/ProfilePage/index.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { TeamPage } from './pages/TeamPage/index.tsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'teams',
        children: [
          {
            path: '',
            element: 'teams',
          },
          {
            path: ':id',
            element: <TeamPage />,
          },
        ],
      },
      {
        path: 'users/:id',
        element: <ProfilePage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage></NotificationsPage>,
      },
    ],
  },
  {
    path: '/auth',
    children: [
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Global CSS reset from Material-UI */}
      <UserContextProvider>
        <RouterProvider router={router} />
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
