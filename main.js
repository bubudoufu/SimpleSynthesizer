"use strict";
const audioCtx = new AudioContext();
const masterVolume = audioCtx.createGain();
const biquadFilter = audioCtx.createBiquadFilter();
biquadFilter.type = "lowpass";
const oscillators = {};
const keyNames = {};
const keyUpFrequencys = {};
let frequency;
let octave1 = 0;
let clickKey;

// 接続
biquadFilter.connect(masterVolume);
masterVolume.connect(audioCtx.destination);

// キーボード設定
const keymap = {
  z: 60, // C4
  s: 61, // C#4
  x: 62, // D4
  d: 63, // D#4
  c: 64, // E4
  v: 65, // F4
  g: 66, // F#4
  b: 67, // G4
  h: 68, // G#4
  n: 69, // A4
  j: 70, // A#4
  m: 71, // B4
  ",": 72, // C5
};

// NoteON
document.addEventListener("keydown", e => {
  if (keymap[e.key] == undefined) return;
  // キーが押しっぱなしの場合はreturnする
  if (keyNames[e.key] == true) return;
  // 音階の周波数を計算して割り当てる
  frequency =
    440.0 * Math.pow(2.0, (keymap[e.key] + Number(octave1) - 69.0) / 12.0);
  keyNames[e.key] = true;
  keyUpFrequencys[e.key] = frequency;
  noteON(frequency);
});

document.addEventListener("mousedown", e => {
  if (keymap[e.target.textContent] == undefined) return;
  frequency =
    440.0 *
    Math.pow(
      2.0,
      (keymap[e.target.textContent] + Number(octave1) - 69.0) / 12.0
    );
  keyUpFrequencys[e.target.textContent] = frequency;
  clickKey = e.target.textContent;
  noteON(frequency);
});

function noteON(frequency) {
  // オシレーター作成・設定
  const osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();

  osc.type = "sawtooth";
  // デチューンの設定 半音100セント 1オクターブ1200セント
  osc.detune.value = document.getElementById("detune1").value;

  osc2.type = "sawtooth";
  osc2.detune.value = document.getElementById("detune2").value;
  // フィルターに接続
  osc.connect(biquadFilter);
  osc2.connect(biquadFilter);
  // 音程を設定
  osc.frequency.value = frequency;
  osc2.frequency.value = frequency;
  oscillators[frequency] = [osc, osc2];
  // 音を鳴らす
  osc.start(audioCtx.currentTime);
  osc2.start(audioCtx.currentTime);
}

// NoteOff
document.addEventListener("mouseup", () => {
  if (clickKey === undefined) return;
  noteOff(clickKey);
  clickKey = undefined;
});

document.addEventListener("keyup", e => {
  if (keyNames[e.key] !== true) return;
  keyNames[e.key] = false;
  noteOff(e.key);
});

function noteOff(key) {
  // リリースされた音程だけを止める
  const keyUpFrequency = keyUpFrequencys[key];
  oscillators[keyUpFrequency].forEach((oscillator) => {
    oscillator.stop(audioCtx.currentTime);
  });
}
// リアルタイム処理
function update() {
  document.querySelector(".freqVal").innerHTML = `Cutoff:<span>${
    document.getElementById("freq").value
  }</span>Hz`;
  document.querySelector(".qVal").innerHTML = `Q:<span>${
    document.getElementById("q").value
  }</span>`;
  document.querySelector(".detuneVal1").innerHTML = `Detune:<span>${
    document.getElementById("detune1").value
  }</span>cent`;
  document.querySelector(".detuneVal2").innerHTML = `Detune:<span>${
    document.getElementById("detune2").value
  }</span>cent`;
  octave1 = octave.octave.value;
  biquadFilter.frequency.value = document.getElementById("freq").value;
  biquadFilter.Q.value = document.getElementById("q").value;
  masterVolume.gain.value = document.getElementById("gain").value;

  requestAnimationFrame(update);
}

update();
