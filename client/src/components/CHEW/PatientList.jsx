import { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/chew/patients');
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <div className="text-slate-500 p-4">Loading assigned patients...</div>;
  if (patients.length === 0) return <div className="text-slate-500 p-4">No patients assigned to you yet.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Your Patients</h2>
        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
          {patients.length} Total
        </span>
      </div>
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {patients.map(patient => (
          <div key={patient.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <UserCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{patient.name}</h3>
                <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <PhoneIcon className="w-3 h-3" /> {patient.phone || 'No phone'}
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm">
              {patient.profile ? (
                <>
                  <div className="text-slate-700 font-medium">{patient.profile.lga}, {patient.profile.state}</div>
                  <div className="text-slate-500">{patient.profile.age} yrs • {patient.profile.gender}</div>
                </>
              ) : (
                <div className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium">Profile Incomplete</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
