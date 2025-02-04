


export function linspace(start: number, stop: number, num: number) {
	const step = (stop - start) / (num - 1);
	const arr: number[] = [];
	for (let i = 0; i < num; i++) {
		arr.push(start + step * i);
	}
	return arr;
}

export function lookupMonotonic(t: number, arr: number[], method: string = 'nearest') {
	let i = Math.round((arr.length * (t - arr[0])) / (arr[arr.length - 1] - arr[0]));
	i = Math.min(i, arr.length - 2);
	i = Math.max(i, 1);
	const direction = t > arr[i] ? 1 : -1;

	while (i > 0 && i < arr.length - 1) {
		if (i + direction >= arr.length - 1 || i + direction <= 0) {
			i += direction;
			break;
		} else if (
			(direction == 1 && arr[i + direction] > t) ||
			(direction == -1 && arr[i + direction] < t)
		) {
			switch (method) {
				case 'before':
					i = direction > 0 ? i : i + direction;
					break;
				case 'after':
					i = direction > 0 ? i + direction : i;
					break;
				default:
					if (Math.abs(arr[i + direction] - t) < Math.abs(arr[i] - t)) {
						i = i + direction;
					}
					break;
			}
			break;
		}
		i += direction;
	}
	return i;
}

export const max = (arr: number[]) => {
	return arr.reduce((a, b) => Math.max(a, b), -Infinity);
};

export const min = (arr: number[]) => {
	return arr.reduce((a, b) => Math.min(a, b), Infinity);
};

export const sum = (arr: number[]) => {
	return arr.reduce((a, b) => a + b);
};

export const mean = (arr: number[]) => {
	return sum(arr) / arr.length;
};

export function objmap(obj: Record<string, any>, fun: (a: any)=>any) {
  return Object.fromEntries(Object.entries(obj).map(([k, v])=>[k, fun(v)]));
}

export function objfilter(obj: Record<string, any>, fun: (a: any)=>boolean) {
  return Object.fromEntries(Object.entries(obj).filter(([k, v])=>fun(v)));
}