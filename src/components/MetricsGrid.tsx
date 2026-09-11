import React from 'react';
import { MetricScores } from '../types';
import {
  Presentation,
  Shield,
  Fan,
  Smartphone,
  Moon,
  LogOut,
  Users,
  Armchair,
  HelpCircle,
  Eye,
  Coffee
} from 'lucide-react';

interface MetricsGridProps {
  metrics: MetricScores;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const items = [
    {
      label: 'Board Visibility',
      value: metrics.board_visibility,
      icon: Presentation,
      color: 'text-blue-400',
      bg: 'bg-blue-500',
      desc: 'Angular alignment and line of sight to blackboard'
    },
    {
      label: 'Teacher Safety',
      value: metrics.teacher_safety,
      icon: Shield,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500',
      desc: 'Euclidean distance from podium authority vectors'
    },
    {
      label: 'Fan Exposure',
      value: metrics.fan_exposure,
      icon: Fan,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500',
      desc: 'Bernoulli airflow index from ceiling fan rotation'
    },
    {
      label: 'Phone Safety',
      value: metrics.phone_safety,
      icon: Smartphone,
      color: 'text-purple-400',
      bg: 'bg-purple-500',
      desc: 'Calculates occupied human shields blocking line of sight'
    },
    {
      label: 'Sleep Potential',
      value: metrics.sleep_potential,
      icon: Moon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500',
      desc: 'Optimal combination of air cooling & perimeter stealth'
    },
    {
      label: 'Escape Probability',
      value: metrics.escape_probability,
      icon: LogOut,
      color: 'text-amber-400',
      bg: 'bg-amber-500',
      desc: 'Rapid sprint velocity to emergency exit door'
    },
    {
      label: 'Friend Proximity',
      value: metrics.friend_proximity,
      icon: Users,
      color: 'text-pink-400',
      bg: 'bg-pink-500',
      desc: 'Harmonic mean distance to tagged study buddies'
    },
    {
      label: 'Question Probability',
      value: metrics.question_probability,
      icon: HelpCircle,
      color: metrics.question_probability > 40 ? 'text-rose-400' : 'text-emerald-400',
      bg: metrics.question_probability > 40 ? 'bg-rose-500' : 'bg-emerald-500',
      desc: 'Likelihood of professor asking you to solve Problem 4'
    },
    {
      label: 'Teacher Detection Risk',
      value: metrics.teacher_detection_risk,
      icon: Eye,
      color: metrics.teacher_detection_risk > 30 ? 'text-amber-400' : 'text-emerald-400',
      bg: metrics.teacher_detection_risk > 30 ? 'bg-amber-500' : 'bg-emerald-500',
      desc: 'Probability of getting caught texting under the desk'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-slate-800 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-300">{item.label}</span>
              </div>
              <span className={`text-base font-mono font-black ${item.color}`}>
                {item.value.toFixed(2)}%
              </span>
            </div>

            {/* Meter Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full ${item.bg} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-500 leading-tight">
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
