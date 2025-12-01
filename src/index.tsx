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
import ProfileWrapper from './components/pages/Profile/ProfileWrapper';
import CompaniesRating from './components/pages/CompaniesRating/CompaniesRating';
import CompanyDetails from './components/pages/CompanyDetails/CompanyDetails';
import Graduates from './components/pages/Graduates/Graduates';
import { Provider } from 'react-redux';
import { store } from './store';
import InterviewHub from './components/pages/Interview/InterviewHub';
import RoadmapList from './components/pages/Roadmap/RoadmapList';
import RoadmapDetail from './components/pages/Roadmap/RoadmapDetail';
import Candidates from './components/pages/Candidates/Candidates';
import EmployerPublicProfile from './components/pages/Employer/EmployerPublicProfile';
import MessengerPage from './components/pages/Messenger/MessengerPage';
import AudioInterview from './components/pages/AudioInterview/AudioInterview';
import VacancyDetail from './components/pages/Vacancies/VacancyDetail';

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
        path: "/interview",
        element: <InterviewHub />
      },
      {
        path: "/interview/practice",
        element: <Interview />
      },
      {
        path: "/interview/ai/setup",
        element:
        <ProtectedRoute>
          <InterviewSetupPage />
        </ProtectedRoute>,
      },
      {
        path: "/interview/ai/:sessionId",
        element:
        <ProtectedRoute>
          <InterviewPage />
        </ProtectedRoute>,
      },
      {
        path: "/interview/ai/:sessionId/results",
        element:
        <ProtectedRoute>
          <InterviewResultsPage/>
        </ProtectedRoute>,
      },
      {
        path: "/interview/audio",
        element:
        <ProtectedRoute>
          <AudioInterview />
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
          <ProfileWrapper />
        </ProtectedRoute>,
      },
      {
        path: "/companies",
        element: <CompaniesRating />,
      },
      {
        path: "/companies/:id",
        element: <CompanyDetails />,
      },
      {
        path: "/employer/:employerId",
        element: <EmployerPublicProfile />,
      },
      {
        path: "/roadmap",
        element: <RoadmapList />,
      },
      {
        path: "/roadmap/:slug",
        element: <RoadmapDetail />,
      },
      {
        path: "/candidates",
        element: <Candidates />,
      },
      {
        path: "/messenger",
        element:
        <ProtectedRoute>
          <MessengerPage />
        </ProtectedRoute>,
      },
      {
        path: "/messenger/:chatId",
        element:
        <ProtectedRoute>
          <MessengerPage />
        </ProtectedRoute>,
      },
      {
        path: "/vacancy/:id",
        element: <VacancyDetail />,
      },

    ]}
  ]);

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);