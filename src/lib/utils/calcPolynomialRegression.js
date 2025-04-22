/**
 * Calculates coefficients (a, b, c, d) for 3rd degree polynomial regression
 * @param {number} xPoint,
 * @param {Array<number>} xValues - Array of x-values
 * @param {Array<number>} yValues - Array of corresponding y-values
 * @param {number?} roundedTo - Value to round cubicPolynomial
 * @returns {Object & {coefficients: {a:number, b:number, c:number, d:number}, cubicPolynomial: number}}} Coefficients {a, b, c, d} of the polynomial ax³ + bx² + cx + d
 */
export function calcPolynomialRegression(xPoint, xValues, yValues, roundedTo = null) {
	function calculateCubicCoefficients() {
		if (xValues.length !== yValues.length || xValues.length < 4) {
			throw new Error('Need at least 4 data points and equal x/y arrays');
		}

		const n = xValues.length;
		let sumX = 0,
			sumX2 = 0,
			sumX3 = 0,
			sumX4 = 0,
			sumX5 = 0,
			sumX6 = 0;
		let sumY = 0,
			sumXY = 0,
			sumX2Y = 0,
			sumX3Y = 0;

		for (let i = 0; i < n; i++) {
			const x = xValues[i];
			const x2 = x * x;
			const x3 = x2 * x;
			const x4 = x3 * x;
			const x5 = x4 * x;
			const x6 = x5 * x;
			const y = yValues[i];

			sumX += x;
			sumX2 += x2;
			sumX3 += x3;
			sumX4 += x4;
			sumX5 += x5;
			sumX6 += x6;
			sumY += y;
			sumXY += x * y;
			sumX2Y += x2 * y;
			sumX3Y += x3 * y;
		}

		// Construct the normal equations matrix for cubic regression
		const matrix = [
			[n, sumX, sumX2, sumX3],
			[sumX, sumX2, sumX3, sumX4],
			[sumX2, sumX3, sumX4, sumX5],
			[sumX3, sumX4, sumX5, sumX6]
		];

		const vector = [sumY, sumXY, sumX2Y, sumX3Y];

		// Solve the system of equations (using Gaussian elimination)
		const coefficients = solveSystem(matrix, vector);

		return {
			a: coefficients[3], // x³ coefficient
			b: coefficients[2], // x² coefficient
			c: coefficients[1], // x coefficient
			d: coefficients[0] // constant term
		};
	}

	/**
	 * Solves a system of linear equations using Gaussian elimination
	 * @param {Array<Array<number>>} matrix - Coefficient matrix
	 * @param {Array<number>} vector - Right-hand side vector
	 * @returns {Array<number>} Solution vector
	 */
	function solveSystem(matrix, vector) {
		const n = vector.length;
		let result = new Array(n);

		// Create augmented matrix
		for (let i = 0; i < n; i++) {
			matrix[i].push(vector[i]);
		}

		// Perform Gaussian elimination
		for (let i = 0; i < n; i++) {
			// Find the row with the maximum element in current column
			let maxRow = i;
			for (let j = i + 1; j < n; j++) {
				if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
					maxRow = j;
				}
			}

			// Swap rows
			[matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

			// Make all rows below this one 0 in current column
			for (let j = i + 1; j < n; j++) {
				const factor = matrix[j][i] / matrix[i][i];
				for (let k = i; k < n + 1; k++) {
					matrix[j][k] -= factor * matrix[i][k];
				}
			}
		}

		// Back substitution
		for (let i = n - 1; i >= 0; i--) {
			result[i] = matrix[i][n] / matrix[i][i];
			for (let j = i - 1; j >= 0; j--) {
				matrix[j][n] -= matrix[j][i] * result[i];
			}
		}

		return result;
	}

	const coefficients = calculateCubicCoefficients();

	// Example output: {a: 0.0833, b: -0.5833, c: 1.6667, d: 0.8333}

	// Now you can use these coefficients in your polynomial function
	/**
	 * @param {Object & {a:number, b:number, c:number, d:number}} coeff
	 */
	function cubicPolynomial(coeff) {
		return coeff.a * xPoint ** 3 + coeff.b * xPoint ** 2 + coeff.c * xPoint + coeff.d;
	}

	const cubicPolynomialValue = cubicPolynomial(coefficients);

	return {
		coefficients,
		cubicPolynomial:
			roundedTo == undefined || roundedTo == null
				? cubicPolynomialValue
				: Number(cubicPolynomialValue.toFixed(roundedTo))
	};
}
