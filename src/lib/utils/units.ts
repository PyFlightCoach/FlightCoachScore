
export const unitMultipliers = {
	'm': 1,
	'm/s': 1,
	'rad': 1,
	'rad/s': 1,
	'°': Math.PI / 180,
	'°/s': Math.PI / 180,
	'turn': 2 * Math.PI,
	'turn/s': 2 * Math.PI,
  '1' : 1
};
export type Unit = keyof typeof unitMultipliers;

export const unitOptions: Record<string, (keyof typeof unitMultipliers)[]> = {
	'm': ['m'],
	'rad': ['°', 'rad', 'turn'],
	'm/s': ['m/s'],
	'rad/s': ['°/s', 'rad/s', 'turn/s'],
  '1' : ['1']
};
export type BaseUnit = keyof typeof unitOptions;