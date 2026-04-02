import { useState } from 'react';
import api from '../../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function HealthSummary({ profile, latestAssessment, onReadingLogged }) {
  const [showModal, setShowModal] = useState(false);
  const [readingType, setReadingType] = useState('BLOOD_SUGAR');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogReading = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/readings', {
        type: readingType,
        value: Number(value),
        unit: readingType === 'BLOOD_SUGAR' ? 'mg/dL' : 'mmHg'
      });
      setShowModal(false);
      setValue('');
      if (onReadingLogged) onReadingLogged();
    } catch (err) {
      console.error(err);
      alert('Failed to log reading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-primary"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Health Overview</h2>
          <p className="text-sm text-slate-500">Your latest metrics</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Log Reading
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">BMI</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-800">
              {profile ? (profile.weight / Math.pow(profile.height/100, 2)).toFixed(1) : '--'}
            </span>
          </div>
        </div>

        {/* AI Risk Card */}
        <div className={`p-4 rounded-xl border ${latestAssessment?.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-100' : latestAssessment?.riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-100' : 'bg-primary-50 border-primary-100'}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">AI Risk Level</p>
          <div className="flex items-end gap-2">
            <span className={`text-2xl font-bold ${latestAssessment?.riskLevel === 'CRITICAL' ? 'text-red-700' : latestAssessment?.riskLevel === 'HIGH' ? 'text-orange-700' : 'text-primary-700'}`}>
              {latestAssessment ? latestAssessment.riskLevel : 'Untested'}
            </span>
          </div>
        </div>
      </div>

      {/* Log Modal (Simple implementation) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Log New Reading</h3>
            <form onSubmit={handleLogReading} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full border rounded-lg p-2"
                  value={readingType}
                  onChange={e => setReadingType(e.target.value)}
                >
                  <option value="BLOOD_SUGAR">Blood Sugar (mg/dL)</option>
                  <option value="BLOOD_PRESSURE_SYSTOLIC">Systolic BP</option>
                  <option value="WEIGHT">Weight (kg)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <input 
                  type="number" 
                  step="0.1"
                  required 
                  className="w-full border rounded-lg p-2"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
