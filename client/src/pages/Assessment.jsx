import { useState, useEffect } from 'react';
import QuestionFlow from '../components/Assessment/QuestionFlow';
import RiskResult from '../components/Assessment/RiskResult';
import api from '../services/api';
import { Navigate } from 'react-router-dom';

export default function Assessment() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssessmentComplete = async (responses) => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/ai/assess', { responses });
      setResult(data.assessment);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate assessment. Did you complete your profile first?');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-xl max-w-lg text-center">
          <h2 className="text-xl font-bold mb-2">Assessment Error</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.href='/dashboard'}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return <RiskResult result={result} />;
  }

  return <QuestionFlow onComplete={handleAssessmentComplete} loading={loading} />;
}
