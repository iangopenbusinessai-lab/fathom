import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { ColregsQuestion, CATEGORY_LABELS } from '../constants';

interface ScenarioCardProps {
  question: ColregsQuestion;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  question,
  selectedAnswer,
  onSelect,
}) => {
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const getOptionStyle = (option: string): string => {
    if (!isAnswered) {
      return 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-500/50 text-white cursor-pointer';
    }
    if (option === question.correctAnswer) {
      return 'border-green-500/60 bg-green-950/40 text-green-200 cursor-default shadow-[0_0_15px_rgba(34,197,94,0.15)]';
    }
    if (option === selectedAnswer) {
      return 'border-orange-600/60 bg-orange-950/30 text-orange-300 cursor-default shadow-[0_0_15px_rgba(234,88,12,0.15)]';
    }
    return 'border-slate-800/50 bg-slate-900/30 text-slate-600 cursor-default opacity-40';
  };

  const getOptionIcon = (option: string) => {
    if (!isAnswered) return <span className="w-4 h-4 shrink-0" />;
    if (option === question.correctAnswer) {
      return <CheckCircle size={15} className="text-green-400 shrink-0" />;
    }
    if (option === selectedAnswer) {
      return <XCircle size={15} className="text-orange-400 shrink-0" />;
    }
    return <span className="w-4 h-4 shrink-0" />;
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* Category + Prompt */}
      <div className="px-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 font-mono">
          {CATEGORY_LABELS[question.category]}
        </div>
        <p className="text-white text-lg md:text-xl font-semibold leading-snug">
          {question.prompt}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => !isAnswered && onSelect(option)}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium ${getOptionStyle(option)}`}
          >
            {getOptionIcon(option)}
            <span>{option}</span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div
          className={`px-4 py-3 rounded-xl border text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-400 ${
            isCorrect
              ? 'border-green-900/50 bg-green-950/20 text-green-200/80'
              : 'border-orange-900/40 bg-orange-950/10 text-orange-200/70'
          }`}
        >
          <span className={`font-bold mr-1 ${isCorrect ? 'text-green-400' : 'text-orange-400'}`}>
            {isCorrect ? 'Correct.' : 'Incorrect.'}
          </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
};
