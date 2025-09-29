export interface MotionParameters {
  stroke: number;
  travelTime: number;
  acceleration: number;
  deceleration: number;
  mass: number;
  lead: number;
  externalInertia: number;
  reductionRatio: number;
  motorRotorInertia: number;
  pauseTime: number;
  maxSpeed?: number;
  useMaxSpeedMode: boolean;
  isVertical: boolean;
  showTorque: boolean;
  showRPM: boolean;
  showVelocity: boolean;
  showPosition: boolean;
  externalForce: number;
  idleTorque: number;
  value: number;
  M_idleTorque: number;
  M_zsInertia: number;
  M_pmInertia: number;
  M_maxTorque: number;
  ScrewDLR: number;
  Screw_dr: number;
  Screw_la: number;
  G_idleTorque: number;
  G_Inertia: number;
  G_eff: number;
  G_maxTorque: number;
  selectedLMSetName: string;
  selectedGBSetName: string;
  selectedMTSetName: string;
  M_nom: number;
  N_nom: number;
  M_max: number;
  N_max: number;
  M_torqueConstant: number;
  M_fp: number;
  N_fp: number;
  N_d: number;
  lever_Mx: number;
  lever_My: number;
  lever_Mz: number;
  lever_Fx: number;
  lever_Fy: number;
  lever_Fz: number;
  mod_Mx: number;
  mod_My: number;
  mod_Mz: number;
  mod_lever: number;
  mod_GSLM: number;
  mod_Zd: number;
  mod_pic: string;
  mot_pic: string;
  mod_maxSpeed: number,
  mod_maxAcc: number,
}

export interface MotionResults {
  maxVelocity: number;
  velocityAtMaxSpeed?: number;
  accelerationTime: number;
  constantVelocityTime: number;
  decelerationTime: number;
  pauseTime: number;
  totalCycleTime: number;
  maxTorque: number;
  meanTorque: number;
  maxRPM: number;
  meanRPM: number;
  inertiaRatio: number;
  torqueProfile: TorquePoint[];
  maxSpeedStroke?: number;
  calcValue: number;
  accelerationTorque: number;
  decelerationTorque: number;
  constantLoadTorque: number;
  dynamicTorqueA: number;
  dynamicTorqueD: number;
  LM_loadRatio: number;
  GB_loadRatio: number;
  M_loadRatio: number;
  Ld : number;
  MotorName: string;
  M_nom: number;
  N_nom: number;
  M_max: number;
  N_max: number;
  rmsCurrent: number;
  maxCurrent: number;
  M_fp: number;
  N_fp: number;
  N_d: number;
  mod_guideServiceLife: number,
//  constantLoadTorque: number;
//  loadInertia: number;
//  angAcceleration: number;
//  mrpm: number;
//  v1: number;
}

export interface TorquePoint {
  time: number;
  torque: number;
  rpm: number;
  position: number;
  velocity: number;
}
