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

		const {f0, pluck, pickup, damping} = this.state;
		const {synth} = this.props;

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
				<Slider value={damping} min={0.1} max={0.2} step={0.002} onChange={this.onChange('damping')} />
				Coefficients {coefficients}
				<Slider value={coefficients} min={1} max={10} step={1} onChange={this.onChange('coefficients')} />
			</div>
			<button onClick={this.onClickPlay}>Play</button>
			<button onClick={this.onClickAutoplay}>{autoplay && '[Yes] '} Autoplay</button>
		</div>;
	}
}
