import React from 'react';

/**
 * StatCard — Reusable card for displaying a single dashboard metric.
 *
 * Props:
 *  - icon      : React element (Lucide icon)
 *  - label     : string  — metric name
 *  - value     : number  — metric value
 *  - color     : string  — Tailwind color name (blue, green, yellow, red, purple, indigo, orange, teal)
 *  - subText   : string  — optional helper text shown below the value
 */
const colorMap = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   iconBg: 'bg-blue-100' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  iconBg: 'bg-green-100' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', iconBg: 'bg-yellow-100' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    iconBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', iconBg: 'bg-purple-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', iconBg: 'bg-indigo-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', iconBg: 'bg-orange-100' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200',   iconBg: 'bg-teal-100' },
};

const StatCard = ({ icon, label, value, color = 'blue', subText }) => {
  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${scheme.border} ${scheme.bg} p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-current" style={{ color: 'currentColor' }} />

      <div className="flex items-center gap-4">
        {/* Icon container */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${scheme.iconBg} ${scheme.text}`}>
          {icon}
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </span>
          <span className={`text-2xl font-extrabold ${scheme.text} leading-tight`}>
            {value ?? 0}
          </span>
          {subText && (
            <span className="text-xs text-gray-400 mt-0.5">{subText}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
