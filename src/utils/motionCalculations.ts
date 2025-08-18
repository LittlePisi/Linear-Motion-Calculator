import { MotionParameters, MotionResults, TorquePoint } from '../types';

const GRAVITY = 9.81; // m/s²
const POINTS_PER_SECOND = 550;
const MAX_ITERATIONS = 50;
const TOLERANCE = 0.0001;


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

export function calculateMotionParameters(params: MotionParameters): MotionResults {
  const {
    stroke,
    travelTime,
    acceleration,
    deceleration,
    mass,
    lead,
    externalInertia,
    reductionRatio,
    motorRotorInertia,
    pauseTime,
    maxSpeed,
    useMaxSpeedMode,
    isVertical,
    externalForce,
    idleTorque,
    M_idleTorque,
    M_zsInertia,
    M_pmInertia,
    M_maxTorque,
    G_idleTorque,
    G_Inertia,
    G_eff,
    G_maxTorque,
    M_max,
    N_max,
    M_nom,
    N_nom,
  } = params;

  // Validation
  if (stroke <= 0) throw new Error('Ход должен быть больше 0');
  if (!useMaxSpeedMode && travelTime <= 0) throw new Error('Время перемещения должно быть больше 0');
  if (!useMaxSpeedMode && acceleration <= 0) throw new Error('Ускорение должно быть больше 0');
  if (!useMaxSpeedMode && deceleration <= 0) throw new Error('Замедление должно быть больше 0');
  if (useMaxSpeedMode && (!maxSpeed || maxSpeed <= 0)) throw new Error('Макс. скорость должна быть больше 0');
  if (mass <= 0) throw new Error('Перемещаемая масса должна быть больше 0');
  if (lead <= 0) throw new Error('Постоянная подачи должна быть больше 0');
  if (externalInertia < 0) throw new Error('Внешняя инерционная нагрузка не должна быть отрицательной');
  if (reductionRatio <= 0) throw new Error('Передаточное число должно быть больше 0');
  if (motorRotorInertia <= 0) throw new Error('Момент инерции двигателя должен быть больше 0');
  if (pauseTime < 0) throw new Error('Время паузы не должно быть отрицательным');

  let v1: number;
  let t1: number;
  let t2: number;
  let t3: number;
  let maxSpeedStroke: number | undefined;
  let velocityAtMaxSpeed: number | undefined;
  
  const motorRotorInertiaScaled = motorRotorInertia / 10000;
  const externalInertiaScaled = externalInertia / 10000;

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

  // Calculate torque and RPM profiles
  const torqueProfile: TorquePoint[] = [];
  let sumTorque = 0;
  let sumRPM = 0;
  let maxTorque = 0;
  let maxRPM = 0;
  let currentPosition = 0;


  
  // Convert lead from mm/rev to m/rev
  const leadInMeters = lead / 1000;

  const mrpm = (v1/1000 * 60 ) / leadInMeters; // перемещено с 176 строки
  
  // Linear module full inertia

  const Mod_fullInertia = M_zsInertia + (M_pmInertia * stroke/1000);
  console.log({Mod_fullInertia});

  // Calculate load inertia referred to motor shaft
  const loadInertia = (mass * Math.pow(leadInMeters / (2 * Math.PI), 2) + externalInertiaScaled + Mod_fullInertia + G_Inertia);
  console.log({loadInertia});

  // Calculate inertia ratio
  const inertiaRatio = 1 + ((loadInertia / Math.pow(reductionRatio, 2)) / motorRotorInertiaScaled);

  const totalTime = t1 + t2 + t3 + pauseTime;
  const totalPoints = Math.ceil(totalTime * POINTS_PER_SECOND);
  const timeStep = totalTime / totalPoints;

  // Scale idle torque according to reduction ratio
  const scaledIdleTorque = (M_idleTorque);
  console.log({scaledIdleTorque});

  // Calculate constant torques
  const gravityTorque = isVertical ? (mass * GRAVITY * leadInMeters) / (2 * Math.PI ) : 0;
  console.log({gravityTorque});
  const externalTorque = ((externalForce * ((leadInMeters) / (2 * Math.PI))) );
  console.log({externalTorque});
  const constantLoadTorque = gravityTorque + externalTorque + scaledIdleTorque;
  console.log({constantLoadTorque});

  // Calculate dynamic torques for each phase
  //const angAcceleration =((Math.PI * mrpm)/(30 * t1));
  const dynamicTorqueA = (loadInertia + motorRotorInertiaScaled) * ((Math.PI * mrpm)/(30 * t1));
  console.log({dynamicTorqueA});
  const dynamicTorqueD = (loadInertia + motorRotorInertiaScaled) * ((Math.PI * mrpm)/(30 * t3));
  console.log({dynamicTorqueD});

  // Calculate total torques for each phase
  const accelerationTorque = (((dynamicTorqueA + constantLoadTorque) / reductionRatio) / G_eff) + G_idleTorque;
  console.log({accelerationTorque});
  const constantVelocityTorque = (((constantLoadTorque) / reductionRatio) / G_eff) + G_idleTorque;
  console.log({constantVelocityTorque});
  const decelerationTorque = (((dynamicTorqueD - constantLoadTorque) / reductionRatio) / G_eff) + G_idleTorque;
  console.log({decelerationTorque});

  for (let i = 0; i <= totalPoints; i++) {
    const time = i * timeStep;
    let velocity = 0;
    let torque = 0;

    // Determine phase and corresponding torque and velocity
    if (time <= t1) {
      // Acceleration phase
      velocity = (acceleration * time) / 1000; // Convert to m/s
      torque = accelerationTorque;
    } else if (time <= t1 + t2) {
      // Constant velocity phase
      velocity = v1 / 1000; // Convert to m/s
      torque = constantVelocityTorque;
    } else if (time <= t1 + t2 + t3) {
      // Deceleration phase
      velocity = (v1 - deceleration * (time - (t1 + t2))) / 1000; // Convert to m/s
      torque = decelerationTorque;
    }

    currentPosition += velocity * timeStep;
    const rpm = (velocity * 60 * reductionRatio) / leadInMeters;

    torqueProfile.push({ 
      time, 
      torque, 
      rpm,
      position: currentPosition * 1000, // Convert back to mm
      velocity: velocity * 1000 // Convert back to mm/s
    });

    //console.log(torqueProfile);
    

    sumTorque += Math.abs(torque);
//    sumTorque += Math.max( Math.abs(accelerationTorque) , Math.abs(decelerationTorque) )
//    sumRPM += Math.abs(rpm);
    maxTorque = Math.max(maxTorque, Math.abs(torque));
//    maxTorque = Math.max( Math.abs(accelerationTorque) , Math.abs(decelerationTorque) );
    maxRPM = Math.max(maxRPM, Math.abs(rpm));
  }

//  const meanTorque = sumTorque / torqueProfile.length;
  const meanTorque = isVertical
    ? Math.sqrt( ((Math.pow(accelerationTorque, 2) * t1) + (Math.pow(constantVelocityTorque, 2) * t2) + (Math.pow(decelerationTorque, 2) * t3)) / totalTime) 
    : Math.sqrt( ((Math.pow(accelerationTorque, 2) * t1) + (Math.pow(constantVelocityTorque, 2) * t2) + (Math.pow(decelerationTorque, 2) * t3)) / totalTime);
  
 // const meanRPM = sumRPM / torqueProfile.length;
    const meanRPM = (2 * maxRPM) / 3;

    const calcValue = M_nom;


 // Components load ratio
    const LM_loadRatio = (meanTorque * reductionRatio) / M_maxTorque * 100;

    const GB_loadRatio = (maxTorque * reductionRatio) / G_maxTorque * 100;

    const M_loadRatio =  meanTorque / M_nom * 100;


    if (M_maxTorque <= (maxTorque * reductionRatio)) throw new Error('Превышение допустимого момента для привода. Выберите больший типоразмер привода или шаг винта.');
    if (G_maxTorque <= (maxTorque * reductionRatio)) throw new Error('Превышение допустимого момента для редуктора. Выберите больший типоразмер или другое передаточное число.');
//    if (M_max <= (maxTorque)) throw new Error('Превышение максимального момента двигателя. Выберите больший типоразмер или измените другие параметры расчёта.');
    if (M_nom <= (meanTorque)) throw new Error('Превышение номинального момента двигателя. Выберите больший типоразмер или измените другие параметры расчёта.');
    if (N_nom <= (meanRPM)) throw new Error('Превышение номинальной скорости двигателя. Выберите редуктор с меньшим передаточным числом или измените другие параметры расчёта.');
//    if (M_max <= (maxRPM)) throw new Error('Превышение максимальной скорости двигателя. Выберите редуктор с меньшим передаточным числом или измените другие параметры расчёта.');

    
    console.log({meanRPM});
    console.log({maxRPM});
    console.log({meanTorque});
    console.log({maxTorque});



  return {
    maxVelocity: v1,
    velocityAtMaxSpeed,
    accelerationTime: t1,
    constantVelocityTime: t2,
    decelerationTime: t3,
    pauseTime,
    totalCycleTime: totalTime,
    maxTorque,
    meanTorque,
    maxRPM,
    meanRPM,
    inertiaRatio,
    torqueProfile,
    maxSpeedStroke,
    calcValue,
    accelerationTorque,
    decelerationTorque,
    constantLoadTorque,
    dynamicTorqueA,
    dynamicTorqueD,
    LM_loadRatio,
    GB_loadRatio,
    M_loadRatio,
//    constantLoadTorque,
//   loadInertia,
//    angAcceleration,
//    mrpm,
//   v1

  };
}
