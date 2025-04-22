export function findClosestNumber(/**@type {number} */ closestTo, /**@type {number[]} */ nums) {
	let currentClosest = 0,
		dif = -1;

	for (let i = 0; i < nums.length; i++) {
		const currentNum = nums[i],
			currentDif = Math.abs(currentNum - closestTo);

		if (dif < 0) dif = currentDif;
		if (currentDif <= dif) currentClosest = currentNum;

		dif = currentDif;
	}

	return currentClosest;
}
