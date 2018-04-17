import React from 'react';
import {render} from 'react-dom';
import Tone     from 'tone';
import Bouzouki from './Bouzouki';
import UI from './UI';

document.addEventListener('DOMContentLoaded', _ => {
	// Word Count
	document.querySelector('footer').innerText =
		Array.prototype.map.call(document.querySelectorAll('section > *'), el => 
			el.innerText.split(/\s+/mi).length).reduce((a, b) => a+b) + ' / 2000 words';

	// References
	document.querySelectorAll('section > h1').forEach(el => {
		if (el.innerText !== 'References')
			return;

		const references = Array.prototype.map.call(document.querySelectorAll('a[title]'), (el, idx) =>
			`<p>${idx + 1} ${el.getAttribute('title')}</p>`).join();

		el.insertAdjacentHTML('afterend', references);
	})

	let root = document.createElement('div');

	const bouzouki = new Bouzouki(1024);
	
	render(<UI synth={bouzouki} />, root);
	
	document.getElementsByTagName('body')[0].appendChild(root);

});
