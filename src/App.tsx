import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './router/ProtectedRoute';
import LandingPage from './pages/LandingPage';
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
import MyTicketsPage from './pages/MyTicketsPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Standalone pages (no layout wrapper) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* All pages with the shared Layout (Header + Sidebar + Accessibility) */}
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />

            {/* Protected organizer routes */}
            <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/dashboard/events/new" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
            <Route path="/dashboard/costs" element={<ProtectedRoute><CostsPage /></ProtectedRoute>} />
            <Route path="/dashboard/venue" element={<ProtectedRoute><VenuePage /></ProtectedRoute>} />
            <Route path="/dashboard/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
            <Route path="/dashboard/checkin" element={<ProtectedRoute><CheckInPage /></ProtectedRoute>} />
            <Route path="/dashboard/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
