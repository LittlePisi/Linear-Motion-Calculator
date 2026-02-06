import React from 'react';
import { MotionParameters } from '../types';
import { ArrowUp, ArrowRight, TimerReset, Gauge } from 'lucide-react';
import LMComboBox, { ParameterSet } from './LinearModuleCombobox';
import GBComboBox, { GParameterSet } from './GearboxCombobox';
import MTComboBox, {MTParameterSet} from './MotorCombobox';
import { Tooltip as ReactTooltip } from "react-tooltip";    



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
      mod_Mx: toNum(sel.mod_Mx),
      mod_My: toNum(sel.mod_My),
      mod_Mz: toNum(sel.mod_Mz),
      mod_lever: toNum(sel.mod_lever),
      mod_GSLM: toNum(sel.mod_GSLM),
      mod_Zd: toNum(sel.mod_Zd),
      mod_pic: sel.mod_pic,
      mod_maxSpeed: toNum(sel.mod_maxSpeed),
      mod_maxAcc: toNum(sel.mod_maxAcc),
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
      mot_pic: sel.mot_pic,
      mot_flangeSize: toNum(sel.mot_flangeSize),
      mot_wBrake: toNum(sel.mot_wBrake),
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

  const massleverParameters = [
    { label: 'X', key:'lever_Mx', unit: 'мм' },
    { label: 'Y', key:'lever_My', unit: 'мм' },
    { label: 'Z', key:'lever_Mz', unit: 'мм' },
  ]

  const forceleverParameters = [
    { label: 'X', key:'lever_Fx', unit: 'мм' },
    { label: 'Y', key:'lever_Fy', unit: 'мм' },
    { label: 'Z', key:'lever_Fz', unit: 'мм' },
  ]

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
    <div className={`rounded-xl shadow-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md shadow-gray-500'}`}>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl pb-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Расчётные параметры
          </h2>
        </div>
      </div>

      <div  className="space-y-2.5">
        <div data-tooltip-id="my-tooltip-5" className="flex gap-2 items-center">
          <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300  border-gray-600' : 'text-gray-700  border-gray-300'}`}>Ориентация</label>
          <button
            onClick={() => setParams(prev => ({ ...prev, isVertical: !prev.isVertical }))}
            className={`flex items-center gap-1 w-2/3 px-3 py-1.5 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            {params.isVertical ? <ArrowUp className="w-30 h-4" /> : <ArrowRight className="w-30 h-4" />}
            <span className="hidden sm:inline">{params.isVertical ? 'Вертикальный' : 'Горизонтальный'}</span>
          </button>
            <ReactTooltip
                id="my-tooltip-5"
                place="right-start"
                clickable
                style={{ 
                backgroundColor: '#00adef', 
                color: '#222', 
                padding: '1px', 
                margin: '0px',
                borderRadius: '6px',
                zIndex: 100,
                }}               
                opacity={1}
          >
            <div className={`flex z-50 flex-col gap-1 rounded-md p-2 mb-0 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-md shadow-gray-500 text-gray-700'}`}>
              <label className='font-extrabold py-1'>Ориентация расчётного перемещения</label>
              <label className='font-semibold'>Изменяет ориентацию расчётного перемещения.</label>
              <label className='font-semibold'>Указывает выбранную в данный момент ориентацию.</label>
              <div className="inline-flex items-center gap-2">

              </div>
              <img className="picture place-self-center" src={params.isVertical ? 'https://i.postimg.cc/mgyCwqKr/2025-09-29-16-26-04.png' : 'https://i.postimg.cc/Hk9X2KF1/2025-09-29-16-24-14.png'} width={params.isVertical ? "100" : "200"} height="50"/>
            </div>
          </ReactTooltip>

        </div>

        <div data-tooltip-id="my-tooltip-6" className="flex gap-2 items-center space-y-0">
          <label className={`text-sm w-1/3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Метод расчёта</label>
          <button
            onClick={() => setParams(prev => ({ ...prev, useMaxSpeedMode: !prev.useMaxSpeedMode }))}
            className={`flex items-center w-2/3 gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {params.useMaxSpeedMode ? <Gauge className="w-30 h-4" /> : <TimerReset className="w-30 h-4" />}
            
            <span className="hidden sm:inline">{params.useMaxSpeedMode ? 'Максимальная скорость' : 'Время перемещения'}</span>
          </button>

            <ReactTooltip
                id="my-tooltip-6"
                place="right-start"
                clickable
                style={{ 
                backgroundColor: '#00adef', 
                color: '#222', 
                padding: '1px', 
                margin: '0px',
                borderRadius: '6px' 
                
                }}               
                opacity={1}
          >
            <div className={`flex flex-col gap-1 rounded-md p-2 mb-0 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-md shadow-gray-500 text-gray-700'}`}>
              <label className='font-extrabold py-1'>Метода расчёта профиля перемещения</label>
              <label className='font-semibold'>Изменяет тип вводных данных для расчёта профиля перемещения.</label>
              <label className='font-semibold'>Доступно два режима:</label>
              <label className='font-semibold'>  t, a , d - время перемещения, ускорение, замедление</label>
              <label className='font-semibold'>  V, a , d - максимальная скорость, ускорение, замедление</label>
            </div>
          </ReactTooltip>
        </div>



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
      


        {/* Masslever */}
      <div data-tooltip-id="my-tooltip-1" className=" items-center gap-2 space-y-1.5">
        <label className={`text-sm w-1/6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Положение центра масс</label>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {massleverParameters.map(({ label, key, unit}) => (
            <div key={key} className="flex items-center gap-0.1 ">
              <label className={`text-sm w-1/6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
              <div className="flex-1 relative">
                <input
                  
                  value={(params as any)[key] ?? ''}
                  onChange={(e) => handleInputChange(key as keyof MotionParameters, e.target.value)}
                  className={`w-full pl-3 pr-3 py-1.5 rounded-lg outline-none transition-colors ${
                    darkMode ? 'bg-gray-700 border border-gray-600 text-gray-200 focus:border-gray-500'
                            : 'border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReactTooltip
        id="my-tooltip-1"
        place="right"
        clickable
        style={{ 
        backgroundColor: '#00adef', 
        color: '#222', 
        padding: '1px', 
        margin: '0px',
        borderRadius: '6px'           
       }}                        
        opacity={1}
      >
      <div className={`flex flex-col gap-1 rounded-md p-2 mb-0 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-md shadow-gray-500 text-gray-700'}`}>
              <img className="picture place-self-center" src={'https://i.postimg.cc/vHR3Fdnv/1-1.png'} width="200" height="200" />
      </div>
      </ReactTooltip>
      
      
      {/* ForceLever */}
      <div data-tooltip-id="my-tooltip-1" className=" items-center gap-2 space-y-1.5">
        <label className={`text-sm w-1/6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Точка приложения усилия</label>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {forceleverParameters.map(({ label, key, unit}) => (
            <div key={key} className="flex items-center gap-0.1 ">
              <label className={`text-sm w-1/6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</label>
              <div className="flex-1 relative">
                <input
                  
                  value={(params as any)[key] ?? ''}
                  onChange={(e) => handleInputChange(key as keyof MotionParameters, e.target.value)}
                  className={` w-full pl-3 pr-3 py-1.5 rounded-lg outline-none transition-colors ${
                    darkMode ? 'bg-gray-700 border border-gray-600 text-gray-200 focus:border-gray-500'
                            : 'border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl pb-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Расчётная конфигурация 
          </h2>
        </div>
      </div>
              {/* Linear Module */}
        <div data-tooltip-id="my-tooltip-2">
          <LMComboBox
            onSelectSet={handleLMSelect}
            darkMode={darkMode}
            selectedSetName={params.selectedLMSetName}
            setSelectedSetName={(name) => setParams(prev => ({ ...prev, selectedLMSetName: name }))}
          />

          <ReactTooltip
                id="my-tooltip-2"
                place="right-start"
                clickable
                style={{ 
                backgroundColor: '#00adef', 
                color: '#222', 
                padding: '1px', 
                margin: '0px',
                borderRadius: '6px' 
                
                }}               
                opacity={1}
          >
            <div className={`flex flex-col gap-1 rounded-md p-2 mb-0 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-md shadow-gray-500 text-gray-700'}`}>
              <label className='font-extrabold py-1'>Технические характеристики</label>
              <label className='font-semibold'>Модель привода: {params.selectedLMSetName}</label>
              <label className='font-semibold'>Постоянная подачи: {params.lead} мм/об</label>
              <label className='font-semibold'>Макс. усилие: {( params.M_maxTorque / ( ( params.lead / 1000 ) / ( 2 * 3.14 ) ) ).toFixed(0)} Н</label>
              <label className='font-semibold'>Макс. скорость: {params.mod_maxSpeed} м/с</label>
              <label className='font-semibold'>Макс. ускорение: {params.mod_maxAcc} м/с²</label>
              <img className="picture place-self-center" src={params.mod_pic} width="200" height="200"/>
            </div>
          </ReactTooltip>
        </div>

        {/* Gearbox */}
        <div data-tooltip-id="my-tooltip-4">
          <GBComboBox
            onSelectSet={handleGBSelect}
            darkMode={darkMode}
            selectedGBSetName={params.selectedGBSetName}
            setSelectedSetName={(name) => setParams(prev => ({ ...prev, selectedGBSetName: name }))}
          />

            <ReactTooltip
                id="my-tooltip-4"
                place="right-start"
                clickable
                style={{ 
                backgroundColor: '#00adef', 
                color: '#222', 
                padding: '1px', 
                margin: '0px',
                borderRadius: '6px' 
                
                }}               
                opacity={params.G_eff < 1 ? 1 : 0}
            >
            <div className={`flex flex-col gap-1 rounded-md p-2 mb-0 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-md shadow-gray-500 text-gray-700'}`}>
              <label className='font-extrabold py-1'>Технические характеристики</label>
              <label className='font-semibold'>Модель редуктора: {params.selectedGBSetName}</label>
              <label className='font-semibold'>Передаточное число: {params.reductionRatio}</label>
              <label className='font-semibold'>Макс. момент: {params.G_maxTorque} Н⋅м</label>
              <label className='font-semibold'>Макс. скорость: 3000 об/мин</label>
              <label className='font-semibold'>КПД: {params.G_eff * 100} %</label>
              <img className="picture place-self-center" src={'https://i.postimg.cc/7LpTGqws/gearbox.png'} width="150" height="150"/>
            </div>
          </ReactTooltip>
          
        </div>

        {/* Motor */}
        <div data-tooltip-id="my-tooltip-3">
          <MTComboBox
            onSelectSet={handleMTSelect}
            darkMode={darkMode}
            selectedMTSetName={params.selectedMTSetName}
            setSelectedSetName={(name) => setParams(prev => ({ ...prev, selectedMTSetName: name }))}
          />

          <ReactTooltip
                id="my-tooltip-3"
                place="right-start"
                clickable
                style={{ 
                backgroundColor: '#00adef', 
                color: '#222', 
                padding: '1px', 
                margin: '0px',
                borderRadius: '6px' 
                
                }}               
                opacity={1}
                
          >
          <div className={`flex flex-col gap-1 rounded-md p-2 mb-0 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white shadow-md shadow-gray-500 text-gray-700'}`}>
              <label className='font-extrabold py-1'>Технические характеристики</label>
              <label className='font-semibold'>Модель двигателя: {params.selectedMTSetName}</label>
              <label className='font-semibold'>Квадрат фланца двигателя: {params.mot_flangeSize} x {params.mot_flangeSize} мм</label>
              <label className='font-semibold'>Номинальный момент: {params.M_nom} Н⋅м</label>
              <label className='font-semibold'>Номинальная скорость: {params.N_nom} об/мин</label>
              <label className='font-semibold'>Пиковый момент: {params.M_max} Н⋅м</label>
              <label className='font-semibold'>Пиковая скорость: {params.N_max} об/мин</label>
              <label className='font-semibold'>{Number(params.mot_wBrake) < 1 ? "Стояночный тормоз: Нет ": "Стояночный тормоз: Есть"}</label>
              <img className="picture place-self-center" src={params.mot_pic} width="200" height="200"/>
            </div>
          </ReactTooltip>
        </div>


      </div>
      
    </div>
    
  );
};

export default InputParameters;
