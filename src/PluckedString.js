import Tone from 'tone';

export default class {
	left  = new Float64Array(32768);
	right = new Float64Array(32768); // Delay lines up and down the string

	bridge = undefined
	bridge_rd = 0;

	excitation = new Float64Array(32768);
	ex_remaining = 0;

	sympathetic_bridges = [];

	bridge_m0 = 0;
	bridge_m1 = 0;
	bridge_m2 = 0;

	coefficients = 2;

	pickup = 0;
	L = 0;
	r = 0;

	constructor(size) {
		this.bridge = new Float64Array(size); // Bridge delay line
	}

	pluck(f0, pluck, pickup, damping) {
		const fs = Tone.context.sampleRate;
		const L  = Math.floor(0.5 * fs/(f0/2)); // String length in samples
		
		this.pickup = Math.floor(L * pickup);
		this.r = -1 * (0.9 + ((1-damping)*0.1)); // Bridge reflection coefficient

		let p = pluck*(L-1); // Find point on string corresponding to pluck position

		// Generate excitation function (initial displacement)
		const displacement = new Float32Array(L);
		const k = Math.floor(p);
		for (let n = 0; n < k; n++) {
			displacement[n] = (n/k) * 0.5;
		}
		for (let n = k; n < L; n++) {
			displacement[n] = (1-((n-k)/(L-k))) * 0.5;
		}

		this.L = L;
		this.excite(displacement);
	}

	excite(data) {
		for (let n = 0; n < data.length; n++) {
			this.excitation[n] = data[n];
		}
		this.ex_remaining = data.length;
	}

	bridge_del(negative_offset) {
		let idx = this.bridge_rd + negative_offset;

		while (idx < 0)
			idx += this.bridge.length;

		while (idx >= this.bridge.length)
			idx -= this.bridge.length;

		return this.bridge[idx];
			//	(this.bridge_length + this.bridge_rd + negative_offset) % this.bridge_length
	}

	bridge_mav(n) {
		let out = 0;
		let scale = 1/n;

		for (let i = 0; i < n; i++) {
			out += this.bridge_del(-i) * scale;
		}

		return out;
	}

	// y is pointer to output
	writeOut(y, k, scale) {
		if (!scale)
			scale = 1.0;

		const L = this.L;

		if (this.ex_remaining > 0) {
			for (let i = 0; i < this.ex_remaining; i++) {
				this.left[i] = this.right[i] = (this.excitation[i]/2);	
			}
			this.ex_remaining = 0;
		}

		if (L > 0) {
			let bridge = 0;
			let loss = 0;

			for (let n = 0; n < k; n++) {
				for (let i = 0; i < L-1; i++) {
					this.left[i] = this.left[i+1];
					this.right[i+1] = this.right[i];
				}
				this.right[0] = -this.left[0]; // Assume perfect reflection at nut
				bridge = this.r*this.right[L-1]; // Losses at the bridge


				this.bridge[this.bridge_rd] = bridge;

				// Moving average filter
				loss = this.bridge_mav(this.coefficients);

				this.left[L-1] = loss;

				// Recover any lost signal (total)
				loss = ((1+this.r)*this.right[L-1]) + (bridge-loss);

				for (let i = 0; i < this.sympathetic_bridges.length; i++) {
					this.sympathetic_bridges[i][this.bridge_rd] += 0.99*loss;
				}

				y[n] += this.left[this.pickup] + this.right[this.pickup] * scale;

				if (++this.bridge_rd >= this.bridge.length)
					this.bridge_rd = 0;
			}
		}
	}
}
