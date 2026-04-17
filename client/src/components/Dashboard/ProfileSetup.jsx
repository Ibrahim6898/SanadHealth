import { useState } from 'react';
import api from '../../services/api';

export default function ProfileSetup({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    lga: '',
    state: '',
    familyHistory: false,
    smoker: false,
    activityLevel: 'MODERATE',
    dietType: 'BALANCED'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put('/users/profile', {
        ...formData,
        age: parseInt(formData.age, 10),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight)
      });
      onComplete(); // Trigger Dashboard refresh
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-lg mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Complete Your Health Profile</h2>
        <p className="text-sm text-slate-500 mt-2">
          We need a few baseline metrics before you can access your personalized AI risk assessment or monitor your stats.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
            <input 
              required type="number" name="age" 
              value={formData.age} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              placeholder="e.g. 45" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
            <select 
              name="gender" value={formData.gender} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Height (cm)</label>
            <input 
              required type="number" name="height" 
              value={formData.height} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              placeholder="e.g. 175" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Weight (kg)</label>
            <input 
              required type="number" name="weight" 
              value={formData.weight} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              placeholder="e.g. 70" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
            <input 
              required type="text" name="state" 
              value={formData.state} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              placeholder="e.g. Kano" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">LGA</label>
            <input 
              required type="text" name="lga" 
              value={formData.lga} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
              placeholder="e.g. Dala" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Activity Level</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all">
              <option value="SEDENTARY">Sedentary</option>
              <option value="LIGHT">Light</option>
              <option value="MODERATE">Moderate</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Diet Type</label>
            <select name="dietType" value={formData.dietType} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all">
              <option value="BALANCED">Balanced</option>
              <option value="HIGH_CARB">High Carb</option>
              <option value="HIGH_PROTEIN">High Protein</option>
              <option value="VEGETARIAN">Vegetarian</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
            <input type="checkbox" name="smoker" checked={formData.smoker} onChange={(e) => setFormData({...formData, smoker: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
            Smoker
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
            <input type="checkbox" name="familyHistory" checked={formData.familyHistory} onChange={(e) => setFormData({...formData, familyHistory: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" />
            Family History of Diabetes/Hypertension
          </label>
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 mt-6 rounded-xl transition-all shadow-md shadow-primary-600/20 disabled:opacity-50"
        >
          {loading ? 'Saving Profile...' : 'Save Health Profile'}
        </button>
      </form>
    </div>
  );
}
