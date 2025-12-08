import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from './components/pages/Login/Login';
import Registration from './components/pages/Registration/Registration';
import Home from './components/pages/Home/Home';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import App from "./App";
import './index.css';
import './i18n';
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
import CandidatesMap from './components/pages/CandidatesMap/CandidatesMap';
import EmployerPublicProfile from './components/pages/Employer/EmployerPublicProfile';
import MessengerPage from './components/pages/Messenger/MessengerPage';
import AudioInterview from './components/pages/AudioInterview/AudioInterview';
import VacancyDetail from './components/pages/Vacancies/VacancyDetail';
import ResumeForm from './components/pages/Resume/ResumeForm';
import InterviewTracker from './components/pages/InterviewTracker/InterviewTracker';
import { CodeBattleHome, TaskList, Playground, Leaderboard, PvPBattle } from './components/pages/CodeBattle';
import { PositionSelector, PlanDashboard } from './components/pages/DevelopmentPlan';

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
        path: "/interview/tracker",
        element:
        <ProtectedRoute>
          <InterviewTracker />
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
        path: "/candidates/map",
        element: <CandidatesMap />,
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
      {
        path: "/resume/:id",
        element:
        <ProtectedRoute>
          <ResumeForm />
        </ProtectedRoute>,
      },
      // Code Battle Arena
      {
        path: "/codebattle",
        element: <CodeBattleHome />,
      },
      {
        path: "/codebattle/tasks",
        element: <TaskList />,
      },
      {
        path: "/codebattle/play/:taskId",
        element: <Playground />,
      },
      {
        path: "/codebattle/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/codebattle/pvp",
        element:
        <ProtectedRoute>
          <PvPBattle />
        </ProtectedRoute>,
      },
      {
        path: "/codebattle/vs-ai",
        element: <TaskList />,
      },
      // Development Plan
      {
        path: "/development-plan",
        element:
        <ProtectedRoute>
          <PlanDashboard />
        </ProtectedRoute>,
      },
      {
        path: "/development-plan/select",
        element:
        <ProtectedRoute>
          <PositionSelector />
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