import React from 'react';
import autobind from 'autobind-decorator';
import memoize from 'memoized-class-decorator';
import Slider from 'rc-slider';
import Tone from 'tone';

import 'rc-slider/assets/index.css';

export default class extends React.PureComponent {
	state = {
		f0: 100,
		pluck: 0.001,
		pickup: 0.85,
		damping: 0.018,
		coefficients: 2,

		chord: 0,
		autoplay: false,

		// Compressor
		ratio: 12,
		threshold: -47,
		release: 0.25,
		attack: 0.003,
		knee: 25,
	}

	constructor(props) {
		super(props);
		
		this.updateCompressor();
	}

	@autobind
	onClickPlay(e) {
		if (e)
			e.preventDefault();

		const {chord} = this.state;

		//this.playChord([98, 123.47, 146.83, 196, 246.94, 293.66, 392, 493.88]);
		//if (chord < 4) {
		//	this.playChord([196, 98, 293.7, 147.8, 220, 220, 293.6, 293.7]);
		//}
		if (chord < 4) {
			this.playChord([246.942, 123.471, 349.228, 174.616, 220, 220, 293.6, 293.7], false);
		}
		else if (chord < 8) {
			this.playChord([293.665, 146.832, 440, 220, 220, 220, 293.6, 293.7], false);
		}
		else {
			this.playChord([261.626, 130.813, 391.955, 195.998, 220, 220, 293.6, 293.7], false);
		}
		
		this.setState({chord: (chord+1) % 12});
	}

	strumDirection = false

	playChord(notes, direction) {
		const {f0, pluck, pickup, damping} = this.state;

		if (direction === undefined) {
			direction = this.strumDirection;
			this.strumDirection = !direction;
		}

		for (let i = 0; i < notes.length; i++) {
			Tone.Transport.schedule(() =>
				this.props.synth.pluck(
					i,
					notes[i] + Math.random()*notes[i]*0.01,
					Math.max(0, Math.min(1, pluck+ Math.random()/50)),
					Math.max(0, Math.min(1, pickup+ Math.random()*0.2)),
					Math.max(0, Math.min(1, damping+ Math.random()*0.1))
				),
				`+${direction ? 0.03*i : 0.03*(notes.length - i - 1)}`
			);
		}	
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

	updateCompressor() {
		const {ratio, threshold, release, attack, knee} = this.state;
	
		this.props.synth.compressor.ratio.value = ratio;
		this.props.synth.compressor.threshold.value = threshold;
		this.props.synth.compressor.release.value = release;
		this.props.synth.compressor.attack.value = attack;
		this.props.synth.compressor.knee.value = knee;
	}

	@autobind
	@memoize
	onChange(key) {
		return value => {
			this.setState({[key]: value});

			if (key == 'coefficients') {
				this.updateCompressor();
			}
			if (key == 'ratio') {
				this.updateCompressor();
			}
			if (key == 'threshold') {
				this.updateCompressor();
			}
			if (key == 'release') {
				this.updateCompressor();
			}
			if (key == 'attack') {
				this.updateCompressor();
			}
			if (key == 'knee') {
				this.updateCompressor();
			}
		}
	}

	render() {
		const {f0, pluck, pickup, damping, autoplay, coefficients} = this.state;
		const {ratio, threshold, release, attack, knee} = this.state;

		return <div className="synthesiser">
			<div className="controls">
				F0 {f0}
				<Slider value={f0} min={80} max={500}
					onChange={this.onChange('f0')} />
				Pluck Position {pluck}
				<Slider value={pluck} max={0.5} max={1} step={0.001}
					onChange={this.onChange('pluck')} />
				Pickup Position {pickup}
				<Slider value={pickup} min={0.5} max={1} step={0.01}
					onChange={this.onChange('pickup')} />
				Damping {damping}
				<Slider value={damping} min={0} max={0.2} step={0.002}
					onChange={this.onChange('damping')} />
				Coefficients {coefficients}
				<Slider value={coefficients} min={1} max={10} step={1}
					onChange={this.onChange('coefficients')} />
				<div className="extra">
					<h1>Compressor</h1>
					Ratio {ratio}
					<Slider value={ratio} min={1} max={24} onChange={this.onChange('ratio')} />
					Threshold {threshold}
					<Slider value={threshold} min={-48} max={48} onChange={this.onChange('threshold')} />
					Release {release}
					<Slider value={release} min={0.01} max={1.0} step={0.01} onChange={this.onChange('release')} />
					Attack {attack}
					<Slider value={attack} min={0.01} max={1.0} step={0.01} onChange={this.onChange('attack')} />
					Knee {knee}
					<Slider value={knee} min={1} max={60} onChange={this.onChange('knee')} />
				</div>
			</div>
			<button onClick={this.onClickPlay}>Play</button>
			<button onClick={this.onClickAutoplay}>{autoplay && '[Yes] '} Autoplay</button>
		</div>;
	}
}
