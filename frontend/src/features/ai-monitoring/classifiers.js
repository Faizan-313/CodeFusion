import {
  YAW_THRESHOLD,
  PITCH_UP_THRESHOLD,
  PITCH_DOWN_THRESHOLD,
  GAZE_X_THRESHOLD,
  GAZE_Y_THRESHOLD,
} from "./constants.js";


// Classify head pose relative to a calibrated baseline.
export function classifyHead({ yaw, pitch }, baseline) {
  const y = yaw - (baseline?.yaw ?? 0);
  const p = pitch - (baseline?.pitch ?? 0);

  if (y > YAW_THRESHOLD) return "head_right";
  if (y < -YAW_THRESHOLD) return "head_left";
  if (p < -PITCH_UP_THRESHOLD) return "head_up";
  if (p > PITCH_DOWN_THRESHOLD) return "head_down";
  return null;
}


//Classify gaze relative to a calibrated baseline.
export function classifyGaze({ x, y }, baseline) {
  const gx = x - (baseline?.gazeX ?? 0);
  const gy = y - (baseline?.gazeY ?? 0);

  if (gx > GAZE_X_THRESHOLD) return "gaze_right";
  if (gx < -GAZE_X_THRESHOLD) return "gaze_left";
  if (gy > GAZE_Y_THRESHOLD) return "gaze_down";
  if (gy < -GAZE_Y_THRESHOLD) return "gaze_up";
  return null;
}

export const HEAD_KEYS = [
  "head_left",
  "head_right",
  "head_up",
  "head_down",
];

export const GAZE_KEYS = ["gaze_left", "gaze_right", "gaze_up", "gaze_down"];
