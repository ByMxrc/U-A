import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './router/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CreateEventPage from './pages/CreateEventPage';
import CostsPage from './pages/CostsPage';
import VenuePage from './pages/VenuePage';
import AgendaPage from './pages/AgendaPage';
import CheckInPage from './pages/CheckInPage';
import IncidentsPage from './pages/IncidentsPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import ChatbotPage from './pages/ChatbotPage';
import SurveyPage from './pages/SurveyPage';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Standalone login page (no layout wrapper) */}
          <Route path="/login" element={<LoginPage />} />

          {/* All pages with the shared Layout (Header + Sidebar + Accessibility) */}
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/survey" element={<SurveyPage />} />

            {/* Protected organizer routes */}
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/events/new" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
            <Route path="/dashboard/costs" element={<ProtectedRoute><CostsPage /></ProtectedRoute>} />
            <Route path="/dashboard/venue" element={<ProtectedRoute><VenuePage /></ProtectedRoute>} />
            <Route path="/dashboard/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
            <Route path="/dashboard/checkin" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
            <Route path="/dashboard/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
