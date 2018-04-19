import React from 'react';
import {render} from 'react-dom';
import Tone     from 'tone';
import Bouzouki from './Bouzouki';
import UI from './UI';
import TableOfContents from './TableOfContents';
import uniqBy from 'lodash/uniqBy';

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

		const references = uniqBy(Array.prototype.map.call($$('a[title]'), el =>
			({title: el.getAttribute('title'), url: el.getAttribute('href')})), 
			ref => ref.title);

		$$('a[title]').forEach(el => {
			if (el.innerText === 'cite') {
				const refIdx = references.findIndex(ref => ref.title == el.getAttribute('title'));

				if (refIdx != -1) {
					el.innerText = `[${refIdx+1}]`;
					el.setAttribute('href', `#ref_${refIdx+1}`);
				}
			}		
		})

		console.log(references);
		const bibliography = references.map((ref, idx) =>
			`<p><strong>[${idx+1}]</strong> <a class="reference" id="ref_${idx+1}" href="${ref.href}">${ref.title}</a></p>`).join('');

		el.insertAdjacentHTML('afterend', bibliography);
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
