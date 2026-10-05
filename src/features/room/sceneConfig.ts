// Model world units are normalized to a 10-unit longest dimension.
// Screen placement is measured from model geometry; never borrowed from the reference room.
export const sceneConfig = {
  model: `${import.meta.env.BASE_URL}models/low_poly_room.glb`,
  scale: 10 / 372.1778,
  room: {
    position: [11, 9, 13] as [number, number, number],
    target: [0, 1.5, 0] as [number, number, number],
  },
  screen: {
    position: [-3.29, 3.349835, -1.429922] as [number, number, number],
    rotation: [0, Math.PI / 2, 0] as [number, number, number],
    width: 1.81,
    height: 1.015,
  },
  desktop: { width: 960, height: 538 },
  fov: 42,
  transitionSeconds: 2.4,
};
