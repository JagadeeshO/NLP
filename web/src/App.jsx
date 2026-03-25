import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AnalyzerPage from './pages/AnalyzerPage';

const ProtectedRoute = ({ children }) => {
  const isAuth = sessionStorage.getItem('is_authenticated') === 'true';
  return isAuth ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route 
          path="/analyzer" 
          element={
            <ProtectedRoute>
              <AnalyzerPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
