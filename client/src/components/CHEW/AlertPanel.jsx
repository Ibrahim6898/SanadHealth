import { ExclamationTriangleIcon, ShieldExclamationIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function AlertPanel({ alerts, loading }) {
  const [contactedIds, setContactedIds] = useState(new Set());

  const handleMarkContacted = (alertId) => {
    setContactedIds(prev => {
      const newSet = new Set(prev);
      newSet.add(alertId);
      return newSet;
    });
  };

  if (loading) return <div className="text-slate-500 p-4">Loading active alerts...</div>;

  const activeAlerts = alerts.filter(a => !contactedIds.has(a.id));

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-2xl p-8 text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-green-800 font-bold text-xl mb-1">All Clear</h3>
        <p className="text-green-600">None of your assigned patients currently have high or critical risk alerts.</p>
      </div>
    );
  }

  // Sort CRITICAL first, then HIGH, then by date newest first
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    if (a.riskLevel === 'CRITICAL' && b.riskLevel !== 'CRITICAL') return -1;
    if (a.riskLevel !== 'CRITICAL' && b.riskLevel === 'CRITICAL') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-4">
      {sortedAlerts.map(alert => (
        <div 
          key={alert.id} 
          className={`rounded-xl p-5 border shadow-sm relative overflow-hidden ${
            alert.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className={`absolute top-0 left-0 w-1.5 h-full ${alert.riskLevel === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'}`} />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="flex gap-3">
              {alert.urgentCare ? (
                <ShieldExclamationIcon className={`w-6 h-6 ${alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} mt-1 flex-shrink-0`} />
              ) : (
                <ExclamationTriangleIcon className={`w-6 h-6 ${alert.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} mt-1 flex-shrink-0`} />
              )}
              
              <div>
                <h3 className={`font-bold ${alert.riskLevel === 'CRITICAL' ? 'text-red-900' : 'text-orange-900'} flex items-center gap-2`}>
                  {alert.user.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${alert.riskLevel === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 'bg-orange-500'}`}>
                    {alert.riskLevel}
                  </span>
                </h3>
                <p className={`text-sm mt-1 ${alert.riskLevel === 'CRITICAL' ? 'text-red-700' : 'text-orange-700'} mb-3 leading-relaxed`}>
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
            
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              <Link 
                to={`/chew/patient/${alert.userId}`}
                className="flex-1 text-center bg-white border text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition"
              >
                View Profile
              </Link>
              <button 
                onClick={() => handleMarkContacted(alert.id)}
                className="flex-1 bg-green-50 text-green-700 border border-green-200 text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-green-100 transition"
              >
                Mark Contacted
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
