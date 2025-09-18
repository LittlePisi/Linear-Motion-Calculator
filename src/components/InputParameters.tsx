import React from 'react';
import { MotionParameters } from '../types';
import { Settings, ArrowUp, ArrowRight } from 'lucide-react';
import LMComboBox, { ParameterSet } from './LinearModuleCombobox';
import GBComboBox, { GParameterSet } from './GearboxCombobox';
import MTComboBox, {MTParameterSet} from './MotorCombobox';

interface InputParametersProps {
  params: MotionParameters;
  setParams: React.Dispatch<React.SetStateAction<MotionParameters>>;
  darkMode: boolean;
}

const toNum = (v: string | number | undefined): number => {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (!v) return 0;
  // normalize: "5,0 мм/об" -> "5.0"
  const normalized = v.replace(',', '.').replace(/[^0-9eE\+\-\.]/g, '');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

const InputParameters: React.FC<InputParametersProps> = ({ params, setParams, darkMode }) => {
  const handleInputChange = (key: keyof MotionParameters, value: string) => {
    const numValue = toNum(value);
    setParams(prev => ({ ...prev, [key]: numValue }));
  };

  // Linear module -> update only LM-related fields
  const handleLMSelect = (sel: ParameterSet | undefined) => {
    if (!sel) {
      setParams(prev => ({ ...prev, selectedLMSetName: '' }));
      return;
    }
    setParams(prev => ({
      ...prev,
      selectedLMSetName: sel.name,
      lead: toNum(sel.lead),
      M_idleTorque: toNum(sel.M_idleTorque),
      M_zsInertia: toNum(sel.M_zsInertia),
      M_pmInertia: toNum(sel.M_pmInertia),
      M_maxTorque: toNum(sel.M_maxTorque),
      ScrewDLR: toNum(sel.ScrewDLR),
      Screw_dr: toNum(sel.Screw_dr),
      Screw_la: toNum(sel.Screw_la),
    }));
  };

  // Gearbox -> update only GB-related fields
  const handleGBSelect = (sel: GParameterSet | undefined) => {
    if (!sel) {
      setParams(prev => ({ ...prev, selectedGBSetName: '' }));
      return;
    }
    setParams(prev => ({
      ...prev,
      selectedGBSetName: sel.name,
      reductionRatio: toNum(sel.reductionRatio),
      G_idleTorque: toNum(sel.G_idleTorque),
      G_Inertia: toNum(sel.G_Inertia),
      G_eff: toNum(sel.G_eff),
      G_maxTorque: toNum(sel.G_maxTorque),
    }));
  };


    // Gearbox -> update only GB-related fields
  const handleMTSelect = (sel: MTParameterSet | undefined) => {
    if (!sel) {
      setParams(prev => ({ ...prev, selectedGBSetName: '' }));
      return;
    }
    setParams(prev => ({
      ...prev,
      selectedMTSetName: sel.name,
      M_nom: toNum(sel.M_nom),
      N_nom: toNum(sel.N_nom),
      M_max: toNum(sel.M_max),
      N_max: toNum(sel.N_max),
      motorRotorInertia: toNum(sel.motorRotorInertia),
      M_torqueConstant: toNum(sel.M_torqueConstant),
      M_fp: toNum(sel.M_fp),
      N_fp: toNum(sel.N_fp),
      N_d: toNum(sel.N_d),
    }));
  };

  const commonParameters = [
    { label: 'Рабочий ход', key: 'stroke', unit: 'мм', step: 10, min: 0 },
    { label: 'Перемещаемая масса', key: 'mass', unit: 'кг', step: 1, min: 0 },
    { label: 'Внешнее усилие', key: 'externalForce', unit: 'Н', step: 10, min: 0 },
//    { label: 'Момент холостого хода', key: 'idleTorque', unit: 'Н⋅м', step: 0.1, min: 0 },
//    { label: 'Постоянная подачи', key: 'lead', unit: 'мм/об', step: 1, min: 0 },
//    { label: 'Внешняя инерция', key: 'externalInertia', unit: 'кг⋅cм²', step: 0.01, min: 0 },
//    { label: 'Передаточное число', key: 'reductionRatio', unit: ':1', step: 1, min: 0 },
//    { label: 'Инерция двигателя', key: 'motorRotorInertia', unit: 'кг⋅cм²', step: 0.01, min: 0 },
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
          <h2 className={`text-xl pb-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Ввод параметров
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 items-center ">
          <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300  border-gray-600' : 'text-gray-700  border-gray-300'}`}>Ориентация</label>
          <button
            onClick={() => setParams(prev => ({ ...prev, isVertical: !prev.isVertical }))}
            className={`flex items-center gap-1 w-2/3 px-3 py-1.5 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
            title={params.isVertical ? 'Vertical Application' : 'Horizontal Application'}
          >
            {params.isVertical ? <ArrowUp className="w-30 h-4" /> : <ArrowRight className="w-30 h-4" />}
            <span className="hidden sm:inline">{params.isVertical ? 'Вертикальный' : 'Горизонтальный'}</span>
          </button>
        </div>

        <div className="flex gap-2 items-center ">
          <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Метод расчёта</label>
          <button
            onClick={() => setParams(prev => ({ ...prev, useMaxSpeedMode: !prev.useMaxSpeedMode }))}
            className={`flex items-center w-2/3 gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-30 h-4" />
            <span className="hidden sm:inline">{params.useMaxSpeedMode ? 'Максимальная скорость' : 'Время перемещения'}</span>
          </button>
        </div>

        {/* Linear Module */}
        <LMComboBox
          onSelectSet={handleLMSelect}
          darkMode={darkMode}
          selectedSetName={params.selectedLMSetName}
          setSelectedSetName={(name) => setParams(prev => ({ ...prev, selectedLMSetName: name }))}
        />

        {/* Gearbox */}
        <GBComboBox
          onSelectSet={handleGBSelect}
          darkMode={darkMode}
          selectedGBSetName={params.selectedGBSetName}
          setSelectedSetName={(name) => setParams(prev => ({ ...prev, selectedGBSetName: name }))}
        />

        {/* Motor */}
        <MTComboBox
          onSelectSet={handleMTSelect}
          darkMode={darkMode}
          selectedMTSetName={params.selectedMTSetName}
          setSelectedSetName={(name) => setParams(prev => ({ ...prev, selectedMTSetName: name }))}
        />

        {(params.useMaxSpeedMode ? maxSpeedParameters : travelTimeParameters).map(({ label, key, unit, step, min }) => (
          <div key={key} className="flex items-center gap-2">
            <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
            <div className="flex-1 relative">
              <input
                type="number"
                value={(params as any)[key] ?? ''}
                onChange={(e) => handleInputChange(key as keyof MotionParameters, e.target.value)}
                step={step}
                min={min}
                className={`w-full pl-3 pr-3 py-1.5 rounded-lg outline-none transition-colors ${
                  darkMode ? 'bg-gray-700 border border-gray-600 text-gray-200 focus:border-gray-500'
                           : 'border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {unit}
              </span>
            </div>
          </div>
        ))}

        {commonParameters.map(({ label, key, unit, step, min }) => (
          <div key={key} className="flex items-center gap-2">
            <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
            <div className="flex-1 relative">
              <input
                type="number"
                value={(params as any)[key] ?? ''}
                onChange={(e) => handleInputChange(key as keyof MotionParameters, e.target.value)}
                step={step}
                min={min}
                className={`w-full pl-3 pr-3 py-1.5 rounded-lg outline-none transition-colors ${
                  darkMode ? 'bg-gray-700 border border-gray-600 text-gray-200 focus:border-gray-500'
                           : 'border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
