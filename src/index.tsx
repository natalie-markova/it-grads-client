import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Main from './components/pages/Main/Main';
import Login from './components/pages/Login/Login';
import Registration from './components/pages/Registration/Registration';
import Home from './components/pages/Home/Home';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import App from "./App";
import './index.css';
import InterviewSetupPage from './components/pages/Interview/InterviewSetupPage';
import InterviewPage from './components/pages/Interview/InterviewPage';
import InterviewResultsPage from './components/pages/Interview/InterviewResultsPage';
import Help from './components/pages/Help/Help';
import FAQ from './components/pages/FAQ/FAQ';
import Skills from './components/pages/Skills/Skills';
import Interview from './components/pages/Interview/Interview';
import AI from './components/pages/AI/AI';
import Jobs from './components/pages/Jobs/Jobs';
import Profile from './components/pages/Profile/Profile';
import { Provider } from 'react-redux';
import { store } from './store';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: "/home",
        element: <Home />
      },
      {
        path: "/registration",
        element: <Registration />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/main",
        element:
        <ProtectedRoute>
          <Main />
        </ProtectedRoute>,
      },
      {
        path: "/interview/setup",
        element:
        <ProtectedRoute>
          <InterviewSetupPage />
        </ProtectedRoute>,
      },
      {
        path: "/interview/:sessionId",
        element:
        <ProtectedRoute>
          <InterviewPage />
        </ProtectedRoute>,
      },
      {
        path: "/interview/:sessionId/results",
        element:
        <ProtectedRoute>
          <InterviewResultsPage/>
        </ProtectedRoute>,
      },
      {
        path: "/help",
        element: <Help />
      },
      {
        path: "/faq",
        element: <FAQ />
      },
      {
        path: "/skills",
        element: <Skills />
      },
      {
        path: "/interview",
        element: <Interview />
      },
      {
        path: "/ai",
        element: <AI />
      },
      {
        path: "/jobs",
        element: <Jobs />
      },
      {
        path: "/profile/:type",
        element:
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>,
      },

    ]}
  ]);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
