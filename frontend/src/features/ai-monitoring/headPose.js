import { LM } from "./constants.js";

//Estimate head pose from MediaPipe FaceMesh landmarks.
export function computeHeadPose(lm) {
  const nose = lm[LM.noseTip];
  const left = lm[LM.leftFace];
  const right = lm[LM.rightFace];
  const top = lm[LM.forehead];
  const bottom = lm[LM.chin];
  const leftEye = lm[LM.leftEyeOuter];
  const rightEye = lm[LM.rightEyeOuter];

  const faceWidth = Math.abs(right.x - left.x) || 1e-6;
  const faceHeight = Math.abs(bottom.y - top.y) || 1e-6;

  const faceCenterX = (left.x + right.x) / 2;
  const faceCenterY = (top.y + bottom.y) / 2;

  const yaw = (nose.x - faceCenterX) / faceWidth;
  const pitch = (nose.y - faceCenterY) / faceHeight;
  const roll =
    (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) /
    Math.PI;

  return { yaw, pitch, roll };
}
