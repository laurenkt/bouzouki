import React from 'react';
import {render} from 'react-dom';
import Tone     from 'tone';
import Bouzouki from './Bouzouki';
import UI from './UI';

import './style.scss';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

document.addEventListener('DOMContentLoaded', _ => {
	// Word Count
	$('footer').innerText =
		Array.prototype.map.call($$('section > *'), el => 
			el.innerText.split(/\s+/mi).length).reduce((a, b) => a+b) + ' / 2000 words';

	// References
	$$('section > h1').forEach(el => {
		if (el.innerText !== 'References')
			return;

		const references = Array.prototype.map.call($$('a[title]'), (el, idx) =>
			`<p>${idx + 1} ${el.getAttribute('title')}</p>`).join();

		el.insertAdjacentHTML('afterend', references);
	})

	let root = document.createElement('div');

	const bouzouki = new Bouzouki(1024);
	
	render(<UI synth={bouzouki} />, root);
	
	$('body').insertBefore(root, $('section'));

});
