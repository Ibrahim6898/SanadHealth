import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function RiskResult({ result }) {
  if (!result) return null;

  const isCritical = result.riskLevel === 'CRITICAL';
  const isHigh = result.riskLevel === 'HIGH';
  const isMedium = result.riskLevel === 'MEDIUM';

  const colorClasses = isCritical 
    ? { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', bar: 'bg-red-500' }
    : isHigh
      ? { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', bar: 'bg-orange-500' }
      : isMedium
        ? { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', bar: 'bg-yellow-500' }
        : { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', bar: 'bg-green-500' };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className={`rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-8 text-center relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-2 ${colorClasses.bar}`} />
        
        <div className="flex justify-center mb-6">
          {(isCritical || isHigh) ? (
            <ExclamationTriangleIcon className={`w-16 h-16 ${colorClasses.text}`} />
          ) : (
            <CheckCircleIcon className={`w-16 h-16 ${colorClasses.text}`} />
          )}
        </div>

        <h1 className={`text-3xl font-bold mb-2 ${colorClasses.text}`}>
          {result.riskLevel} Risk
        </h1>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
          {result.aiRecommendation}
        </p>

        {result.urgentCare && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-center justify-center gap-3 font-medium mb-8">
            <ShieldExclamationIcon className="w-6 h-6" />
            Please see a healthcare professional as soon as possible.
          </div>
        )}

        <div className="bg-white/60 rounded-xl p-6 text-left mb-8 backdrop-blur-sm border border-white/40">
          <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm">Actionable Recommendations</h3>
          <ul className="space-y-3">
            {result.recommendations?.map((rec, i) => (
              <li key={i} className="flex gap-3 text-slate-700">
                <span className={`font-bold ${colorClasses.text}`}>•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <Link 
          to="/dashboard"
          className="inline-block bg-white border border-slate-200 shadow-sm text-slate-700 font-semibold px-8 py-3 rounded-xl hover:bg-slate-50 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
