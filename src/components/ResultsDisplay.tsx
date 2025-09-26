import React from 'react';
import { MotionResults } from '../types';
import MotionGraph from './MotionGraph';
import MotorGraph from './MotorGraph';

interface ResultsDisplayProps {
  results: MotionResults | null;
  error: string;
  darkMode: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, error, darkMode }) => {
  if (error) {
    return (
      <div className={`p-6 rounded-xl  outline outline-2 outline-offset-0 outline-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <p className={`text-xl  font-semibold ${darkMode ? 'text-red-500' : 'text-red-500'}`}>Ошибка:</p>
        <p className={`text-md font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
      </div>
    );
  }

  if (!results) return null;

  const resultItems = [
    { label: 'Макс. скорость', value: results.maxVelocity.toFixed(2), unit: 'мм/с' },
//    ...(results.velocityAtMaxSpeed ? [{ label: 'Макс. скорось', value: results.velocityAtMaxSpeed.toFixed(2), unit: 'мм/с' }] : []),
    { label: 'Общее время цикла', value: results.totalCycleTime.toFixed(3), unit: 'с' },
    { label: 'Время ускорения', value: results.accelerationTime.toFixed(3), unit: 'с' },
    { label: 'Макс. момент двигателя', value: results.maxTorque.toFixed(2), unit: 'Н⋅м' },
    { label: 'Макс. скорость двигателя', value: results.maxRPM.toFixed(0), unit: 'об/мин' },
//    { label: 'Время паузы', value: results.pauseTime.toFixed(3), unit: 'с' },
    { label: 'Время на макс. скорости', value: results.constantVelocityTime.toFixed(3), unit: 'с' },
    
    { label: 'Ср.кв. момент двигателя', value: results.meanTorque.toFixed(2), unit: 'Н⋅м' },
    
    { label: 'Ср. скорость двигателя', value: results.meanRPM.toFixed(0), unit: 'об/мин' },
    { label: 'Время замедления', value: results.decelerationTime.toFixed(3), unit: 'с' },
    { label: 'Ср.кв. ток двигателя', value: results.rmsCurrent.toFixed(2), unit: 'А' },
    { label: 'Макс. ток двигателя', value: results.maxCurrent.toFixed(2), unit: 'А' },
//    { label: 'Загрузка привода', value: results.LM_loadRatio.toFixed(0), unit: '%' },
//    { label: 'Загрузка редуктора', value: results.GB_loadRatio.toFixed(0), unit: '%' },
//    { label: 'Загрузка двигателя', value: results.M_loadRatio.toFixed(0), unit: '%' },
//    { label: 'Тест: #*2', value: results.calcValue.toFixed(4), unit: '' },
//    { label: 'Acceleration torque', value: results.accelerationTorque.toFixed(3), unit: 'Н⋅м' },
//    { label: 'decelerationTorque', value: results.decelerationTorque.toFixed(3), unit: 'Н⋅м' },
//    { label: 'constantLoadTorque', value: results.constantLoadTorque.toFixed(2), unit: 'Н⋅м' },
//    { label: 'dynamicTorqueA', value: results.dynamicTorqueA.toFixed(3), unit: 'Н⋅м' },
//    { label: 'dynamicTorqueD', value: results.dynamicTorqueD.toFixed(3), unit: 'Н⋅м' },
//    { label: 'loadInertia', value: results.loadInertia.toFixed(3), unit: 'кг⋅м2' },
//    { label: 'angAcceleration', value: results.angAcceleration.toFixed(5), unit: 'рад⋅с2' },
//    { label: 'mrpm', value: results.mrpm.toFixed(5), unit: 'об/мин' },
//    { label: 'v1', value: results.v1.toFixed(5), unit: 'мм/с' },
//    { label: 'decelerationTorque', value: results.decelerationTorque.toFixed(3), unit: 'Н⋅м' },
    ...(results.maxSpeedStroke ? [{ label: 'Ход на макс. скорости', value: results.maxSpeedStroke.toFixed(2), unit: 'мм' }] : []),
//    ...(results.Ld ? [{ label: 'Ресурс ШВП', value: results.Ld.toFixed(2), unit: 'км' }] : []),
  ];

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md shadow-gray-500'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Результаты расчета
        </h3>
        
        <h3 className={`text-lg pt-2 font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Основные данные:
        </h3>

        <div className="grid grid-cols-3 gap-4">

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${results.LM_loadRatio > 90 ? darkMode ? 'bg-red-900' : 'bg-red-300' : ''}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Загрузка привода</p>
            <p className={`text-lg font-semibold ${results.LM_loadRatio > 90 ? 'text-red-600' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {results.LM_loadRatio.toFixed(0)} %
              {results.LM_loadRatio > 90 && (
                <span className="block text-sm font-normal">
                  Предупреждение: Не рекомендуется использование при загрузке 90% и выше
                </span>
              )}
            </p>
          </div>
          
          {results.GB_loadRatio > 0.001 && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${results.GB_loadRatio > 90 ? darkMode ? 'bg-red-900' : 'bg-red-300' : ''}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Загрузка редуктора</p>
              <p className={`text-lg font-semibold ${results.GB_loadRatio > 90 ? 'text-red-600' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {results.GB_loadRatio.toFixed(0)} %
                {results.GB_loadRatio > 90 && (
                  <span className="block text-sm font-normal">
                    Предупреждение: Не рекомендуется использование при загрузке 90% и выше
                  </span>
                )}
              </p>
            </div>
          )}

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${results.M_loadRatio > 90 ? darkMode ? 'bg-red-900' : 'bg-red-300' : ''}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Загрузка двигателя</p>
            <p className={`text-lg font-semibold ${results.M_loadRatio > 90 ? 'text-red-600' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {results.M_loadRatio.toFixed(0)} %
              {results.M_loadRatio > 90 && (
                <span className="block text-sm font-normal">
                  Предупреждение: Не рекомендуется использование при загрузке 90% и выше
                </span>
              )}
            </p>
          </div>
          
          {results.Ld ? 
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${results.Ld <= 200 ? darkMode ? 'bg-red-900' : 'bg-red-300' : ''}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ресурс ШВП</p>
            <p className={`text-lg font-semibold ${results.Ld <= 200 ? 'text-red-600' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {results.Ld <= 10000 && (results.Ld.toFixed(2))} 
              {results.Ld > 10000 && ("10.000+")} км
              {results.Ld <= 200 && (
                <span className="block text-sm font-normal">
                  Предупреждение: Крайне низкий ресурс ШВП
                </span>
              )}
            </p>
          </div>
          
          : ""}

          {results.mod_guideServiceLife ? 
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${results.mod_guideServiceLife <= 500 ? darkMode ? 'bg-red-900' : 'bg-red-300' : ''}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ресурс направляющей</p>
            <p className={`text-lg font-semibold ${results.mod_guideServiceLife <= 500 ? 'text-red-600' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {results.mod_guideServiceLife <= 10000 && (results.mod_guideServiceLife.toFixed(2))} 
              {results.mod_guideServiceLife > 10000 && ("10.000+")} км
              {results.mod_guideServiceLife <= 500 && (
                <span className="block text-sm font-normal">
                  Предупреждение: Крайне низкий ресурс направляющей
                </span>
              )}
            </p>
          </div>
          
          : ""}

          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${results.inertiaRatio > 15 ? darkMode ? 'bg-red-900' : 'bg-red-300' : ''}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Соотношение моментов инерции</p>
            
            <p className={`text-lg font-semibold ${results.inertiaRatio > 15 ? 'text-red-600' : darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {results.inertiaRatio.toFixed(2)}
              {results.inertiaRatio > 15 && (
                <span className="block text-sm font-normal">
                  Предупреждение: Высокое значение соотношения моментов инерции может привести к нестабильности системы
                </span>
              )}
            </p>
          </div>
             

        </div>

        <h3 className={`text-lg pt-3 font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Подробные данные:
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {resultItems.map(({ label, value, unit }) => (
            <div key={label} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</p>
              <p className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {value} {unit}
              </p>
            </div>
          ))}

      
      

        </div>
      </div>

      <div className="container hidden print:block mx-auto px-4 py-20">
        
      </div>

      {results && (
        <div className="space-y-8">
          <MotionGraph results={results} darkMode={darkMode} />
          
          <MotorGraph results={results} darkMode={darkMode} />
          
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;