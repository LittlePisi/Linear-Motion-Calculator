import React, { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';
import { MotionParameters } from '../types';
import { SearchX } from 'lucide-react';

const GRAVITY = 9.81; // m/s²
const MAX_ITERATIONS = 50;
const TOLERANCE = 0.0001;



export interface LMParameterSet {
  name: string;
  lead: string;
  M_idleTorque: string;
  M_zsInertia: string;
  M_pmInertia: string;
  M_maxTorque: string;
  ScrewDLR: string;
  Screw_dr: string;
  Screw_la: string;
  mod_Mx: string;
  mod_My: string;
  mod_Mz: string;
  mod_lever: string;
  mod_GSLM: string;
  mod_Zd: string;
  mod_pic: string;
  mod_maxSpeed: string;
  mod_maxAcc: string;
  calc_GSL: string;
  calc_maxTorque: string;
  calc_maxSpeed: string;
  calc_SSL: string;
  mod_motSize: string;
  mod_wGearbox: string;
  mod_GBtype: string;
  calc_loadInertia?: string;
  calc_meanTorque: string;
  calc_meanRPM: string;
  mod_GB_idleTorque: string;
  mod_GB_inertia: string;
  suitableMotors?: { motorName: string; ratio: number; motorPic: string; inertiaRatio: string; mNom: number; motorLoad: string, mot_GBtype: string, motorMeanLoad: string }[];
}

export interface MTParameterSet {
  name: string;
  M_nom: string;
  N_nom: string;
  M_max: string;
  N_max: string;
  motorRotorInertia: string;
  M_torqueConstant: string;
  M_fp: string;
  N_fp: string;
  N_d: string;
  mot_pic: string;
  calc_inertiaRatio: string;
  calc_reductionRatio: string;
  mot_flangeSize: string;
  mot_brake: string;
  mot_GBtype: string;
}

export interface GParameterSet {
  name: string;
  reductionRatio: string;
  G_idleTorque: string;
  G_Inertia: string;
  G_eff: string;
  G_maxTorque: string;
}

export async function getLMData() {
  const response = await fetch('/LinearModuleASF.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  const data: LMParameterSet[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      data.push({
        name: row.getCell(1).text,
        lead: row.getCell(2).text,
        M_idleTorque: row.getCell(3).text,
        M_zsInertia: row.getCell(4).text,
        M_pmInertia: row.getCell(5).text,
        M_maxTorque: row.getCell(6).text,
        ScrewDLR: row.getCell(7).text,
        Screw_dr: row.getCell(8).text,
        Screw_la: row.getCell(9).text,
        mod_Mx: row.getCell(10).text,
        mod_My: row.getCell(11).text,
        mod_Mz: row.getCell(12).text,
        mod_lever: row.getCell(13).text,
        mod_GSLM: row.getCell(14).text,
        mod_Zd: row.getCell(15).text,
        mod_pic: row.getCell(16).text,
        mod_maxSpeed: row.getCell(17).text,
        mod_maxAcc: row.getCell(18).text,
        calc_GSL: row.getCell(19).text,
        calc_maxTorque: row.getCell(20).text,
        calc_maxSpeed: row.getCell(21).text,
        calc_SSL: row.getCell(22).text,
        mod_motSize: row.getCell(23).text,
        mod_wGearbox: row.getCell(24).text,
        mod_GBtype: row.getCell(25).text,
        calc_meanTorque: row.getCell(26).text,
        calc_meanRPM: row.getCell(27).text,
        mod_GB_idleTorque: row.getCell(28).text,
        mod_GB_inertia: row.getCell(29).text,
      });
    }
  });

  return data;
}

export async function getMotData() {
  const response = await fetch('/MotorsASF.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  const data: MTParameterSet[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      data.push({
        name: row.getCell(1).text,
        M_nom: row.getCell(2).text,
        N_nom: row.getCell(3).text,
        M_max: row.getCell(4).text,
        N_max: row.getCell(5).text,
        motorRotorInertia: row.getCell(6).text,
        M_torqueConstant: row.getCell(7).text,
        M_fp: row.getCell(8).text, 
        N_fp: row.getCell(9).text,
        N_d: row.getCell(10).text,
        mot_pic: row.getCell(11).text,
        calc_inertiaRatio: row.getCell(12).text,
        calc_reductionRatio: row.getCell(13).text,
        mot_flangeSize: row.getCell(14).text,
        mot_brake: row.getCell(15).text,
        mot_GBtype: row.getCell(16).text,
      });
    }
  });

  return data;
}

export async function getGBData() {
  const response = await fetch('/Gearbox.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  const data: GParameterSet[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      data.push({
        name: row.getCell(1).text,
        reductionRatio: row.getCell(2).text,
        G_idleTorque: row.getCell(3).text,
        G_Inertia: row.getCell(4).text,
        G_eff: row.getCell(5).text,
        G_maxTorque: row.getCell(6).text,
      });
    }
  });

  return data;
}

function calculateStroke(v: number, t: number, a: number, d: number): number {
  const ta = v / a;  // acceleration time
  const td = v / d;  // deceleration time
  const tc = t - ta - td;  // constant velocity time
  
  if (tc < 0) return Infinity;  // Invalid solution
  
  // Total stroke = distance in acceleration + distance at constant velocity + distance in deceleration
  return (0.5 * a * ta * ta) + (v * tc) + (0.5 * d * td * td);
}

function findMaxVelocity(targetStroke: number, targetTime: number, acceleration: number, deceleration: number): number {
  let vLow = 0;
  let vHigh = targetStroke / targetTime * 4; // Initial guess for upper bound
  let iterations = 0;
  
  while (iterations < MAX_ITERATIONS) {
    const vMid = (vLow + vHigh) / 2;
    const calculatedStroke = calculateStroke(vMid, targetTime, acceleration, deceleration);
    
    if (Math.abs(calculatedStroke - targetStroke) < TOLERANCE) {
      return vMid;
    }
    
    if (calculatedStroke > targetStroke) {
      vHigh = vMid;
    } else {
      vLow = vMid;
    }
    
    iterations++;
  }
  
  throw new Error('Решение не сходится. Попробуйте другие параметры профиля перемещения.');
}

interface SolutionFinderProps {
  props: MotionParameters;
  darkMode: boolean;
}

const SolutionFinder: React.FC<SolutionFinderProps> = ({ props, darkMode }) => {
    const [candidateLMData, setCandidateLMData] = useState<LMParameterSet[]>([]);
    const [filteredLMData, setFilteredLMData] = useState<LMParameterSet[]>([]);
    const [error, setError] = useState<string | null>(null);


    const [moduleType, setModuleType] = useState('Belt');
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false)
    const [isOpenRec, setIsOpenRec] = useState(false)

    

  useEffect(() => {
    const loadAndCompute = async () => {
      try {
        // Validation
        if (props.stroke <= 0) throw new Error('Ход должен быть больше 0');
        if (props.travelTime < 0) throw new Error('Время перемещения должно быть больше 0');
        if (props.acceleration <= 0) throw new Error('Ускорение должно быть больше 0');
        if (props.deceleration <= 0) throw new Error('Замедление должно быть больше 0');
        if (props.mass < 0) throw new Error('Перемещаемая масса должна быть больше 0');

        const lmData = await getLMData();
        const motData = await getMotData();
        //const gbData = await getGBData();


        let { stroke, travelTime: inputTravelTime, pauseTime, acceleration, deceleration, mass, isVertical, externalForce, maxSpeed, useMaxSpeedMode, lever_Mx, lever_My, lever_Mz, lever_Fy, lever_Fz } = props;
        let travelTime = inputTravelTime;

        let v1: number;
        let t1: number;
        let t2: number;
        let t3: number;
        let maxSpeedStroke: number | undefined;
        let velocityAtMaxSpeed: number | undefined;

        if (useMaxSpeedMode) {
          v1 = maxSpeed!;
          t1 = v1 / acceleration;
          t3 = v1 / deceleration;
          const distanceInAccel = 0.5 * acceleration * t1 * t1;
          const distanceInDecel = 0.5 * v1 * t3;
          t2 = (stroke - distanceInAccel - distanceInDecel) / v1;
          maxSpeedStroke = v1 * t2;
          velocityAtMaxSpeed = v1;
          
          if (t2 < 0) {
            throw new Error('Профиль перемещения невозможен с введенной максимальной скоростью. Уменьшите максимальную скорость или увеличьте ускорение/замедление.');
          }

          travelTime = t1 + t2 + t3;
        } else {
          v1 = findMaxVelocity(stroke, inputTravelTime, acceleration, deceleration);
          t1 = v1 / acceleration;
          t3 = v1 / deceleration;
          t2 = inputTravelTime - t1 - t3;
          
          if (t2 < 0) {
            throw new Error('Профиль перемещения невозможен с текущим набором вводных параметров.');
          }
        }

        const totalTime = travelTime + pauseTime;

        const Fx = externalForce + mass * Math.max(acceleration/1000, deceleration/1000) + (mass * (isVertical ? GRAVITY : 0));
  //      console.log({Fx});
  //      console.log({v1});

        const calculateModuleTorque = (M_zsInertia: number, M_pmInertia: number, M_idleTorque: number, lead: number, isVertical: boolean) => {


          // Calculating mean and max RPM
          const maxRPM = (v1 / 1000 * 60 ) / (lead / 1000);
          const meanRPM = (2 * maxRPM) / 3;

          const Mod_fullInertia = Number(M_zsInertia) + (Number(M_pmInertia) * stroke/1000);

          const loadInertia = (mass * Math.pow((lead / 1000) / (2 * Math.PI), 2) + Mod_fullInertia);

          // Calculate constant torques
          const externalTorque = ((externalForce * ((lead/1000) / (2 * Math.PI))) );

          const gravityTorque = isVertical
                  ? ((mass * GRAVITY * ((lead/1000) / (2 * Math.PI))))
                  : 0;

          const constantLoadTorque = externalTorque + gravityTorque + M_idleTorque;

          // Calculate dynamic torques for each phase
          const dynamicTorqueA = (loadInertia) * ((Math.PI * maxRPM)/(30 * t1));
      
          const dynamicTorqueD = (loadInertia) * ((Math.PI * maxRPM)/(30 * t3));

          // Calculate total torques for each phase
          const accelerationTorque = (((dynamicTorqueA + constantLoadTorque)) / 0.95);
          
          const constantVelocityTorque = (((constantLoadTorque)) / 0.95);
          
          const decelerationTorque = (((dynamicTorqueD - constantLoadTorque)) / 0.95);
          

          // Calculating mean torque
          const meanTorque = isVertical
            ? Math.sqrt( ((Math.pow(accelerationTorque, 2) * t1) + (Math.pow(constantVelocityTorque, 2) * t2) + (Math.pow(decelerationTorque, 2) * t3)) / totalTime) 
            : Math.sqrt( ((Math.pow(accelerationTorque, 2) * t1) + (Math.pow(constantVelocityTorque, 2) * t2) + (Math.pow(decelerationTorque, 2) * t3)) / totalTime);

          // Calculating max torque
          const maxTorque = (dynamicTorqueA + constantLoadTorque);
          
          return { maxTorque, loadInertia, meanTorque, meanRPM, maxRPM};
        }


        // Function for calculating linear module service life (guide service life for modules with guide / ballscrew service life for cylinders) 
        const calculateServiceLife = (mod_Mx: number, mod_My: number, mod_Mz: number, mod_Zd: number, mod_lever: number, mod_GSLM: number, ScrewDLR: number, lead: number) => {
          
          let mod_guideServiceLife: number = 1000;
          
          if (mod_GSLM > 0) {
            const acc_scd = acceleration / 1000;
            const dec_scd = deceleration / 1000;

            const Fa = isVertical
            ? (mass * acc_scd) + externalForce + (0.002 * mass * GRAVITY)+(mass * GRAVITY) 
            : (mass * acc_scd) + externalForce + (0.002 * mass * GRAVITY);

            const Fcv = Fa - (mass * acc_scd);

            const Fd = isVertical
            ? (mass * dec_scd) + externalForce + (0.002 * mass * GRAVITY) - (mass * GRAVITY) 
            : (mass * dec_scd) + externalForce + (0.002 * mass * GRAVITY);

            const Fxm = Math.pow( ((Math.pow(Fa, 3) * (t1 / totalTime))) + ((Math.pow(Fcv, 3) * (t2 / totalTime))) + ((Math.pow(Fd, 3) * (t3 / totalTime))) , 1/3 );

            const Mx = isVertical
                        ? 0
                        : ((mass * GRAVITY) * lever_My/1000);
            const My = isVertical
                        ? ((mass * GRAVITY) * lever_Mz/1000 + mod_lever/1000) - (externalForce * lever_Fz/1000) + (Fxm * mod_Zd/1000)
                        : (Fxm * lever_Mz/1000 + mod_lever/1000) + ((mass * GRAVITY) * lever_Mx/1000) - (externalForce * lever_Fz/1000) + (Fxm * mod_Zd/1000);
            const Mz = isVertical
                        ? ((mass * GRAVITY) * lever_My/1000) - (externalForce * lever_Fy/1000)
                        : (externalForce * lever_Fy/1000);

            const fv = Math.abs(Mx)/Number(mod_Mx) + Math.abs(My)/Number(mod_My) + Math.abs(Mz)/Number(mod_Mz);
            
            mod_guideServiceLife = 1 / Math.pow(fv, 3) * Number(mod_GSLM);
            
          } else {
            const acc_scd = acceleration / 1000;
            const dec_scd = deceleration / 1000;

            const Fa = isVertical
            ? (mass * acc_scd) + externalForce + (0.002 * mass * GRAVITY)+(mass * GRAVITY) 
            : (mass * acc_scd) + externalForce + (0.002 * mass * GRAVITY);

            const Fcv = Fa - (mass * acc_scd);

            const Fd = isVertical
            ? (mass * dec_scd) + externalForce + (0.002 * mass * GRAVITY) - (mass * GRAVITY) 
            : (mass * dec_scd) + externalForce + (0.002 * mass * GRAVITY);

            const Fxm = Math.pow( ((Math.pow(Fa, 3) * (t1 / totalTime))) + ((Math.pow(Fcv, 3) * (t2 / totalTime))) + ((Math.pow(Fd, 3) * (t3 / totalTime))) , 1/3 );

            let Lr: number;
            Lr = ( Math.pow((ScrewDLR / (Fxm * 1) ), 3)) * Math.pow(10, 6);
            mod_guideServiceLife = (Lr * lead) / Math.pow(10, 6);
            
            
          }
        return mod_guideServiceLife
          ;
        }

        // Filtering linear modules based on torque and service life requirements

        const filtered = lmData.filter((module) => {
          const { maxTorque } = calculateModuleTorque(Number(module.M_zsInertia), Number(module.M_pmInertia), Number(module.M_idleTorque), Number(module.lead), isVertical);
          const serviceLife = calculateServiceLife(Number(module.mod_Mx), Number(module.mod_My), Number(module.mod_Mz), Number(module.mod_Zd), Number(module.mod_lever), Number(module.mod_GSLM), Number(module.ScrewDLR), Number(module.lead));
          return (
            Number(module.mod_maxSpeed) > v1/1000 &&
            Number(module.mod_maxAcc) > Math.max(acceleration/1000, deceleration/1000) &&
            //((Number(module.M_maxTorque) - Number(module.M_idleTorque)) * 0.08) < maxTorque &&
            ((Number(module.M_maxTorque) - Number(module.M_idleTorque)) * 0.85) > maxTorque &&
            serviceLife > 1500
          );
        });

        // Calculating Service Life, Torques, RPMs and Load Inertia for each filtered module

        filtered.forEach((module) => {
          const { maxTorque, loadInertia, meanTorque, meanRPM } = calculateModuleTorque(Number(module.M_zsInertia), Number(module.M_pmInertia), Number(module.M_idleTorque), Number(module.lead), isVertical);
          module.calc_GSL = String(calculateServiceLife(Number(module.mod_Mx), Number(module.mod_My), Number(module.mod_Mz), Number(module.mod_Zd), Number(module.mod_lever), Number(module.mod_GSLM), Number(module.ScrewDLR), Number(module.lead)));
          module.calc_maxTorque = String(maxTorque);
          module.calc_loadInertia = String(loadInertia);
          module.calc_meanTorque = String(meanTorque);
          module.calc_meanRPM = String(meanRPM);
        });

        // Scaling max linear speed for each filtered module from mm/s to m/s

        filtered.forEach((module) => {
          module.calc_maxSpeed = String(v1 / 1000);
        });
        

        // Declaring reduction ratios for sorting algorithm

        const reductionRatios = [ 3, 5, 7, 10];

        // Sorting suitable motors for each module based on calculated data and reduction ratios (reduction ratios are used based on mod_wGearbox value) 

        filtered.forEach((module) => {
          const allSuitable: { motorName: string; ratio: number; motorPic: string; inertiaRatio: string; mNom: number; motorLoad: string, mot_GBtype: string, motorMeanLoad: string }[] = [];
          const requiredTorque = Number(module.calc_maxTorque);
          const mod_meanTorque = Number(module.calc_meanTorque);
          const mod_meanRPM = Number(module.calc_meanRPM);
          
          motData.forEach((motor) => {

            if(Number(module.mod_wGearbox) > 0){
              reductionRatios.forEach((ratio) => {
                            
                const requiredRPM = Number(module.calc_maxSpeed) * 60000 / Number(module.lead);
                const inertiaRatioNum = 1 + (Number(module.calc_loadInertia) / (ratio ** 2) / (Number(motor.motorRotorInertia) / 10000));
                const scaledTorque = Number(motor.M_nom) * ratio;
                const scaledMaxTorque = Number(motor.M_max) * ratio;
                const scaledMeanTorque = Number(mod_meanTorque) / ratio;
                const scaledMeanRpm = Number(mod_meanRPM) * ratio;

                if (
                  scaledTorque > mod_meanTorque &&
                  scaledMaxTorque > requiredTorque &&
                  Number(motor.N_nom) / ratio > requiredRPM &&
                  ((((scaledMeanTorque + Number(module.mod_GB_idleTorque)) / Number(motor.M_nom)))*100) < 95 &&
                  inertiaRatioNum <= 12 &&
                  module.mod_motSize.split(',').map(s => s.trim()).includes(motor.mot_flangeSize) 
                ) {
                  const hasBrake = ['1', 'yes', 'true']
                  .includes((motor.mot_brake || '').trim().toLowerCase());

                  if (isVertical && !hasBrake) return;     // нужен тормоз → нет → пропустить
                  if (!isVertical && hasBrake) return;     // не нужен → есть → пропустить

                  const appTorque = requiredTorque / ratio;
                  const motorLoad = ((appTorque / Number(motor.M_max))*100).toFixed(1);
                  const motorMeanLoad = ((((scaledMeanTorque + Number(module.mod_GB_idleTorque)) / Number(motor.M_nom)))*100).toFixed(1);

                  allSuitable.push({
                    motorName: motor.name,
                    ratio,
                    motorPic: motor.mot_pic,
                    inertiaRatio: inertiaRatioNum.toFixed(2),
                    mNom: Number(motor.M_nom),
                    motorLoad,
                    motorMeanLoad,
                    mot_GBtype: motor.mot_GBtype,
                  });                          
                }
              });
            } else {
              
              const ratio: number = 1;
              const requiredRPM = Number(module.calc_maxSpeed) * 60000 / Number(module.lead);
              const inertiaRatioNum = 1 + (Number(module.calc_loadInertia) / (ratio ** 2) / (Number(motor.motorRotorInertia) / 10000));
              const scaledTorque = Number(motor.M_nom) * ratio;
              const scaledMaxTorque = Number(motor.M_max) * ratio;
              const scaledMeanTorque = Number(mod_meanTorque) / ratio;
              const scaledMeanRpm = Number(mod_meanRPM) * ratio;

              if (
                scaledTorque > mod_meanTorque &&
                scaledMaxTorque > requiredTorque &&
                Number(motor.N_nom) / ratio > requiredRPM &&
                ((((scaledMeanTorque + Number(module.mod_GB_idleTorque)) / Number(motor.M_nom)))*100) < 95 &&
                inertiaRatioNum <= 12 &&
                module.mod_motSize.split(',').map(s => s.trim()).includes(motor.mot_flangeSize)
              ) {
                const hasBrake = ['1', 'yes', 'true']
                .includes((motor.mot_brake || '').trim().toLowerCase());

                if (isVertical && !hasBrake) return;     // нужен тормоз → нет → пропустить
                if (!isVertical && hasBrake) return;     // не нужен → есть → пропустить

                const appTorque = requiredTorque / ratio;
                const motorLoad = ((appTorque / Number(motor.M_max))*100).toFixed(1);
                const motorMeanLoad = ((((scaledMeanTorque + Number(module.mod_GB_idleTorque)) / Number(motor.M_nom)))*100).toFixed(1);

                allSuitable.push({
                  motorName: motor.name,
                  ratio,
                  motorPic: motor.mot_pic,
                  inertiaRatio: inertiaRatioNum.toFixed(2),
                  mNom: Number(motor.M_nom),
                  motorLoad,
                  motorMeanLoad,
                  mot_GBtype: motor.mot_GBtype,
                });

              }
            }
            

          });

          // Select best 3-5: group by motor, take max ratio per motor, sort by ascending (mNom * ratio / requiredTorque) for well-loaded (minimal excess)
          const suitableMap = new Map<string, { motorName: string; ratio: number; motorPic: string; inertiaRatio: string; mNom: number; motorLoad: string, motorMeanLoad: string, mot_GBtype: string }>();
          allSuitable.forEach((pair) => {
            const key = pair.motorName;
            const currentLoad = parseFloat(pair.motorMeanLoad);
            const existing = suitableMap.get(key);
            
            if (!existing || currentLoad > parseFloat(existing.motorMeanLoad)) {
              suitableMap.set(key, pair);
            }
          });

          const bestPairs = Array.from(suitableMap.values())
            .sort((a, b) => {
              const loadA = parseFloat(a.motorMeanLoad); // уже в процентах, например "75.3"
              const loadB = parseFloat(b.motorMeanLoad);
              return loadB - loadA; // по убыванию: сначала самые загруженные
            })
            .slice(0, 5);

          module.suitableMotors = bestPairs;
          
        });

        setCandidateLMData(filtered);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setCandidateLMData([]);
        setFilteredLMData([]);
      }
    };

    loadAndCompute();

  }, [props]);



  useEffect(() => {
    if (candidateLMData.length === 0) return;

  // 1. Module type filter
  const filteredByType = candidateLMData.filter((module) => {
    if (moduleType === 'Belt') {
      return Number(module.ScrewDLR) === 0;
    } else if (moduleType === 'Screw') {
      return Number(module.ScrewDLR) > 0 && Number(module.mod_GSLM) > 0;
    } else if (moduleType === 'Cylinder') {
      return Number(module.ScrewDLR) > 0 && Number(module.mod_GSLM) === 0;
    }
    return true;
  });

  // 2. Motor list length > 0
  const filteredByMotor = filteredByType.filter((module) => {
    return module.suitableMotors && module.suitableMotors.length > 0;
  });

  // 3. Name search
  const filteredByName = filteredByMotor.filter((module) =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  setFilteredLMData(filteredByName);
}, [candidateLMData, moduleType, searchTerm]);



  return (
    <div className="space-y-8 pb-8">
     {error && (
        <div className={`p-0 m-0 rounded-xl invisible h-0 outline outline-2 outline-offset-0 outline-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md shadow-gray-500'} `}>
        {/*<p className={`text-xl  font-semibold ${darkMode ? 'text-red-500' : 'text-red-500'}`}>Ошибка:</p>
          <p className={`text-md font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>*/}  
        </div>
      )}
      {!error && (
        <div className={`p-6 pb-0 items-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md shadow-gray-500'} ${isOpenRec ? 'pb-6' : 'pb-0'}`}>
          <button
              className="flex w-full items-baseline justify-between text-base font-semibold cursor-pointer focus:outline-none"
              onClick={() => setIsOpenRec(!isOpenRec)}
              aria-expanded={isOpenRec}
          >
          <span className={`text-xl pb-2 font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Рекомендуемые комбинации ({filteredLMData.length}):</span>
          <svg className={`h-5 w-5 transform transition-transform duration-300 
              ${ isOpenRec ? 'rotate-180' : 'rotate-0'}
              ${darkMode ? 'text-white' : 'text-gray-800'}
          `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          </button>
          
      <div
          className={`overflow-hidden transition-all duration-500 delay-300 ease-in-out ${
          isOpenRec ? 'opacity-100' : 'max-h-0 opacity-0'}`}>

          <h3 className={`grid grid-cols-2 gap-0 pb-3 text-base font-semibold items-center ${darkMode ? 'text-gray-300' : 'text-gray-700'} overflow-hidden transition-all duration-300 ease-in-out`}>Сортировка по типу привода
              <div>
                  <ul className={`items-center w-full text-sm font-medium rounded-lg sm:flex ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                          <div className="flex items-center ps-3">
                              <input 
                                  id="horizontal-list-radio-license" 
                                  type="radio" 
                                  value="Belt" 
                                  name="list-radio" 
                                  className="w-7 h-4 text-blue-600 bg-gray-100 border-gray-300  focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                  onChange={() => setModuleType('Belt')}
                                  />
                              <label htmlFor="horizontal-list-radio-license" className="w-full py-3 ms-2 text-base font-medium">Ременный</label>
                          </div>
                      </li>
                      <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                          <div className="flex items-center ps-3">
                              <input 
                                  id="horizontal-list-radio-id" 
                                  type="radio" 
                                  value="Screw" 
                                  name="list-radio" 
                                  className="w-7 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                  checked={moduleType === 'Screw'}
                                  onChange={() => setModuleType('Screw')}
                                  />
                              <label htmlFor="horizontal-list-radio-id" className="w-full py-3 ms-2 text-base font-medium">Винтовой</label>
                          </div>
                      </li>
                      <li className="w-full dark:border-gray-600">
                          <div className="flex items-center ps-3">
                              <input 
                                  id="horizontal-list-radio-passport" 
                                  type="radio" 
                                  value="Cylinder" 
                                  name="list-radio" 
                                  className="w-7 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                  checked={moduleType === 'Cylinder'}
                                  onChange={() => setModuleType('Cylinder')}
                                  />
                              <label htmlFor="horizontal-list-radio-passport" className="w-full py-3 ms-2 text-base font-medium">Электроцилиндр</label>
                          </div>
                      </li>
                  </ul>
              </div>
              </h3>
          

{/* 
            <input
              type="text"
              placeholder="Поиск по названию модуля"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`mb-4 p-2 rounded-lg w-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
            />
*/}
          <div className='whitespace-nowrap overflow-x-auto overflow-hidden transition-all duration-300 ease-in-out'>
              <div className={`flex-auto inline-grid grid-flow-col auto-cols-max gap-2 }`}>
                  {filteredLMData.length > 0 ? (
                      filteredLMData.map((item, index) => (
                          <div
                            key={index}
                            className={`flex flex-col min-w-[182px] gap-1 p-6 rounded-xl ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            } ${
                              isOpenRec ? 'opacity-100 mt-0' : 'opacity-0 mt-16'
                            } transition-all duration-700 ease-out`}
                            style={{
                              transitionProperty: 'opacity, transform',
                              transitionDelay: `${index * 100}ms`,
                            }}
                          >
                          <label className='font-semibold'>{index+1}. {item.name}</label>
                          <div className='h-20'><img className='py-3' src={item.mod_pic} width="100" height="100"/></div>
                          <label className='text-base'><span className='font-semibold'>Ресурс:</span> {Number(item.calc_GSL) > 10000 ? ("10000+") : (Number(item.calc_GSL).toFixed(0))} км</label>
                          <label className=''><span className='font-semibold'>Загрузка:</span> {(((Number(item.calc_maxTorque) - (Number(item.M_idleTorque))) / Number(item.M_maxTorque))*100).toFixed(0)} %</label>
                          {item.suitableMotors && item.suitableMotors.length > 0 && (

                          <div className="mt-2 transition-all duration-300 ease-in-out">
                          {/* Accordion Header */}
                          <button
                              className="flex w-full items-center justify-between text-base font-semibold cursor-pointer focus:outline-none"
                              onClick={() => setIsOpen(!isOpen)}
                              aria-expanded={isOpen}
                          >
                              <span>Подходящие моторы ({item.suitableMotors.length}):</span>
                              {/* Chevron icon that rotates when open */}
                              <svg
                              className={`h-5 w-5 transform transition-transform duration-300 ${
                                  isOpen ? 'rotate-180' : 'rotate-0'
                              }
                                  ${darkMode ? 'text-white' : 'text-gray-800'}
                              `}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                          </button>

                          {/* Accordion Content */}
                          <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? 'max-h-120 opacity-100' : 'max-h-0 opacity-0'
                              }`}
                          >
                              <div className={`text-sm  rounded-lg p-1 mt-1 ${darkMode ? 'text-gray-300 bg-gray-600' : 'text-gray-700 bg-white'} `}>
                              {item.suitableMotors.map((sm, si) => (
                                  <div
                                    key={si}
                                    className={`flex items-center gap-1 mr-1 mb-1 p-0.5 pt-3 transition-all duration-700 ${
                                      isOpen ? 'opacity-100 mt-0' : 'opacity-0 mt-16'
                                    }`}
                                    style={{
                                      transitionProperty: 'opacity, transform',
                                      transitionDelay: `${isOpen ? si * 100 : 0}ms`
                                    }}
                                  >
                                    {si + 1}.
                                    <img src={sm.motorPic} width="50" height="50" className="mr-2" alt={sm.motorName} />
                                    <div className='flex flex-col gap-1'> 
                                      <label><span className='font-semibold'>Двигатель:</span> {sm.motorName}</label>
                                      {Number(item.mod_wGearbox) > 0 ? <label><span className='font-semibold'>Редуктор:</span> {item.mod_GBtype}{sm.ratio}S1-{sm.mot_GBtype} </label> : ""}
                                      <label><span className='font-semibold'>Загрузка двигателя:</span> {sm.motorMeanLoad}%</label> 
                                      <label><span className='font-semibold'>Соотношение моментов инерции:</span> {sm.inertiaRatio}</label>

                                    </div>
                                  </div>
                              ))}
                              </div>
                          </div>
                          </div>

                          )}
                      </div>
                      ))
                  ) : (
                      <div className='flex items-center gap-5 pt-3'>
                        <SearchX size={36} className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <a className='flex flex-col gap-1'>
                          {/*<img className='flex-1 relative' src='https://zbs-sticker.by/media/zoo/images/419xc0af-300x220_2dbe2fd074061c04d9d68457c2d80150.png' width={50} height={50} align-left></img>*/}
                          <label className={`text-m ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Не удалось найти подходящих решений. . .</label>
                          <label className={`text-m ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Попробуйте изменить тип привода или вводные параметры.</label>
                          <label className={`text-m ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Вы также можете обратиться в SMARTA за помощью в подборе решения.</label>
                        </a>
                        
                      </div>
                  )}
              </div>
          </div>
          </div>
          
      </div>
      )}
  </div>
  );
};

export default SolutionFinder;