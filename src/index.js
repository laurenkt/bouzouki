import React from 'react';
import {render} from 'react-dom';
import Tone     from 'tone';
import Bouzouki from './Bouzouki';
import UI from './UI';

document.addEventListener('DOMContentLoaded', _ => {
	document.querySelector('footer').innerText =
		Array.prototype.map.call(document.querySelectorAll('section > *'), el => 
			el.innerText.split(/\s+/mi).length).reduce((a, b) => a+b) + ' words';



	let root = document.createElement('div');

	const bouzouki = new Bouzouki(1024);
	
	render(<UI synth={bouzouki} />, root);
	
	document.getElementsByTagName('body')[0].appendChild(root);

});
