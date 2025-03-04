WebAudio Bouzouki: Real-time Physical Modelling
==============

In this article an implementation of a Karplus-Strong plucked string synthesiser is discussed. The synthesiser runs in real-time in modern web-browsers using a WebAudio implementation (written in Javascript). It is intended to be useful for use for procedural audio in web-based games, as the parameters are customisable. This particular implementation focuses on reproducing the tone of a bouzouki as realistically as possible.

<figure>
	![Ozark 2222 Bouzouki](images/ozark_2222_bouzouki.png)
	<figcaption>Ozark 2222 bouzouki</figcaption>
</figure>

<figure>
	<audio controls>
		<source src="audio/sample.mp3" type="audio/mpeg" />
		Your browser does not support the audio element.
	</audio>
	<figcaption>Recording of the instrument</figcaption>
</figure>

The bouzouki is a traditional greek instrument, commonly with 6 or 8 strings arranged in courses of 2 strings per course. The particular bouzouki used as a basis, the Ozark 2222, is a 4-course instrument (8 strings). These strings are typically tuned to the same note (though not necessarily in the same octave), so the sound they produce is quite a resonant, drone-like sound (listen to the audio example in the figure above).

Background
----------

Karplus and Strong discovered in the early 1980s that low-pass filtering a wavetable on every pass produced relatively sounding string synthesis for the time [cite][ks]. This is a simple technique but is the basis for the physical modelling approach used here. 

A model of a string exists whereby a wave travels along the string. When it hits the nut or the bridge at either end, some amount of this wave is diffused (loss), and some is reflected back along the string in the other direction. This produces acoustic waves. Using simple filtering at this modelled bridge, non-linearity is introduced which produces interesting, naturalistic sounds (see figure below).

<figure>
	![Karplus-Strong block diagram](images/ks_block.png)
	<figcaption>Karplus-Strong block diagram (attribution: <a href="https://commons.wikimedia.org/wiki/File:Karplus-strong-schematic.svg">PoroCYon CC-BY-SA-3.0</a>)</figcaption>
</figure>

<strong>What makes a model 'physical'?</strong> The manipulation of 'physical' properties rather than signal processing ones. For instance, we can adjust the 'length' of the string or the amount of damping it has, rather than adjusting the frequency or the waveshape directly. This is a complex system, we we expect these parameters to map in complex ways to these underlying signal processing parameters, and produce interesting outputs.

Implementation
--------------

There are several layers to this simple implementation:

A one dimensional implementation of a plucked string synthesiser (see <code>src/PluckedString.js</code>). This is built upon Matlab examples provided by Damian Murphy. The losses at the bridge are modelled with a constant loss factor and a simple non-recursive moving-average filter (number of coefficients is adjustible, but the coeffients themselves are not: it will always be the mean sample value).

The shape of the excitation function can be adjusted by adjusting the 'pluck' parameter. This corresponds to where specifically on the string the excitation occurs. The excitation itself is a simple linear ramp and fade. It was intended to experiment with different plucking shapes but this was not implemented.

This is duplicated eight times to create the eight strings of the instrument.

An attempt was made to introduce coupling between the strings to develop the inter-string resonances that are characteristic of the instrument [cite][realistic]. However, it is not obvious what impact this potentially naïve implementation has.

The summed output of this system is convolved with an impulse response from an instrument body (in this case a Taylor acoustic guitar as no bouzouki IRs were readily available). This isn't strictly a physical mode, but rather part of a physics-inspired system. It does produce results far more realistically than a simple model would be able to.

A slight variation on parameters was added. This is meant to emulate the natural playing of the instrument; every time you pluck on the real strings, there will be slightly different amounts of damping and slightly different pluck positions. These changes add to the natural sound of the synthesis.

Evaluation
----------

Further to the 'systems' approach, it would be useful to evaluate the effectiveness of the convolution approach to generate the instrument body. Would it be more effective to model the body more fully? That way things could be parameterised. In the case of this model, an IR from a Taylor acoustic guitar is being used to model the body. The original plan was to utilise an anechoic chamber to record an IR from within the body of the reference bouzouki that was used when designing the synthesiser. Unfortunately this was not completed in time.

Originally the model used a linear factor to control the amount of losses at the bridge. The model is enhanced to use a non-recursive moving average filter. More than a small handful of coefficients would increase latency but in practice that's not a problem as the tone drops off with only a very small number of coefficients.

The coefficients does seem to have a huge impact on the tone of the resulting sound, and the difference between 1 or 2 coefficients, or 2 or 3, is quite vast. The original KS algorithm and many subsequent algorithms only use the simplest two-sample filter [cite][ks]. In order to get more granular control over the tone it might be helpful to use a recursive filter design where the cut-off frequency or gradient can be adjusted somewhat.

Tolonen etc. note that modelling tension coupling of the string to the instrument body is important for the naturalness of the synthesised tone [cite][tension]. This approach does not seem too computationally expensive to be performed in real-time, although would require the implementation of a fractional delay line (this does lend itself to the DSP-style implementation used in this synthesiser).

Much attention was given to try and replicate the characteristic resonance that the real instrument has. The speculation was that the proximity of the strings on each course to eachother, and their similar tuning, causes a lot of sympathetic resonance between these strings. This would account for the instrument's characteristic drone. The attempt to introduce this coupling between strings does not seem to produce noticable results, however. Given more time, analysis would be done to see what impact should be expected if any. The literature [cite][realistic] does note that tuning of the string coupling is very important for the effect.

The fact that this model is controlled using F0 instead of string length is not ideal. The transformation between the two is simple, but unfortunately not performed. An additional method could then be provided to 'fret' the string at a certain fret.

The differences in thickness between the strings is not modelled, so the model is effectively not like a real bouzouki, with 8 equal length strings of different guage. Instead it is 8 differently lengthed strings of the same guage. Some kind of modelling of the strings that accounts for their different sizes in more than one dimension, or for the different acoustic impedances of each string, may improve the model significantly.

The default parameters of the model are tuned by ear. A more realistic model may be developed with a different methodology: taking recordings of the bouzouki in an anechoic chamber, each individual string, and their effect together. Using these recordings spectrograms could be created. The synthesiser could then be played with different parameters and recorded, creating spectrograms of those recordings. By comparing these spectrograms and adjusting the parameter models, a more optimal set of tunings could be found. To duplicate the realism of the instrument, it may be useful to have different parameter settings for each string, governed by master parameters to the overall instrument. This could go some way to allieviate the problems of not modelling the individual string thicknesses.

It is clear there is vast scope for improvement with 35 years of published research and development on string synthesis since the original Karplus-Strong paper. The emerging WebAudio ecosystem could benefit greatly from a more sophisticated entry into this category.

Colophon
--------

This system and report were written in Markdown and designed in Javascript using WebAudio, React, with live-updating word count. Please contact the author if you have interesting WebAudio projects.

The current state of WebAudio does pose some practical problems for implementation: the scriptProcessorNode API, which is the API used to do frame-by-frame DSP for this synthesiser, is currently deprecated and not recommended for use. This is because all DSP processing is done in the main thread with the browser UI, and therefore moving sliders and adjusting the layout can cause glitches in the audio output (as you will be able to observe through experimentation). The replacement AudioWorklet API, which should be far more efficient and will run in its own thread, is not currently enabled by default in major browsers. Given another year of progression of browser technology much more sophisticated real-time processing could be achieved.


References
----------

[ks]: http://www.jstor.org/stable/3680062 "Digital Synthesis of Plucked-String and Drum Timbres (K Karplus & A Strong). 1983."
[tension]: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.205.3502&rep=rep1&type=pdf "Simulation of Plucked Strings Exhibiting Tension Modulation Driving Force (T Tolonen, C Erkut, V Välimäki, M Karjalainen). 1999."
[realistic]: http://lib.tkk.fi/Diss/2002/isbn9512261901/article6.pdf "Methods for Modeling Realistic Playing in Acoustic Guitar Synthesis (M Laurson, C Erkut, V Välimäki, M Kuuskankare). 2001."
