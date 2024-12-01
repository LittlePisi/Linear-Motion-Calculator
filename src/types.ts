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
//  accelerationTorque: number;
//  dynamicTorqueA: number;
//  constantLoadTorque: number;
//  loadInertia: number;
//  angAcceleration: number;
//  mrpm: number;
//  v1: number;
//  decelerationTorque: number;
}

export interface TorquePoint {
  time: number;
  torque: number;
  rpm: number;
  position: number;
  velocity: number;
}