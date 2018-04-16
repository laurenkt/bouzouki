import React from 'react';
import {render} from 'react-dom';
import autobind from 'autobind-decorator';
import memoize from 'memoized-class-decorator';
import Tone     from 'tone';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class Synth {
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

	constructor(size) {
		this.size = size;
		this.scriptProcessorNode = Tone.context.createScriptProcessor(size, 1, 1);
		this.scriptProcessorNode.onaudioprocess = this.onAudioProcess;
		this.scriptProcessorNode.connect(Tone.Master);
	}

	pluck(f0, pluck, pickup, damping) {
		const fs = 44100;
		const T = 1/fs // Period
		const L = this.L = Math.floor(0.5 * fs/f0); // String length in samples
		let x = pluck; // Pluck position as proportion of string length
		this.pickup = Math.floor(L * pickup);

		this.r = -1 * (0.9 + ((1-damping)*0.1)); // Bridge reflection coefficient

		let p = x*(L-1); // Find point on string corresponding to pluck position

		// Generate excitation function (initial displacement)
		const k = Math.floor(p);
		for (let n = 0; n < Math.round(L/2); n++) {
			this.excitation[n] = this.excitation[L-n-1] = (n/(L/2))/2;
		}
		this.ex_remaining = L;
	}

	@autobind
	onAudioProcess(e) {
		let y = e.outputBuffer.getChannelData(0);
		const k = e.inputBuffer.length;
		const L = this.L;

		if (this.ex_remaining > 0) {
			for (let i = 0; i < this.ex_remaining; i++) {
				this.left[i] = this.right[i] = this.excitation[i];	
			}
			this.ex_remaining = 0;
		}

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

			y[n] = this.left[this.pickup] + this.right[this.pickup];
		}
	}

}

const synth = new Synth(1024);

class SynthUI extends React.PureComponent {
	state = {
		f0: 100,
		pluck: 0.9,
		pickup: 0.95,
		damping: 0.12,
		autoplay: false,
	}

	@autobind
	onClickPlay(e) {
		if (e)
			e.preventDefault();

		const {f0, pluck, pickup, damping} = this.state;

		synth.pluck(f0, pluck, pickup, damping);
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
			<Slider value={f0} min={80} max={500} onChange={this.onChange('f0')} />
			<Slider value={pluck} max={0.5} max={1} step={0.01} onChange={this.onChange('pluck')} />
			<Slider value={pickup} min={0.5} max={1} step={0.01} onChange={this.onChange('pickup')} />
			<Slider value={damping} min={0.1} max={0.2} step={0.002} onChange={this.onChange('damping')} />
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
