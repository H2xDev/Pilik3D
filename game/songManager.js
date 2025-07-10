import { GNode } from '@core/index.js';

const BASS_RANGE = [20, 200];
const MID_RANGE = [200, 2000];
const TREBLE_RANGE = [2000, 20000];

export class SongManager extends GNode {
  ctx = new AudioContext();
  analyser = Object.assign(this.ctx.createAnalyser(), {
    fftSize: 32,
    smoothingTimeConstant: 0.3,
  })

  gain = this.ctx.createGain();
  sourceBuffer = this.ctx.createBufferSource();

  bassValue = 0;
  midValue = 0;
  trebleValue = 0;


  freqData = new Uint8Array(this.analyser.frequencyBinCount);

  async enterTree() {
    this.gain.gain.value = 0.25;
    this.sourceBuffer.connect(this.analyser);
    this.sourceBuffer.loop = true;
    this.analyser.connect(this.gain);
    this.gain.connect(this.ctx.destination);
    await this.loadSong('/assets/music.mp3');

    window.addEventListener('keydown', (event) => {
      this.sourceBuffer.start(0);
    }, { once: true });
  }

  process() {
    this.analyser.getByteFrequencyData(this.freqData);

    this.bassValue = Math.pow(this.#calculateAverage(this.freqData, BASS_RANGE), 8);
    this.midValue = Math.pow(this.#calculateAverage(this.freqData, MID_RANGE), 8);
    this.trebleValue = Math.pow(this.#calculateAverage(this.freqData, TREBLE_RANGE), 8);
  }

  async loadSong(url) {
    const buffer = await fetch(url).then(response => response.arrayBuffer());
    this.sourceBuffer.buffer = await this.ctx.decodeAudioData(buffer);
  }

  #calculateAverage(data, range) {
    const start = Math.floor(range[0] / (this.ctx.sampleRate / 2) * this.freqData.length);
    const end = Math.ceil(range[1] / (this.ctx.sampleRate / 2) * this.freqData.length);
    let sum = 0;
    let count = 0;

    for (let i = start; i < end && i < data.length; i++) {
      sum += data[i];
      count++;
    }

    return (count > 0 ? sum / count : 0) / 255;
  }
}
