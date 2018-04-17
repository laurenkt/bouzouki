import React from 'react';
import {render} from 'react-dom';
import Tone     from 'tone';
import Bouzouki from './Bouzouki';
import UI from './UI';
import TableOfContents from './TableOfContents';

import './style.scss';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

document.addEventListener('DOMContentLoaded', _ => {
	// Word Count
	$('footer').innerText =
		Array.prototype.map.call($$('section > *'), el => 
			el.innerText.split(/\s+/mi).length).reduce((a, b) => a+b) + ' / 2000 words';

	// References
	$$('section > *').forEach(el => {
		if (el.innerText !== 'References')
			return;

		const references = Array.prototype.map.call($$('a[title]'), (el, idx) =>
			`<p>${idx + 1} ${el.getAttribute('title')}</p>`).join();

		el.insertAdjacentHTML('afterend', references);
	})

	let toc = [];
	$$('section > h2').forEach((el, idx) => {
		el.id = el.innerText
			// All lowercase
			.toLowerCase()
			// Remove any remaining characters that don"t conform to the URL
			.replace(/[^a-z0-9 _-]+/g, "")
			// Compress all separators into the chosen separator
			.replace(/[_ -]+/g, '-')
			// Remove any leading or trailing separators
			.replace(/(^[_ -]+|[_ -]+$)/g, "")
			.trim();
 
		toc.push({title: el.innerText, id: el.id});
	})

	const tocRoot = document.createElement('div');
	render(<TableOfContents toc={toc} />, tocRoot);
	$('body').insertBefore(tocRoot, $('section'));

	const bouzouki = new Bouzouki(512);

	const uiRoot = document.createElement('div');
	render(<UI synth={bouzouki} />, uiRoot);
	$('body').insertBefore(uiRoot, tocRoot);
});
