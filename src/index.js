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
	$$('section > h1').forEach(el => {
		if (el.innerText !== 'References')
			return;

		const references = Array.prototype.map.call($$('a[title]'), (el, idx) =>
			`<p>${idx + 1} ${el.getAttribute('title')}</p>`).join();

		el.insertAdjacentHTML('afterend', references);
	})

	let toc = [];
	$$('section > h1, section > h2, section > h3, section > h4, section > h5, section > h6').forEach((el, idx) => {
		el.id = 'heading_' + idx;
		toc.push({title: el.innerText, id: el.id});
	})

	const tocRoot = document.createElement('div');
	render(<TableOfContents toc={toc} />, tocRoot);
	$('body').insertBefore(tocRoot, $('section'));

	const bouzouki = new Bouzouki(2048);

	const uiRoot = document.createElement('div');
	render(<UI synth={bouzouki} />, uiRoot);
	$('body').insertBefore(uiRoot, tocRoot);
});
