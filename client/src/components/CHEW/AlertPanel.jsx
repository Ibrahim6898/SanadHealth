import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/chew/alerts');
        setAlerts(data);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    // Poll for alerts every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-slate-500 p-4">Loading active alerts...</div>;

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-green-800 font-bold text-xl mb-1">All Clear</h3>
        <p className="text-green-600">None of your assigned patients currently have high or critical risk alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`rounded-xl p-5 border shadow-sm relative overflow-hidden ${
            alert.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className={`absolute top-0 left-0 w-1.5 h-full ${alert.riskLevel === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`} />
          
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              {alert.urgentCare ? (
                <ShieldExclamationIcon className={`w-6 h-6 ${alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} mt-1 flex-shrink-0`} />
              ) : (
                <ExclamationTriangleIcon className={`w-6 h-6 ${alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} mt-1 flex-shrink-0`} />
              )}
              
              <div>
                <h3 className={`font-bold ${alert.riskLevel === 'CRITICAL' ? 'text-red-900' : 'text-orange-900'} flex items-center gap-2`}>
                  {alert.user.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${alert.riskLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}`}>
                    {alert.riskLevel}
                  </span>
                </h3>
                <p className={`text-sm mt-1 ${alert.riskLevel === 'CRITICAL' ? 'text-red-700' : 'text-orange-700'} mb-3`}>
                  {alert.aiRecommendation}
                </p>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-slate-500">
                    Tested: {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </span>
                  <a href={`tel:${alert.user.phone}`} className="text-blue-600 hover:underline">
                    Call: {alert.user.phone || 'Unknown'}
                  </a>
                </div>
              </div>
            </div>
            
            <button className="bg-white border text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition">
              View Profile
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
