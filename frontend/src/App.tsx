import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ChatWidget from './components/chatbot/ChatWidget';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import VoiceScreen from './components/booking/VoiceScreen';
import ManualBooking from './components/booking/ManualBooking';
import ReviewPayment from './components/booking/ReviewPayment';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          
          {/* Booking Routes */}
          <Route path="/book/voice" element={<ProtectedRoute><VoiceScreen onClose={() => window.history.back()} onSwitchToManual={() => window.location.href='/book/manual'} /></ProtectedRoute>} />
          <Route path="/book/manual" element={<ProtectedRoute><div className="min-h-screen bg-background p-6"><ManualBooking /></div></ProtectedRoute>} />
          <Route path="/book/review" element={<ProtectedRoute><div className="min-h-screen bg-background p-6"><ReviewPayment onBack={() => window.history.back()} /></div></ProtectedRoute>} />
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
