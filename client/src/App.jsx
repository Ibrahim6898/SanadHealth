import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import CHEWPortal from './pages/CHEWPortal';
import CHEWPatientDetail from './pages/CHEWPatientDetail';
import AdminPortal from './pages/AdminPortal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="p-8 text-center text-slate-500">Loading auth state...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Simple temporary navbar */}
        <header className="bg-white shadow relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-primary text-transparent bg-clip-text">SanadHealth</h1>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/assessment" element={
              <ProtectedRoute>
                <Assessment />
              </ProtectedRoute>
            } />
            
            <Route path="/chew" element={
              <ProtectedRoute role="CHEW">
                <CHEWPortal />
              </ProtectedRoute>
            } />
            <Route path="/chew/patient/:id" element={
              <ProtectedRoute role="CHEW">
                <CHEWPatientDetail />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute role="ADMIN">
                <AdminPortal />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
