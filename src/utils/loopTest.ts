import * as ExcelJS from 'exceljs';
import { MotionParameters, test } from '../types';



const GRAVITY = 9.81; // m/s²
const POINTS_PER_SECOND = 550;
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
        const response = await fetch('/LinearModule.xlsx');
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
            });
          }
        });
  
  // Return the data array directly
  return data;
}



export async function getMotData() {
        const response = await fetch('/Motors.xlsx');
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
            });
          }
        });
  
  // Return the data array directly
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
  
  // Return the data array directly
  return data;
}

export function callDat(params: MotionParameters) {

  const {
    stroke,
    travelTime,
    acceleration,
    deceleration,
    mass,
    isVertical,
    externalForce,

  } = params;

  // Validation
  if (stroke <= 0) throw new Error('Ход должен быть больше 0');
  if (travelTime < 0) throw new Error('Время перемещения должно быть больше 0');
  if (acceleration <= 0) throw new Error('Ускорение должно быть больше 0');
  if (deceleration <= 0) throw new Error('Замедление должно быть больше 0');
  if (mass < 0) throw new Error('Перемещаемая масса должна быть больше 0');

  const Fx = externalForce + mass * Math.max(acceleration/1000, deceleration/1000) + (mass * (isVertical ? GRAVITY : 0));

  return{
    stroke,
    travelTime,
    acceleration,
    deceleration,
    mass,
    isVertical,
    externalForce,
    Fx,
  }
}

export default async function callData(params: MotionParameters) {

  const {
    stroke,
    travelTime,
    pauseTime,
    acceleration,
    deceleration,
    mass,
    isVertical,
    externalForce,
    maxSpeed,
    useMaxSpeedMode,
    lever_Mx,
    lever_My,
    lever_Mz,
    lever_Fy,
    lever_Fz,
  } = params;

  const totalTime = travelTime + pauseTime;

  const Fx = externalForce + mass * Math.max(acceleration/1000, deceleration/1000) + (mass * (isVertical ? GRAVITY : 0));
  console.log({Fx});

  function calculateModuleTorque(M_zsInertia: number, M_pmInertia: number, M_idleTorque: number, lead: number) {
        const Mod_fullInertia = Number(M_zsInertia) + (Number(M_pmInertia) * stroke/1000);
        const loadInertia = (mass * Math.pow((lead / 1000) / (2 * Math.PI), 2) + Mod_fullInertia);
        const externalTorque = ((externalForce * ((lead/1000) / (2 * Math.PI))) );
        const constantLoadTorque = externalTorque + M_idleTorque;
        const maxRPM = (v1 / 1000 * 60 ) / (lead / 1000);
        const dynamicTorqueA = (loadInertia) * ((Math.PI * maxRPM)/(30 * t1));
        const maxTorque = (dynamicTorqueA + constantLoadTorque);
    return(
      maxTorque
    )
  }

  function calculateServiceLife(mod_Mx: number, mod_My: number, mod_Mz: number, mod_Zd: number, mod_lever: number, mod_GSLM: number){

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
      const mod_guideServiceLife = 1 / Math.pow(fv, 3) * Number(mod_GSLM);
      
      return(
        mod_guideServiceLife
      )
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
    
    throw new Error('Решение не сходится. Попробуйте другие параметры.');
  }

    let v1: number;
    let t1: number;
    let t2: number;
    let t3: number;
    let maxSpeedStroke: number | undefined;
    let velocityAtMaxSpeed: number | undefined;
  

    if (useMaxSpeedMode) {
    // Calculate using max speed mode
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
  } else {
    // Calculate using travel time mode with iterative method
    try {
      v1 = findMaxVelocity(stroke, travelTime, acceleration, deceleration);
      t1 = v1 / acceleration;
      t3 = v1 / deceleration;
      t2 = travelTime - t1 - t3;
      
      if (t2 < 0) {
        throw new Error('Профиль перемещения невозможен с текущим набором вводных параметров.');
      }
    } catch (error) {
      throw new Error('Профиль перемещения невозможен с текущим набором вводных параметров. Увеличьте время перемещения или ускорение/замедление.');
    }
  }

    console.log({v1});


    // Await the promises to get the actual data arrays
    const LMdataArray = await getLMData();
    const MotorDataArray = await getMotData();
    const GearboxDataArray = await getGBData();
    
    //console.log("LinearModule.xlsx data:");
    //console.log(LMdataArray);
    //console.log(LMdataArray[0].name); // имя первого привода


    const filteredLMData = LMdataArray.filter(
      module =>  
      Number(module.mod_maxSpeed) > v1/1000
      && Number(module.mod_maxAcc) > Math.max(acceleration/1000, deceleration/1000)
      && (Number(module.M_maxTorque) * 0.25) < calculateModuleTorque(Number(module.M_zsInertia), Number(module.M_pmInertia), Number(module.M_idleTorque), Number(module.lead))
      && calculateServiceLife(Number(module.mod_Mx), Number(module.mod_My), Number(module.mod_Mz), Number(module.mod_Zd), Number(module.mod_lever), Number(module.mod_GSLM)) > 1500
      && (Number(module.M_maxTorque) * 0.85) > calculateModuleTorque(Number(module.M_zsInertia), Number(module.M_pmInertia), Number(module.M_idleTorque), Number(module.lead))); // фильтрация по нескольким параметрам и сохранение в новый массив
    
    console.log(filteredLMData);
    


  
    
  return{
    
  }
}




