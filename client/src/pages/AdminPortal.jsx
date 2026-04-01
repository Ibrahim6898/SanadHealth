import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPortal() {
  const { user } = useAuth();
  const [data, setData] = useState({ patients: [], chews: [], assignments: [] });
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedChew, setSelectedChew] = useState('');

  const fetchAdminData = async () => {
    try {
      const res = await api.get('/admin/users');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedChew) return alert('Select both');
    try {
      await api.post('/admin/assign', { patientId: selectedPatient, chewId: selectedChew });
      alert('Assigned successfully!');
      setSelectedPatient('');
      setSelectedChew('');
      fetchAdminData();
    } catch (err) {
      alert('Failed to assign');
    }
  };

  const handleUnassign = async (patientId, chewId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    try {
      await api.post('/admin/unassign', { patientId, chewId });
      fetchAdminData();
    } catch (err) {
      alert('Failed to unassign');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Admin Portal...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 border-b pb-4">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">Welcome, System Administrator ({user?.name})</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Assignment Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-lg text-slate-800 mb-4">Assign Patient to CHEW</h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-600">Select Patient</label>
              <select className="w-full border rounded-lg px-4 py-2 bg-slate-50" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">-- Choose Patient --</option>
                {data.patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.profile ? `${p.profile.lga}, ${p.profile.state}` : 'Onboarding'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-slate-600">Select Health Worker (CHEW)</label>
              <select className="w-full border rounded-lg px-4 py-2 bg-slate-50" value={selectedChew} onChange={e => setSelectedChew(e.target.value)}>
                <option value="">-- Choose CHEW --</option>
                {data.chews.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="w-full bg-primary-600 text-white font-bold rounded-lg py-2 mt-2 hover:bg-primary-700">
              Create Assignment
            </button>
          </form>
        </div>

        {/* Existing Assignments */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-slate-800">Current Assignments</h2>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{data.assignments.length} Total</span>
          </div>
          
          <div className="space-y-3">
            {data.assignments.map(a => (
              <div key={`${a.chewId}-${a.patientId}`} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <span className="font-bold text-slate-700">{a.patient.name}</span>
                  <span className="text-slate-400 mx-2 text-sm">is monitored by</span>
                  <span className="font-bold text-primary-700">{a.chew.name}</span>
                </div>
                <button 
                  onClick={() => handleUnassign(a.patientId, a.chewId)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ))}
            {data.assignments.length === 0 && <p className="text-sm text-slate-500">No active assignments yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
