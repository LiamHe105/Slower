/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private sourceNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private currentType: string | null = null;
  private isPlaying: boolean = false;
  private currentVolume: number = 0.5;

  init() {
    if (!this.ctx) {
      // Create audio context supporting prefix
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  getType() {
    return this.currentType;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getAnalyser() {
    return this.analyserNode;
  }

  stop() {
    this.isPlaying = false;
    this.currentType = null;

    if (this.sourceNode) {
      try {
        (this.sourceNode as any).stop();
      } catch (e) {}
      this.sourceNode = null;
    }

    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }

    if (this.lfoNode) {
      try {
        this.lfoNode.stop();
      } catch (e) {}
      this.lfoNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  play(type: 'rain' | 'cafe' | 'forest' | 'ocean' | 'white_noise') {
    this.init();
    if (!this.ctx) return;

    // Stop current playing sound
    this.stop();

    this.isPlaying = true;
    this.currentType = type;

    // Volume node
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

    // Analyser node for gorgeous visual meters!
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 64;

    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);

    // Generate procedural noise
    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const outputList = noiseBuffer.getChannelData(0);

    // Filter buffer for different styles of noise
    if (type === 'white_noise') {
      for (let i = 0; i < bufferSize; i++) {
        outputList[i] = Math.random() * 2 - 1;
      }
      const bufferSource = this.ctx.createBufferSource();
      bufferSource.buffer = noiseBuffer;
      bufferSource.loop = true;

      // Filter to make it less abrasive (Low-pass filter at 1200Hz)
      const lpFilter = this.ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(1500, this.ctx.currentTime);

      bufferSource.connect(lpFilter);
      lpFilter.connect(this.gainNode);
      bufferSource.start();
      this.sourceNode = bufferSource;

    } else if (type === 'ocean') {
      // Ocean waves: generate brown noise, and use an LFO (Low Frequency Oscillator) 
      // to sweep a filter frequency between low and mid range to simulate water moving
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise filter approximation
        outputList[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = outputList[i];
        outputList[i] *= 3.5; // Compensate for loss of energy
      }

      const bufferSource = this.ctx.createBufferSource();
      bufferSource.buffer = noiseBuffer;
      bufferSource.loop = true;

      // Active dynamic sweeping filter
      const sweepFilter = this.ctx.createBiquadFilter();
      sweepFilter.type = 'lowpass';
      sweepFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // very slow 12-second swell cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(250, this.ctx.currentTime); // sweep range

      lfo.connect(lfoGain);
      lfoGain.connect(sweepFilter.frequency);
      sweepFilter.frequency.setValueAtTime(320, this.ctx.currentTime); // center frequency

      bufferSource.connect(sweepFilter);
      sweepFilter.connect(this.gainNode);

      lfo.start();
      bufferSource.start();

      this.sourceNode = bufferSource;
      this.lfoNode = lfo;

    } else if (type === 'rain') {
      // Rainy day: pink/brown noise for rain rumble + high pitched click transients for water droplets
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        outputList[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        outputList[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const bufferSource = this.ctx.createBufferSource();
      bufferSource.buffer = noiseBuffer;
      bufferSource.loop = true;

      // Filter out deep rumbles and very high pitch
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(500, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(0.5, this.ctx.currentTime);

      bufferSource.connect(bandpass);
      bandpass.connect(this.gainNode);
      bufferSource.start();

      this.sourceNode = bufferSource;

      // Add actual sparse clicking sounds to represent droplets!
      this.scriptNode = this.ctx.createScriptProcessor(4096, 0, 1);
      this.scriptNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
          out[i] = 0;
          if (Math.random() < 0.0006) {
            // Drop splash simulation: instantaneous ramp down resonant frequency
            let splashVal = Math.random() * 0.3;
            for (let j = 0; j < 30 && (i + j) < out.length; j++) {
              out[i + j] += Math.sin(j * 0.5) * splashVal * (1 - j / 30);
            }
          }
        }
      };
      this.scriptNode.connect(this.gainNode);

    } else if (type === 'forest') {
      // Forest Breeze: highpassed pink noise modulated with slow breeze waves + sparse clicks mimicking chirping birds
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        outputList[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6;
        outputList[i] *= 0.15;
        b6 = white * 0.115926;
      }

      const bufferSource = this.ctx.createBufferSource();
      bufferSource.buffer = noiseBuffer;
      bufferSource.loop = true;

      // Warm leaves filter sweeping slowly (breeze)
      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(600, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8 second cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(300, this.ctx.currentTime); // breeze width

      lfo.connect(lfoGain);
      lfoGain.connect(breezeFilter.frequency);

      bufferSource.connect(breezeFilter);
      breezeFilter.connect(this.gainNode);

      lfo.start();
      bufferSource.start();

      this.sourceNode = bufferSource;
      this.lfoNode = lfo;

      // Add actual sparse bird synthesis notes!
      this.scriptNode = this.ctx.createScriptProcessor(4096, 0, 1);
      let step = 0;
      this.scriptNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
          out[i] = 0;
          if (step > 0) {
            // Synthesize bird-like chirping sliding oscillator
            const freq = 4000 + Math.sin(step * 0.05) * 800 + Math.sin(step * 0.2) * 500;
            out[i] = Math.sin(step * (freq / 44100) * 2 * Math.PI) * 0.03 * (1 - (step / 3000));
            step--;
          } else if (Math.random() < 0.0001) {
            step = 1500 + Math.floor(Math.random() * 1000); // Trigger a chirp sequence
          }
        }
      };
      this.scriptNode.connect(this.gainNode);

    } else if (type === 'cafe') {
      // Cafe: Low rumbling hum (brown noise) + occasional soft clinking plates, cups and murmur
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        outputList[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = outputList[i];
        outputList[i] *= 1.2;
      }

      const bufferSource = this.ctx.createBufferSource();
      bufferSource.buffer = noiseBuffer;
      bufferSource.loop = true;

      // Filter to make it a warm background rumble
      const bpFilter = this.ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
      bpFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      bufferSource.connect(bpFilter);
      bpFilter.connect(this.gainNode);
      bufferSource.start();
      this.sourceNode = bufferSource;

      // Add custom sparse porcelain clinking sounds!
      this.scriptNode = this.ctx.createScriptProcessor(4096, 0, 1);
      let activeClinkDecay = 0;
      let clinkFreq = 1800;
      this.scriptNode.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < out.length; i++) {
          out[i] = 0;
          if (activeClinkDecay > 0) {
            // High frequency high-Q ring (resembles dishes clinking)
            out[i] = Math.sin(activeClinkDecay * (clinkFreq / 44100) * 2 * Math.PI) * 0.05 * (activeClinkDecay / 2000);
            activeClinkDecay -= 1;
          } else if (Math.random() < 0.00015) {
            activeClinkDecay = 1000 + Math.floor(Math.random() * 1000);
            clinkFreq = 1500 + Math.random() * 1000;
          }
        }
      };
      this.scriptNode.connect(this.gainNode);
    }
  }
}

// Export single shared manager instance
export const audioManager = new AudioManager();
