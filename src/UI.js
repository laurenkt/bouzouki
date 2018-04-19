import React from 'react';
import autobind from 'autobind-decorator';
import memoize from 'memoized-class-decorator';
import Slider from 'rc-slider';
import Tone from 'tone';

import 'rc-slider/assets/index.css';

export default class extends React.PureComponent {
	state = {
		f0: 220,
		pluck: 0.001,
		pickup: 0.85,
		damping: 0.018,
		coefficients: 2,

		chord: 0,
		autoplay: false,
		variation: true,
		body: true,

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

		const {f0, pluck, pickup, damping} = this.state;

		this.props.synth.strings[0].pluck(
			f0,
			Math.max(0, Math.min(1, pluck+ this.vary(0.02))),
			Math.max(0.5, Math.min(0.99, pickup+ this.vary(0.02))),
			Math.max(0, Math.min(0.2, damping+ this.vary(0.01)))
		);
	}

	@autobind
	onClickChord(e) {
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
					notes[i] + this.vary(notes[i]*0.01),
					Math.max(0, Math.min(1, pluck+ this.vary(0.02))),
					Math.max(0.5, Math.min(0.99, pickup+ this.vary(0.02))),
					Math.max(0, Math.min(0.2, damping+ this.vary(0.01)))
				),
				`+${direction ? 0.03*i : 0.03*(notes.length - i - 1)}`
			);
		}	
		Tone.Transport.start();
	}

	vary(factor) {
		const {variation} = this.state;

		if (variation) {
			return Math.random()*factor;
		}
		else {
			return 0;
		}
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

		this.onClickChord();
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
			if (value.target)
				this.setState({[key]: value.target.checked});
			else
				this.setState({[key]: value});

			if (key == 'body') {
				this.props.synth.instrumentBody.wet.value = value.target.checked ? 1 : 0;
			}
			if (key == 'coefficients') {
				this.props.synth.strings.forEach(string => string.coefficients = value);
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
		const {f0, pluck, pickup, damping, autoplay, coefficients, variation, body} = this.state;
		const {ratio, threshold, release, attack, knee} = this.state;

		return <div className="synthesiser">
			<p>Use a modern version of Chrome, Safari, or Firefox to use this application. The browser must support WebAudio. Tested on Safari 11.1. To reset to default settings, refresh the page.</p>
			<div className="controls">
				Pluck Position {pluck}
				<Slider value={pluck} max={0.5} max={1} step={0.001}
					onChange={this.onChange('pluck')} />
				Pickup Position {pickup}
				<Slider value={pickup} min={0.5} max={0.99} step={0.01}
					onChange={this.onChange('pickup')} />
				Damping {damping}
				<Slider value={damping} min={0} max={0.2} step={0.002}
					onChange={this.onChange('damping')} />
				Coefficients {coefficients}
				<Slider value={coefficients} min={1} max={10} step={1}
					onChange={this.onChange('coefficients')} />
				<label>
					<input type="checkbox" checked={body} onChange={this.onChange('body')} />
					 Instrument Body
				</label>
				<label>
					<input type="checkbox" checked={variation} onChange={this.onChange('variation')} />
					 Random Variation
				</label>
				<div className="extra">
					F0 {f0}
					<Slider value={f0} min={80} max={500}
						onChange={this.onChange('f0')} />
					<button onClick={this.onClickPlay}>String</button>
				</div>
				<div className="extra">
					<button onClick={this.onClickChord}>Chord</button>
					<button onClick={this.onClickAutoplay}>Autoplay {autoplay ? 'enabled' : 'disabled'}</button>
				</div>
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
					<span>This is not part of the synthesiser, but does help control how audible the effect is.</span>
				</div>
			</div>
		</div>;
	}
}
