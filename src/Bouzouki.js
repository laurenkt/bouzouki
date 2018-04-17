import Tone from 'tone';
import PluckedString from './PluckedString';
import autobind from 'autobind-decorator';

export default class {

	constructor(size) {
		this.size = size;

		this.strings = [
			new PluckedString(size),
			new PluckedString(size),
			new PluckedString(size),
			new PluckedString(size),
			new PluckedString(size),
			new PluckedString(size),
			new PluckedString(size),
			new PluckedString(size),
		]

		this.strings[0].sympathetic_bridges = [
			this.strings[1].bridge,
			this.strings[2].bridge,
		]

		this.strings[1].sympathetic_bridges = [
			this.strings[0].bridge,
			this.strings[2].bridge,
			this.strings[3].bridge,
		]

		this.strings[2].sympathetic_bridges = [
			this.strings[0].bridge,
			this.strings[1].bridge,
			this.strings[3].bridge,
			this.strings[4].bridge,
		]

		this.strings[3].sympathetic_bridges = [
			this.strings[1].bridge,
			this.strings[2].bridge,
			this.strings[4].bridge,
			this.strings[5].bridge,
		]

		this.strings[4].sympathetic_bridges = [
			this.strings[2].bridge,
			this.strings[3].bridge,
			this.strings[5].bridge,
			this.strings[6].bridge,
		]

		this.strings[5].sympathetic_bridges = [
			this.strings[3].bridge,
			this.strings[4].bridge,
			this.strings[6].bridge,
			this.strings[7].bridge,
		]

		this.strings[6].sympathetic_bridges = [
			this.strings[4].bridge,
			this.strings[5].bridge,
			this.strings[7].bridge,
		]

		this.strings[7].sympathetic_bridges = [
			this.strings[5].bridge,
			this.strings[6].bridge,
		]

		this.instrumentBody = new Tone.Convolver('ir/taylor314ce.wav').connect(new Tone.Gain(2).toMaster());

		this.scriptProcessorNode = Tone.context.createScriptProcessor(size, 1, 1);
		this.scriptProcessorNode.onaudioprocess = this.onAudioProcess;
		this.scriptProcessorNode.connect(this.instrumentBody);
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
