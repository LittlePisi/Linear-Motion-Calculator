import React, { useState } from 'react';
import { Info } from 'lucide-react';
import InputParameters from './components/InputParameters';
import ResultsDisplay from './components/ResultsDisplay';
import { calculateMotionParameters } from './utils/motionCalculations';
import { MotionParameters, MotionResults } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import mainLogo from '../logo.svg';
import {Moon, Sun} from 'lucide-react';
import SolutionFinder from './components/AutomaticSolutionFinder'; 


function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [params, setParams] = useLocalStorage<MotionParameters>('motionCalculatorParams', {
    stroke: 1000,
    travelTime: 2,
    acceleration: 2000,
    deceleration: 2000,
    mass: 1,
    lead: 99,
    externalInertia: 0.0001,
    reductionRatio: 1,
    motorRotorInertia: 0.06,
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
    M_idleTorque: 0.1,
    M_zsInertia: 0.00009256,
    M_pmInertia: 0.00000946,
    M_maxTorque: "6",
    ScrewDLR: 0,
    Screw_dr: 0,
    Screw_la: 0,
    G_idleTorque: 0,
    G_Inertia: 0,
    G_eff: 1,
    G_maxTorque: 999999,
    M_nom: 0.32,
    N_nom: 3000,
    M_max: 0.96,
    N_max: 6000,
    M_torqueConstant: 0.3,
    M_fp: 0.16,
    N_fp: 5500,
    N_d: 3000,
    lever_Mx: 0,
    lever_My: 0,
    lever_Mz: 0,
    lever_Fx: 0,
    lever_Fy: 0,
    lever_Fz: 0,
    mod_pic: "",
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
    <div className={`min-h-screen pt-0 pb-0 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mt-0 mb-12 print:hidden">
          <a href='https://smarta.ru/'><img className="logo-picture" src={mainLogo} width="150" height="150" align='left' /></a>
          <br></br> 
          <br></br> 
          <div className="flex items-center justify-center gap-3 mb-4">                                       
            <h1 className={`text-4xl font-bold pb-2 ${darkMode ? 'text-white' : 'text-gray-800'} border-left`}>     
                    Drive Calculation Tool
            </h1>
          </div>       
          

          
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            
          </p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center mx-auto mt-4 px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-100 shadow-md shadow-gray-500'
            }`}
          >
            {darkMode ? <Sun className="w-30 h-5 mx-1 text-yellow-400" /> : <Moon className="w-30 h-5 mx-1 text-slate-500 fill-slate-500" />}
            <span className="hidden sm:inline">{darkMode ? 'Светлое оформление' : 'Темное оформление'}</span>
          </button>

        </header>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="lg:sticky lg:top-4 h-fit">
            <InputParameters 
              params={params} 
              setParams={setParams} 
              darkMode={darkMode}
            />
          </div>
          
          <div className="lg:col-span-2">
            <SolutionFinder props={params} darkMode={darkMode}/>

            <ResultsDisplay 
              results={results} 
              error={error}
              params={params}
              setParams={setParams}
              darkMode={darkMode}
            />
          </div>
        </div>
        

        <div className={`mt-8 rounded-xl shadow-lg p-6  print:hidden ${
          darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 shadow-md shadow-gray-500'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Info className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Справка
            </h2>
          </div>
          <p>• Drive Calculation Tool - инструмент для расчёта систем линейного перемещения. Версия: v0.98.</p>
          <p>• Расчитывает оптимальные комбинации линейного привода, двигателя и редуктора на основе введенных параметров.</p>
          <p>• Вычисляет профиль перемещения и требуемый крутящий момент на основе введенных параметров и выбранной конфигурации компонентов.</p>
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
