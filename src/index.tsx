import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import { Provider } from 'react-redux';
import { store } from './store';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
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
        path: "/interview/:sessionId ",
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

    ]}
  ]);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
