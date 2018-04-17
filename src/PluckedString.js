import Tone from 'tone';

export default class {
	left  = new Float32Array(32768);
	right = new Float32Array(32768); // Delay lines up and down the string

	excitation = new Float32Array(32768);
	ex_remaining = 0;

	pickup = 0;
	L = 0;
	bridge = 0;
	bridge_m1 = 0;
	bridge_m2 = 0;
	r = 0;

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
			for (let n = 0; n < k; n++) {
				for (let i = 0; i < L-1; i++) {
					this.left[i] = this.left[i+1];
					this.right[i+1] = this.right[i];
				}
				this.right[0] = -this.left[0];
				this.bridge = this.r*this.right[L-1];

				this.left[L-1] = (this.bridge+this.bridge_m1+this.bridge_m2)/3;
				this.bridge_m2 = this.bridge_m1;
				this.bridge_m1 = this.bridge;

				y[n] += this.left[this.pickup] + this.right[this.pickup] * scale;
			}
		}
	}
}
