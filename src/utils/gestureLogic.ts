/**
 * Gesture recognition logic based on hand landmarks.
 * MediaPipe landmarks follow the 21-point hand model.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export type GestureType = 'HELLO' | 'GOOD' | 'PEACE' | 'STOP' | 'POINT' | 'NONE';

const GESTURE_LABELS: Record<GestureType, string> = {
  HELLO: 'Hello / Welcome',
  GOOD: 'Good / Yes',
  PEACE: 'Victory / Two',
  STOP: 'Stop / Warning',
  POINT: 'Look / One',
  NONE: '...'
};

/**
 * Calculates the Euclidean distance between two 3D points.
 */
function getDistance(a: Landmark, b: Landmark): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + 
    Math.pow(a.y - b.y, 2) + 
    Math.pow(a.z - b.z, 2)
  );
}

/**
 * Heuristic-based gesture recognition.
 * Landmarks:
 * 0: WRIST
 * 4: THUMB_TIP
 * 8: INDEX_FINGER_TIP
 * 12: MIDDLE_FINGER_TIP
 * 16: RING_FINGER_TIP
 * 20: PINKY_TIP
 */
export function recognizeGesture(landmarks: Landmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return 'NONE';

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // Distances from wrist
  const dIndex = getDistance(wrist, indexTip);
  const dMiddle = getDistance(wrist, middleTip);
  const dRing = getDistance(wrist, ringTip);
  const dPinky = getDistance(wrist, pinkyTip);
  const dThumb = getDistance(wrist, thumbTip);

  // Simple heuristics
  // 1. Point (Index tip is far, others are close to wrist)
  if (dIndex > 0.4 && dMiddle < 0.25 && dRing < 0.25 && dPinky < 0.25) {
    return 'POINT';
  }

  // 2. Peace (Index and Middle are far, others close)
  if (dIndex > 0.4 && dMiddle > 0.4 && dRing < 0.25 && dPinky < 0.25) {
    return 'PEACE';
  }

  // 3. Stop / Hello (All fingers extended)
  if (dIndex > 0.35 && dMiddle > 0.35 && dRing > 0.35 && dPinky > 0.3) {
    return 'STOP';
  }

  // 4. Thumbs Up (Thumb up, others curled)
  // Check if thumb is higher (lower y) than others
  if (thumbTip.y < indexTip.y && thumbTip.y < middleTip.y && dIndex < 0.25 && dMiddle < 0.25) {
    return 'GOOD';
  }

  return 'NONE';
}

export function getGestureLabel(gesture: GestureType): string {
  return GESTURE_LABELS[gesture];
}
