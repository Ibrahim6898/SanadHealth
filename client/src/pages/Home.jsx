import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, ChartBarIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'AI Risk Assessment',
    description: 'Get instant feedback on your diabetes and hypertension risks using our advanced medical AI trained for the Nigerian context.',
    icon: ChartBarIcon,
  },
  {
    name: 'CHEW Monitoring',
    description: 'Community Health Extension Workers can monitor high-risk patients remotely and receive instant SMS alerts for critical readings.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Daily Tracking',
    description: 'Log your blood sugar, blood pressure, and weight daily to visualize your health trends over time with easy-to-read charts.',
    icon: HeartIcon,
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to={user.role === 'CHEW' ? '/chew' : '/dashboard'} replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-primary-200">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/50 text-primary-700 text-sm font-semibold tracking-wide mb-8 border border-primary-200/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Now powered by Gemini AI
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
              Preventive Care, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-500">
                Reimagined.
              </span>
            </h1>
            
            <p className="text-lg leading-relaxed text-slate-600 mb-10 max-w-xl">
              SanadHealth connects patients with intelligent risk assessments and Community Health Extension Workers (CHEWs) for proactive management of hypertension and diabetes in Nigeria.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/register"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary-600 px-8 py-4 text-white font-semibold transition-all hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5"
              >
                <span>Take Assessment Free</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 px-6 py-4 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-sm font-medium text-slate-500">Trusted by:</span>
              {/* Dummy logos */}
              <div className="h-6 w-24 bg-slate-300 rounded opacity-50 block"></div>
              <div className="h-6 w-20 bg-slate-300 rounded opacity-50 block"></div>
              <div className="h-6 w-28 bg-slate-300 rounded opacity-50 block"></div>
            </div>
          </motion.div>

          {/* Right Image/Dashboard Mockup Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative hidden xl:block"
          >
            {/* Main Floating Image */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/40 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent z-10 pointer-events-none mix-blend-overlay"></div>
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80" 
                alt="Medical Professional using AI tablet" 
                className="w-full h-[600px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Floating Glass UI Card 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-12 top-24 bg-white/80 p-5 rounded-2xl shadow-xl border border-white/60 backdrop-blur-xl max-w-[220px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <HeartIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Blood Pressure</p>
                  <p className="font-bold text-slate-900 leading-none">120/80</p>
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">✓ Normal range</p>
            </motion.div>

            {/* Floating Glass UI Card 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-8 bottom-32 bg-slate-900/90 p-5 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl text-white max-w-[240px]"
            >
              <h4 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-1">✨ AI Risk Analysis</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Based on recent updates, patient diabetes risk is <span className="text-yellow-400 font-bold">Medium</span>. Recommend increasing light exercise.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Modern Feature Grid */}
      <div className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8">
          <div className="mb-16">
            <h2 className="text-sm font-extrabold tracking-widest uppercase text-primary-600 mb-3">Intelligent Infrastructure</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900">
              Complete patient lifecycle management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
