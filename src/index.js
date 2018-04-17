import React from 'react';
import {render} from 'react-dom';
import Tone     from 'tone';
import Bouzouki from './Bouzouki';
import UI from './UI';

document.addEventListener('DOMContentLoaded', _ => {
	let root = document.createElement('div');

	const bouzouki = new Bouzouki(1024);
	
	render(<UI synth={bouzouki} />, root);
	
	document.getElementsByTagName('body')[0].appendChild(root);
});
