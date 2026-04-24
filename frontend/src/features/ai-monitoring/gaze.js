import { LM } from "./constants.js";

/*

Compute iris offset relative to the eye CORNERS (not eyelids).

Output: { x, y } where both are normalized by the eye's horizontal width.
  x: positive = iris toward inner corner (roughly "looking toward nose")
  y: positive = iris below corner line (looking down)
  y: negative = iris above corner line (looking up)

*/

export function computeGaze(lm) {
  const eye = (outer, inner, iris) => {
    const o = lm[outer];
    const i = lm[inner];
    const ir = lm[iris];

    const cx = (o.x + i.x) / 2;
    const cy = (o.y + i.y) / 2;
    const w = Math.abs(o.x - i.x) || 1e-6;

    return {
      x: (ir.x - cx) / w,
      y: (ir.y - cy) / w,
    };
  };

  const leftEye = eye(LM.leftEyeOuter, LM.leftEyeInner, LM.leftIris);
  const rightEye = eye(LM.rightEyeOuter, LM.rightEyeInner, LM.rightIris);

  return {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
  };
}
