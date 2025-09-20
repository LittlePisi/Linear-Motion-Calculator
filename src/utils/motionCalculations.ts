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
    selectedMTSetName,
    selectedLMSetName,
    selectedGBSetName,
    M_idleTorque,
    M_zsInertia,
    M_pmInertia,
    M_maxTorque,
    ScrewDLR,
    Screw_dr,
    Screw_la,
    G_idleTorque,
    G_Inertia,
    G_eff,
    G_maxTorque,
    M_max,
    N_max,
    M_nom,
    N_nom,
    M_torqueConstant,
    M_fp,
    N_fp,
    N_d,
    lever_Mx,
    lever_My,
    lever_Mz,
    lever_Fx,
    lever_Fy,
    lever_Fz,
    mod_Mx,
    mod_My,
    mod_Mz,
    mod_lever,
    mod_GSLM,
    mod_Zd,
    mod_pic
  } = params;


  // Validation
  if (stroke <= 0) throw new Error('Ход должен быть больше 0');
  if (!useMaxSpeedMode && travelTime < 0) throw new Error('Время перемещения должно быть больше 0');
  if (!useMaxSpeedMode && acceleration <= 0) throw new Error('Ускорение должно быть больше 0');
  if (!useMaxSpeedMode && deceleration <= 0) throw new Error('Замедление должно быть больше 0');
  if (useMaxSpeedMode && (!maxSpeed || maxSpeed <= 0)) throw new Error('Макс. скорость должна быть больше 0');
  if (mass < 0) throw new Error('Перемещаемая масса должна быть больше 0');
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
  

  // Calculate load inertia referred to motor shaft
  const loadInertia = (mass * Math.pow(leadInMeters / (2 * Math.PI), 2) + externalInertiaScaled + Mod_fullInertia + G_Inertia);

  // Calculate inertia ratio
  const inertiaRatio = 1 + ((loadInertia / Math.pow(reductionRatio, 2)) / motorRotorInertiaScaled);

  const totalTime = t1 + t2 + t3 + pauseTime;
  const totalPoints = Math.ceil(totalTime * POINTS_PER_SECOND);
  const timeStep = totalTime / totalPoints;

  // Scale idle torque according to reduction ratio
  const scaledIdleTorque = (M_idleTorque);

  // Calculate constant torques
  const gravityTorque = isVertical ? (mass * GRAVITY * leadInMeters) / (2 * Math.PI ) : 0;
  
  const externalTorque = ((externalForce * ((leadInMeters) / (2 * Math.PI))) );
  
  const constantLoadTorque = gravityTorque + externalTorque + scaledIdleTorque;
  

  // Calculate dynamic torques for each phase
  const dynamicTorqueA = (loadInertia + motorRotorInertiaScaled) * ((Math.PI * mrpm)/(30 * t1));
  
  const dynamicTorqueD = (loadInertia + motorRotorInertiaScaled) * ((Math.PI * mrpm)/(30 * t3));
  

  // Calculate total torques for each phase
  const accelerationTorque = (((dynamicTorqueA + constantLoadTorque) / reductionRatio) / G_eff) + G_idleTorque;
  
  const constantVelocityTorque = (((constantLoadTorque) / reductionRatio) / G_eff) + G_idleTorque;
  
  const decelerationTorque = (((dynamicTorqueD - constantLoadTorque) / reductionRatio) / G_eff) + G_idleTorque;
  

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
    
    sumTorque += Math.abs(torque);
    maxTorque = Math.max(maxTorque, Math.abs(torque));
    maxRPM = Math.max(maxRPM, Math.abs(rpm));
  }

  // Calculating mean torque
  const meanTorque = isVertical
    ? Math.sqrt( ((Math.pow(accelerationTorque, 2) * t1) + (Math.pow(constantVelocityTorque, 2) * t2) + (Math.pow(decelerationTorque, 2) * t3)) / totalTime) 
    : Math.sqrt( ((Math.pow(accelerationTorque, 2) * t1) + (Math.pow(constantVelocityTorque, 2) * t2) + (Math.pow(decelerationTorque, 2) * t3)) / totalTime);
  
    const meanRPM = (2 * maxRPM) / 3;

    const calcValue = M_nom;


  // Feed force calculation
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

    const Fmax = Math.max(Fa, Fd);
    
    const M_Fmax = M_maxTorque / ( (leadInMeters) / ( 2 * 3.14 ) );

  // Screw life calculation
    const fw = 1;

    let Lr : number;

    let Ld : number;

    if (ScrewDLR > 0){
      Lr = ( Math.pow((ScrewDLR / (Fxm * fw) ), 3)) * Math.pow(10, 6);
      Ld = (Lr * lead) / Math.pow(10, 6);
    } else {
      Lr = 0;
      Ld = 0;
    }

  // Components load ratio
   const LM_loadRatio = Fmax / M_Fmax * 100;

   const GB_loadRatio = (maxTorque * reductionRatio) / G_maxTorque * 100;

   const M_loadRatio =  meanTorque / M_nom * 100;

   const MotorName = selectedMTSetName;
    
  
  // Screw critical speed and force calculation
    let LMCcheck = selectedLMSetName.indexOf("LMC");
    let Mf : number;
    let Nc : number;
    let Np : number;
    let Fk : number;
    let Fp : number;

    if (LMCcheck >= 0) {
      Mf = 0.45;          // Speed factor for LMC 
    } else {
      Mf = 0.689;         // Speed factor for fixed-supported screw
    }

    const Nf = 0.5;       // Force factor for fixed-supported screw
  
    const Lt = stroke + Screw_la;

    if (ScrewDLR > 0){
      Nc = 2.71 * Math.pow(10, 8) * ((Mf * Screw_dr) / (Math.pow(Lt, 2)));
      Np = Nc * 0.8;

      Fk = 40720 * ((Nf * Math.pow(Screw_dr, 4)) / Math.pow(Lt, 2) );
      Fp = Fk * 0.5;
    } else {
      Nc = 0;
      Np = 0;
      Fk = 0;
      Fp = 0;
    }

  // Calculating motor current
  
  const rmsCurrent : number = meanTorque / M_torqueConstant;
  const maxCurrent : number = maxTorque / M_torqueConstant;

  // Calculating linear guide service life
  const Mx = isVertical
              ? 0
              : ((mass * GRAVITY) * lever_My/1000);
  const My = isVertical
              ? ((mass * GRAVITY) * lever_Mz/1000 + mod_lever/1000) - (externalForce * lever_Fz/1000) + (Fxm * mod_Zd/1000)
              : (Fxm * lever_Mz/1000 + mod_lever/1000) + ((mass * GRAVITY) * lever_Mx/1000) - (externalForce * lever_Fz/1000) + (Fxm * mod_Zd/1000);
  const Mz = isVertical
              ? ((mass * GRAVITY) * lever_My/1000) - (externalForce * lever_Fy/1000)
              : (externalForce * lever_Fy/1000);

  const fv = Mx/mod_Mx + My/mod_My + Mz/mod_Mz;
  const mod_guideServiceLife = 1 / Math.pow(fv, 3) * mod_GSLM;


  // Console result output
  
    console.log("Motor parameters:");
    console.log({MotorName});
    console.log({M_nom});
    console.log({M_max});
    console.log({N_nom});
    console.log({N_max});
    console.log({motorRotorInertia});
    console.log({M_torqueConstant});

    console.log("Linear module parameters:");
    console.log({selectedLMSetName});
    console.log({lead});
    console.log({M_idleTorque});
    console.log({M_maxTorque});
    console.log({Mod_fullInertia});
    console.log({ScrewDLR});
    console.log({Mf});

    console.log("Motor parameters:");
    console.log({selectedGBSetName});
    console.log({reductionRatio});
    console.log({G_idleTorque});
    console.log({G_maxTorque});
    console.log({G_eff});
    console.log({G_Inertia});

    console.log("Calculated parameters:");
    console.log({accelerationTorque});
    console.log({constantVelocityTorque});
    console.log({decelerationTorque});
    console.log({meanRPM});
    console.log({maxRPM});
    console.log({meanTorque});
    console.log({maxTorque});
    console.log({Fxm});
    console.log({Fmax});
    console.log({Np});
    console.log({Fp});
    console.log({rmsCurrent});
    console.log({maxCurrent});
    console.log({Mx});
    console.log({My});
    console.log({Mz});

  // Calculating max allowable motor torque at slope
    const k = (M_max - 0) / (N_max - N_d);
    const a = (0 + k * N_max) / M_max;
    const M_slope = maxRPM > N_d ? (a * M_max - k * maxRPM) : M_max; 
    

  // Overload/overspeed error handling 
    if (M_Fmax <= Fmax) throw new Error('Превышение допустимого усилия подачи для привода. Выберите больший типоразмер привода или шаг винта.');
    if (ScrewDLR > 0 && Np <= (maxRPM / reductionRatio)) throw new Error ('Превышение критической частоты вращения винта. Выберите больший типоразмер привода или больший шаг винта.')
    if (ScrewDLR > 0 && Fp <= Fmax) throw new Error ('Превышение безопасного усилия подачи для выбранной величины хода. Выберите больший типоразмер привода.')
    if (G_maxTorque <= (maxTorque * reductionRatio)) throw new Error('Превышение допустимого момента для редуктора. Выберите больший типоразмер или другое передаточное число.');
    if (M_slope <= (maxTorque)) throw new Error('Превышение максимального момента двигателя. Выберите больший типоразмер или измените другие параметры расчёта.');
    if (M_nom <= (meanTorque)) throw new Error('Превышение номинального момента двигателя. Выберите больший типоразмер или измените другие параметры расчёта.');
    if (N_nom <= (meanRPM)) throw new Error('Превышение номинальной скорости двигателя. Выберите редуктор с меньшим передаточным числом или измените другие параметры расчёта.');
    if (N_max <= (maxRPM)) throw new Error('Превышение максимальной скорости двигателя. Выберите редуктор с меньшим передаточным числом или измените другие параметры расчёта.');


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
    MotorName,
    M_max,
    M_nom,
    N_max,
    N_nom,
    M_fp,
    N_fp,
    N_d,
    Ld,
    rmsCurrent,
    maxCurrent,
    mod_guideServiceLife,
  };
}