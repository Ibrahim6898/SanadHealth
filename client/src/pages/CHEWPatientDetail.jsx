import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeftIcon, PhoneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CHEWPatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await api.get(`/chew/patients/${id}`);
        setPatient(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading patient profile...</div>;
  if (!patient) return <div className="p-8 text-center text-red-500">Patient not found or unauthorized.</div>;

  const profile = patient.profile;
  const latestAssessment = patient.assessments?.[0];

  const riskColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/chew" className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-sm text-slate-500">{profile?.lga}, {profile?.state}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">
              Mark as Visited
            </button>
            <a href={`tel:${patient.phone}`} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700">
              <PhoneIcon className="w-4 h-4" /> Call Patient
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & History */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Demographics</h2>
            {profile ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block">Age</span><span className="font-semibold">{profile.age}</span></div>
                <div><span className="text-slate-500 block">Gender</span><span className="font-semibold">{profile.gender}</span></div>
                <div><span className="text-slate-500 block">BMI</span><span className="font-semibold">{(profile.weight / Math.pow(profile.height/100, 2)).toFixed(1)}</span></div>
                <div><span className="text-slate-500 block">Smoker</span><span className="font-semibold">{profile.smoker ? 'Yes' : 'No'}</span></div>
              </div>
            ) : (
              <div className="text-amber-600 text-sm">Profile incomplete</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Assessment History</h2>
            <div className="space-y-3">
              {patient.assessments?.map(a => (
                <div key={a.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                  <span className="text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${riskColors[a.riskLevel]}`}>
                    {a.riskLevel}
                  </span>
                </div>
              ))}
              {patient.assessments?.length === 0 && <p className="text-sm text-slate-500">No assessments taken yet.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Status & Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {latestAssessment && (
            <div className={`rounded-2xl border p-6 shadow-sm ${latestAssessment.riskLevel === 'CRITICAL' ? 'bg-red-50 border-red-200' : latestAssessment.riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {latestAssessment.riskLevel === 'CRITICAL' || latestAssessment.riskLevel === 'HIGH' ? (
                    <ExclamationTriangleIcon className={`w-6 h-6 ${latestAssessment.riskLevel === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'}`} />
                  ) : (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  )}
                  <h2 className="text-lg font-bold text-slate-900">Latest AI Diagnosis</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${riskColors[latestAssessment.riskLevel]}`}>
                  {latestAssessment.riskLevel} RISK (Score: {latestAssessment.riskScore})
                </span>
              </div>
              <p className="text-slate-800 font-medium bg-white/50 p-4 rounded-xl text-sm leading-relaxed border border-white/60 mb-4">
                "{latestAssessment.aiRecommendation}"
              </p>
              {latestAssessment.urgentCare && (
                <div className="text-red-700 font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  Flagged for Urgent Care/Referral
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-xs">Recent Health Readings (Vitals)</h2>
            {/* In a real app we would pass patient specific readings to the Chart, but for the demo we'll just reuse the generic component or list them */}
            {patient.readings?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3 rounded-r-lg">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.readings.map(r => (
                      <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{r.type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold">{r.value}</span>
                          {r.secondValue && <span className="font-bold"> / {r.secondValue}</span>}
                          <span className="text-xs text-slate-500 ml-1">{r.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm p-4 text-center">No vitals logged recently.</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
