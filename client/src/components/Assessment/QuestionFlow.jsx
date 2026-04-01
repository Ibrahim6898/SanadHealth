import { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  {
    id: 'frequentUrination',
    text: 'Do you urinate more frequently than usual, especially at night?',
    type: 'boolean'
  },
  {
    id: 'excessiveThirst',
    text: 'Do you feel unusually thirsty or hungry, even after drinking/eating?',
    type: 'boolean'
  },
  {
    id: 'visionChanges',
    text: 'Have you experienced any recent blurry vision?',
    type: 'boolean'
  },
  {
    id: 'headaches',
    text: 'Do you experience frequent or severe headaches?',
    type: 'boolean'
  },
  {
    id: 'fatigue',
    text: 'Do you feel extremely tired or fatigued without a clear reason?',
    type: 'boolean'
  },
  {
    id: 'chestPain',
    text: 'Have you felt any tightness, pressure, or pain in your chest recently?',
    type: 'boolean'
  }
];

export default function QuestionFlow({ onComplete, loading }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});

  const handleAnswer = (value) => {
    const currentQ = questions[currentIdx];
    const newResponses = { ...responses, [currentQ.id]: value };
    setResponses(newResponses);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(newResponses);
    }
  };

  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 h-full flex flex-col justify-center">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2 font-medium">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <motion.div 
        key={currentIdx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center min-h-[300px] flex flex-col justify-center"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed">
          {questions[currentIdx].text}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <button
            disabled={loading}
            onClick={() => handleAnswer(false)}
            className="py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            No
          </button>
          <button
            disabled={loading}
            onClick={() => handleAnswer(true)}
            className="py-4 rounded-xl border-2 border-primary-500 text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            Yes
          </button>
        </div>
      </motion.div>
      
      {loading && (
        <div className="mt-8 text-center text-slate-500 animate-pulse font-medium">
          Consulting AI Assistant...
        </div>
      )}
    </div>
  );
}
