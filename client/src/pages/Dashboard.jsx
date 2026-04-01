import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import HealthSummary from '../components/Dashboard/HealthSummary';
import ReadingChart from '../components/Dashboard/ReadingChart';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [meRes, assessRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/assessments')
        ]);
        setProfile(meRes.data.profile);
        setAssessments(assessRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;
  }

  const latestAssessment = assessments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name}</h1>
          <p className="text-slate-500 mt-1">Here is your health snapshot for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/assessment"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-primary-700 transition"
          >
            Take Assessment
          </Link>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">
            Sign out
          </button>
        </div>
      </div>

      {!profile && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-8 flex justify-between items-center">
          <div>
            <h3 className="font-bold">Complete your profile</h3>
            <p className="text-sm">You need a complete health profile before taking AI assessments.</p>
          </div>
          {/* We'll skip building the full profile form for time, assume user enters dummy data or we auto-gen via API */}
          <button className="bg-amber-600 px-4 py-2 rounded-lg text-white font-medium text-sm">Setup Profile</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <HealthSummary profile={profile} latestAssessment={latestAssessment} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Blood Sugar Trends</h2>
            <ReadingChart />
          </div>
        </div>

        <div className="space-y-8">
          {/* AI Advice Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary-500/20 blur-2xl"></div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">✨</span> Claude Advice
            </h2>
            
            {latestAssessment ? (
              <div className="mt-4">
                <p className="text-slate-200 text-sm leading-relaxed mb-4">
                  "{latestAssessment.aiRecommendation}"
                </p>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wide">Action Items</h4>
                  <ul className="space-y-2">
                    {(latestAssessment.recommendations || []).map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-primary-400">•</span>
                        <span className="text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-slate-400 text-sm">
                Take your first health assessment to receive AI-powered personalized recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
