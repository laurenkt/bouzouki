import React from 'react';
import {render} from 'react-dom';
import autobind from 'autobind-decorator';
import memoize from 'memoized-class-decorator';
import Tone     from 'tone';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class PluckedString {
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

class Synth {

	strings = [
		new PluckedString(),
		new PluckedString(),
		new PluckedString(),
		new PluckedString(),
		new PluckedString(),
		new PluckedString(),
		new PluckedString(),
		new PluckedString(),
	]

	constructor(size) {
		this.size = size;
		this.scriptProcessorNode = Tone.context.createScriptProcessor(size, 1, 1);
		this.scriptProcessorNode.onaudioprocess = this.onAudioProcess;
		this.scriptProcessorNode.connect(Tone.Master);
	}

	pluck(string, f0, pluck, pickup, damping) {
		this.strings[string].pluck(f0, pluck, pickup, damping);
	}

	@autobind
	onAudioProcess(e) {
		const y = e.outputBuffer.getChannelData(0);
		const k = e.inputBuffer.length;

		// Clear output buffer before passing to strings (since they sum)
		for (let n = 0; n < k; n++)
			y[n] = 0;

		for (let i = 0; i < this.strings.length; i++)
			this.strings[i].writeOut(y, k, 1/this.strings.length);
	}

}

const synth = new Synth(1024);

class SynthUI extends React.PureComponent {
	state = {
		f0: 100,
		pluck: 0.001,
		pickup: 0.85,
		damping: 0.15,
		autoplay: false,
	}

	@autobind
	onClickPlay(e) {
		if (e)
			e.preventDefault();

		const {f0, pluck, pickup, damping} = this.state;


		const chord = new Tone.Pattern((time, string) => {
			//	synth.pluck(string, 50 + Math.random() * f0, pluck, pickup, damping);
		}, [0, 1, 2, 3], 'upDown');
		//chord.start();

		synth.pluck(0, 98.0, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1);
		Tone.Transport.schedule(() => synth.pluck(1, 123.47, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.02');
		Tone.Transport.schedule(() => synth.pluck(2, 146.83, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.04');
		Tone.Transport.schedule(() => synth.pluck(3, 196, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.06');
		Tone.Transport.schedule(() => synth.pluck(4, 246.94, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.08');
		Tone.Transport.schedule(() => synth.pluck(5, 293.66, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.10');
		Tone.Transport.schedule(() => synth.pluck(6, 392, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.12');
		Tone.Transport.schedule(() => synth.pluck(7, 493.88, Math.random()/50, 1-Math.random()*0.2, 0.1+Math.random()*0.1), '+0.14');
		Tone.Transport.start();
	}

	@autobind
	onClickAutoplay(e) {
		e.preventDefault();

		this.setState({autoplay: !this.state.autoplay});

		setTimeout(this.autoplay, 1000);
	}

	@autobind
	autoplay() {
		if (!this.state.autoplay)
			return;

		this.onClickPlay();
		setTimeout(this.autoplay, 1000);
	}

	@autobind
	@memoize
	onChange(key) {
		return value => {
			this.setState({[key]: value});
		}
	}

	render() {
		const {f0, pluck, pickup, damping, autoplay} = this.state;

		return <div>
			<div className="controls">
				F0 {f0}
				<Slider value={f0} min={80} max={500} onChange={this.onChange('f0')} />
				Pluck Position {pluck}
				<Slider value={pluck} max={0.5} max={1} step={0.001} onChange={this.onChange('pluck')} />
				Pickup Position {pickup}
				<Slider value={pickup} min={0.5} max={1} step={0.01} onChange={this.onChange('pickup')} />
				Damping {damping}
				<Slider value={damping} min={0.1} max={0.2} step={0.002} onChange={this.onChange('damping')} />
			</div>
			<button onClick={this.onClickPlay}>Play</button>
			<button onClick={this.onClickAutoplay}>{autoplay && '[Yes] '} Autoplay</button>
		</div>;
	}
}

document.addEventListener('DOMContentLoaded', _ => {
	let root = document.createElement('div');
	
	render(<SynthUI />, root);
	
	document.getElementsByTagName('body')[0].appendChild(root);
});
