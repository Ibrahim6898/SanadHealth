import { UserCircleIcon, PhoneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function PatientList({ patients, loading }) {
  const [search, setSearch] = useState('');

  if (loading) return <div className="text-slate-500 p-4">Loading assigned patients...</div>;
  if (patients.length === 0) return <div className="text-slate-500 p-4">No patients assigned to you yet.</div>;

  const filteredPatients = patients.filter(p => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.profile?.lga || '').toLowerCase().includes(q);
  });

  const riskColors = {
    CRITICAL: 'bg-red-100 text-red-800 border bg-red-500',
    HIGH: 'bg-orange-100 text-orange-800 border bg-orange-500',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border bg-yellow-500',
    LOW: 'bg-green-100 text-green-800 border bg-green-500'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Your Patients</h2>
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
            {patients.length} Total
          </span>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or LGA..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>
      
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {filteredPatients.map(patient => {
          const latestAssessment = patient.assessments?.[0];
          
          return (
            <div key={patient.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                  <UserCircleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    {patient.name}
                    {latestAssessment && (
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${latestAssessment.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : latestAssessment.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {latestAssessment.riskLevel}
                      </span>
                    )}
                  </h3>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {patient.phone || 'No phone'}</span>
                    {patient.profile && <span>• {patient.profile.age}y {patient.profile.gender[0]}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex sm:flex-col items-center justify-between sm:items-end gap-2 text-sm w-full sm:w-auto">
                <div className="text-right">
                  {patient.profile ? (
                    <div className="text-slate-700 font-medium text-xs">{patient.profile.lga}, {patient.profile.state}</div>
                  ) : (
                    <div className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium border border-amber-200">Profile Incomplete</div>
                  )}
                  {latestAssessment && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      Assessed: {formatDistanceToNow(new Date(latestAssessment.createdAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
                <Link 
                  to={`/chew/patient/${patient.id}`}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm shrink-0"
                >
                  View File
                </Link>
              </div>
            </div>
          );
        })}
        {filteredPatients.length === 0 && search && (
          <div className="p-8 text-center text-slate-500 text-sm">No patients matched "{search}"</div>
        )}
      </div>
    </div>
  );
}
