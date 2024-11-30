import React from 'react';
import { MotionParameters } from '../types';

interface GraphControlsProps {
  params: MotionParameters;
  setParams: (params: MotionParameters) => void;
  type: 'motion' | 'torque';
  darkMode: boolean;
}

const GraphControls: React.FC<GraphControlsProps> = ({ params, setParams, type, darkMode }) => {
  const controls = type === 'motion' 
    ? [
        { key: 'showVelocity', label: 'Velocity' },
        { key: 'showPosition', label: 'Position' }
      ]
    : [
        { key: 'showTorque', label: 'Torque' },
        { key: 'showRPM', label: 'RPM' }
      ];

  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {controls.map(({ key, label }) => (
        <label 
          key={key} 
          className={`flex items-center gap-2 cursor-pointer ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          <input
            type="checkbox"
            checked={params[key as keyof MotionParameters] as boolean}
            onChange={(e) => setParams({ ...params, [key]: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          {label}
        </label>
      ))}
    </div>
  );
};

export default GraphControls;