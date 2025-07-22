import React from 'react';
import { MotionParameters } from '../types';
import { Settings, ArrowUp, ArrowRight } from 'lucide-react';

interface InputParametersProps {
  params: MotionParameters;
  setParams: (params: MotionParameters) => void;
  darkMode: boolean;
}

const InputParameters: React.FC<InputParametersProps> = ({ params, setParams, darkMode }) => {
  const handleInputChange = (key: keyof MotionParameters, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [key]: numValue });
    }
  };

  const commonParameters = [
    { label: 'Рабочий ход', key: 'stroke', unit: 'мм', step: 10, min: 0 },
    { label: 'Перемещаемая масса', key: 'mass', unit: 'кг', step: 0.1, min: 0 },
    { label: 'Внешнее усилие', key: 'externalForce', unit: 'Н', step: 1, min: 0 },
    { label: 'Момент холостого хода', key: 'idleTorque', unit: 'Н⋅м', step: 0.1, min: 0 },
    { label: 'Постоянная подачи', key: 'lead', unit: 'мм/об', step: 1, min: 0 },
    { label: 'Внешняя инерция', key: 'externalInertia', unit: 'кг⋅см²', step: 0.01, min: 0 },
    { label: 'Передаточное число', key: 'reductionRatio', unit: ':1', step: 0.1, min: 0 },
    { label: 'Инерция двигателя', key: 'motorRotorInertia', unit: 'кг⋅см²', step: 0.01, min: 0 },
    { label: 'Время паузы', key: 'pauseTime', unit: 'с', step: 0.1, min: 0 },
  ];

  const travelTimeParameters = [
    { label: 'Время перемещения', key: 'travelTime', unit: 'с', step: 0.1, min: 0 },
    { label: 'Ускорение', key: 'acceleration', unit: 'мм/с²', step: 100, min: 0 },
    { label: 'Замедление', key: 'deceleration', unit: 'мм/с²', step: 100, min: 0 },
  ];

  const maxSpeedParameters = [
    { label: 'Макс. скорость', key: 'maxSpeed', unit: 'мм/с', step: 10, min: 0 },
    { label: 'Ускорение', key: 'acceleration', unit: 'мм/с²', step: 100, min: 0 },
    { label: 'Замедление', key: 'deceleration', unit: 'мм/с²', step: 100, min: 0 },
  ];

  return (
    <div className={`rounded-xl shadow-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Ввод параметров
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setParams({ ...params, isVertical: !params.isVertical })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={params.isVertical ? 'Vertical Application' : 'Horizontal Application'}
            >
              {params.isVertical ? <ArrowUp className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setParams({ ...params, useMaxSpeedMode: !params.useMaxSpeedMode })}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">
                {params.useMaxSpeedMode ? 'Время перемещения' : 'Максимальная скорость'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Mode-specific parameters */}
        {(params.useMaxSpeedMode ? maxSpeedParameters : travelTimeParameters).map(({ label, key, unit, step, min }) => (
          <div key={key} className="flex items-center gap-2">
            <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </label>
            <div className="flex-1 relative">
              <input
                type="number"
                value={params[key as keyof MotionParameters] || ''}
                onChange={(e) => handleInputChange(key as keyof MotionParameters, e.target.value)}
                step={step}
                min={min}
                className={`w-full pl-3 pr-3 py-1.5 rounded-lg outline-none transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-gray-500'
                    : 'border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {unit}
              </span>
            </div>
          </div>
        ))}

        {/* Common parameters */}
        {commonParameters.map(({ label, key, unit, step, min }) => (
          <div key={key} className="flex items-center gap-2">
            <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </label>
            <div className="flex-1 relative">
              <input
                type="number"
                value={params[key as keyof MotionParameters] || ''}
                onChange={(e) => handleInputChange(key as keyof MotionParameters, e.target.value)}
                step={step}
                min={min}
                
                className={`w-full pl-3 pr-3 py-1.5 rounded-lg outline-none transition-colors ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-gray-500'
                    : 'border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputParameters;
