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
		damping: 0.15,
		autoplay: false,
		coefficients: 2,
	}

	@autobind
	onClickPlay(e) {
		if (e)
			e.preventDefault();

		//this.playChord([98, 123.47, 146.83, 196, 246.94, 293.66, 392, 493.88]);
		this.playChord([196, 98, 293.7, 147.8, 220, 220, 293.6, 293.7]);
	}

	strumDirection = false

	playChord(notes) {
		const {f0, pluck, pickup, damping} = this.state;

		for (let i = 0; i < notes.length; i++) {
			Tone.Transport.schedule(() =>
				this.props.synth.pluck(
					i,
					notes[i],
					Math.max(0, Math.min(1, pluck+ Math.random()/50)),
					Math.max(0, Math.min(1, pickup+ Math.random()*0.2)),
					Math.max(0, Math.min(1, damping+ Math.random()*0.1))
				),
				`+${this.strumDirection ? 0.03*i : 0.03*(notes.length - i - 1)}`
			);
		}	
		Tone.Transport.start();

		this.strumDirection = !this.strumDirection;
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

			if (key == 'coefficients') {
				this.props.synth.strings.forEach(string => string.coefficients = value);
			}
		}
	}

	render() {
		const {f0, pluck, pickup, damping, autoplay, coefficients} = this.state;

		return <div className="synthesiser">
			<div className="controls">
				F0 {f0}
				<Slider value={f0} min={80} max={500} onChange={this.onChange('f0')} />
				Pluck Position {pluck}
				<Slider value={pluck} max={0.5} max={1} step={0.001} onChange={this.onChange('pluck')} />
				Pickup Position {pickup}
				<Slider value={pickup} min={0.5} max={1} step={0.01} onChange={this.onChange('pickup')} />
				Damping {damping}
				<Slider value={damping} min={0} max={0.2} step={0.002} onChange={this.onChange('damping')} />
				Coefficients {coefficients}
				<Slider value={coefficients} min={1} max={10} step={1} onChange={this.onChange('coefficients')} />
			</div>
			<button onClick={this.onClickPlay}>Play</button>
			<button onClick={this.onClickAutoplay}>{autoplay && '[Yes] '} Autoplay</button>
		</div>;
	}
}
