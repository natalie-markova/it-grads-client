import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from './components/pages/Main/Main';
import Login from './components/pages/Login/Login';
import Registration from './components/pages/Registration/Registration';
import Home from './components/pages/Home/Home';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import App from "./App";
import './index.css';

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
      }
    ]}
  ]);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <RouterProvider router={router} />
);
