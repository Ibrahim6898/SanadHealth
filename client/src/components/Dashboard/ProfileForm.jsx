import { useState } from 'react';
import api from '../../services/api';

export default function ProfileForm({ onComplete }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
    state: 'Lagos',
    lga: 'Ikeja',
    familyHistory: false,
    smoker: false,
    activityLevel: 'SEDENTARY',
    dietType: 'BALANCED'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/profile', {
        ...formData,
        age: parseInt(formData.age, 10),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height)
      });
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Complete Your Health Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input type="number" required className="w-full border rounded-lg p-2" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select className="w-full border rounded-lg p-2" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input type="number" step="0.1" required className="w-full border rounded-lg p-2" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <input type="number" step="0.1" required className="w-full border rounded-lg p-2" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input type="text" required className="w-full border rounded-lg p-2" placeholder="Lagos" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LGA</label>
              <input type="text" required className="w-full border rounded-lg p-2" placeholder="Ikeja" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={formData.familyHistory} onChange={e => setFormData({...formData, familyHistory: e.target.checked})} />
              Family Diabetes/Hypertension
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={formData.smoker} onChange={e => setFormData({...formData, smoker: e.target.checked})} />
              Smoker
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Activity Level</label>
              <select className="w-full border rounded-lg p-2" value={formData.activityLevel} onChange={e => setFormData({...formData, activityLevel: e.target.value})}>
                <option value="SEDENTARY">Sedentary</option>
                <option value="LIGHT">Light</option>
                <option value="MODERATE">Moderate</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Diet Type</label>
              <select className="w-full border rounded-lg p-2" value={formData.dietType} onChange={e => setFormData({...formData, dietType: e.target.value})}>
                <option value="BALANCED">Balanced</option>
                <option value="HIGH_CARB">High Carb</option>
                <option value="HIGH_PROTEIN">High Protein</option>
                <option value="VEGETARIAN">Vegetarian</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
