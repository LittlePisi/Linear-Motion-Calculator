import React, { useState } from 'react';
import { Info } from 'lucide-react';
import InputParameters from './components/InputParameters';
import ResultsDisplay from './components/ResultsDisplay';
import { calculateMotionParameters } from './utils/motionCalculations';
import { MotionParameters, MotionResults } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import mainLogo from '../logo.svg';



function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [params, setParams] = useLocalStorage<MotionParameters>('motionCalculatorParams', {
    stroke: 1000,
    travelTime: 2,
    acceleration: 2000,
    deceleration: 2000,
    mass: 10,
    lead: 176,
    externalInertia: 0.0001,
    reductionRatio: 1,
    motorRotorInertia: 0.003,
    pauseTime: 0.3,
    maxSpeed: 500,
    useMaxSpeedMode: false,
    isVertical: false,
    showTorque: true,
    showRPM: true,
    showVelocity: true,
    showPosition: true,
    externalForce: 0,
    //idleTorque: 0.5,
    M_idleTorque: 1,
    M_zsInertia: 1,
    M_pmInertia: 1,
    M_maxTorque: "10",
    G_idleTorque: 1,
    G_Inertia: 1,
    G_eff: 1,
    G_maxTorque: 10,
    M_nom: 1,
    N_nom: 2000,
    M_max: 1,
    N_max: 3000,
    selectedLMSetName: "",
    selectedGBSetName: "",
    selectedMTSetName: "",
  });

  const [results, setResults] = useState<MotionResults | null>(null);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    try {
      const calculatedResults = calculateMotionParameters(params);
      setResults(calculatedResults);
      setError('');
    } catch (err) {
      setError((err as Error).message);
      setResults(null);
    }
  }, [params]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <img className="logo-picture" src={mainLogo} width="150" height="150" align='left' />
          <br></br> 
          <br></br> 
          <div className="flex items-center justify-center gap-3 mb-4">
            
              
              
            <br></br>  
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} border-left`}>
            
            
              Drive Calculation Tool (beta v.0.95)
            </h1>
            
          </div>



          {/*
          
          <button
            onClick={() => alert("ParameterSet")}
            className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}>
            "Тестовая кнопка"
          </button>
          
          */}

          
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Вычисляет профиль перемещения, требуемый момент и другие параметры систем линейного перемещения
          </p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mt-4 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {darkMode ? 'Светлое оформление' : 'Темное оформление'}
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:sticky lg:top-8 h-fit">
            <InputParameters 
              params={params} 
              setParams={setParams} 
              darkMode={darkMode}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsDisplay 
              results={results} 
              error={error}
              params={params}
              setParams={setParams}
              darkMode={darkMode}
            />
          </div>
        </div>

        <div className={`mt-8 rounded-xl shadow-lg p-6 ${
          darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Info className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Справка
            </h2>
          </div>
           
          <p>• Вычисляет профиль перемещения и требуемый крутящий момент на основе введенных параметров.</p>
          <p>• Автоматически учитывает характеристики выбранного привода, редуктора и двигателя при вычислении.</p>
          <p>• Расчитывает как вертикальные, так и горизонтальные применения. Для переключения между режимами предусмотрена кнопка со стрелкой.</p>
          <p>• Расчет может проводиться как от общего времени перемещения, так и от максимальной скорости. Для переключения между режимами предусмотрена кнопка.</p>
          <p>• Компания ООО "СМАРТ Автоматизация" не несет ответственности за претензии, связанные с неспособностью достичь рассчитанных результатов, в том числе в случае ошибок в расчетах.</p>
          <p>• Компания ООО "СМАРТ Автоматизация" не гарантирует пригодность любого оборудования, заказанного в соответствии с использованием этого программного обеспечения для какой-либо конкретной цели, если эта цель не была полностью объяснена компании SMARTA.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
