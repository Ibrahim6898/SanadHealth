import { useAuth } from '../context/AuthContext';
import PatientList from '../components/CHEW/PatientList';
import AlertPanel from '../components/CHEW/AlertPanel';

export default function CHEWPortal() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header specific to CHEW */}
      <div className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-primary-500 text-slate-900 text-sm px-2 py-0.5 rounded uppercase tracking-wider font-extrabold">CHEW</span>
              SanadHealth Portal
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Monitoring coverage for: {user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm font-medium text-slate-300 hover:text-white bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Alerts Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex w-3 h-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-3 h-3 bg-red-500"></span>
              </span>
              Priority Action Items
            </h2>
            <AlertPanel />
          </div>

          {/* Patients Column */}
          <div className="space-y-6">
            <PatientList />
          </div>
          
        </div>
      </div>
    </div>
  );
}
