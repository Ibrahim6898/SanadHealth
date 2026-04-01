import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/CHEW/PatientList';
import AlertPanel from '../components/CHEW/AlertPanel';
import api from '../services/api';

export default function CHEWPortal() {
  const { user, logout } = useAuth();
  
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [patientsRes, alertsRes] = await Promise.all([
          api.get('/chew/patients'),
          api.get('/chew/alerts')
        ]);
        setPatients(patientsRes.data);
        setAlerts(alertsRes.data);
      } catch (err) {
        console.error("Portal Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortalData();
    const interval = setInterval(fetchPortalData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Compute Stats
  const assessedPatients = patients.filter(p => p.assessments && p.assessments.length > 0);
  const highRiskCount = alerts.filter(a => a.riskLevel === 'HIGH').length;
  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header specific to CHEW */}
      <div className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-primary-500 text-slate-900 text-sm px-2 py-0.5 rounded uppercase tracking-wider font-extrabold">CHEW</span>
              SanadHealth Portal
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Monitoring coverage for: {user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm font-medium text-slate-300 hover:text-white bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 transition w-full sm:w-auto">
            Sign out
          </button>
        </div>
      </div>

      {/* Stats Overview Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="p-4 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Assigned</p>
            <p className="text-3xl font-extrabold text-slate-800">{patients.length}</p>
          </div>
          <div className="p-4 rounded-xl border-l border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">High Risk</p>
            <p className="text-3xl font-extrabold text-orange-600">{highRiskCount}</p>
          </div>
          <div className="p-4 rounded-xl border-t md:border-t-0 md:border-l border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Critical Priority</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-extrabold text-red-600">{criticalCount}</p>
              {criticalCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
            </div>
          </div>
          <div className="p-4 rounded-xl border-t md:border-t-0 border-l border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assessed</p>
            <p className="text-3xl font-extrabold text-slate-800">{assessedPatients.length} <span className="text-sm text-slate-400 font-medium tracking-normal">/ {patients.length}</span></p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Alerts Column */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="flex w-3 h-3 relative">
                  {criticalCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full w-3 h-3 ${criticalCount > 0 ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                </span>
                Priority Action Items
              </h2>
              {alerts.length > 0 && (
                <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                  {alerts.length} Active Alerts
                </span>
              )}
            </div>
            <AlertPanel alerts={alerts} loading={loading} />
          </div>

          {/* Patients Column */}
          <div className="space-y-6">
            <PatientList patients={patients} loading={loading} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
