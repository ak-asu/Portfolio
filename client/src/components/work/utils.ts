export enum CharacterState {
  Resting = 'resting',
  Working = 'working',
  Moving = 'moving',
}

export const buildingWidth = 200;
export const gapWidth = 100;
export const roadWidth = 90;
export const floorHeight = 80;
export const sceneHeight = 540;
export const characterSize = 24;
export const stateSwitchDuration = 240;
export const floorSwitchDuration = 240;
export const buildingSwitchDuration = 240;
export const roadLevel = sceneHeight - roadWidth + characterSize / 2;