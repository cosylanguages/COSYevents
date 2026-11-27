/**
 * COSYevents Background Music (BGM) Player & Ambient Sound Generator
 * Provides relaxing ambient music / background audio toggles for Speaking Clubs and events.
 */
(function () {
  'use strict';

  class BGMPlayer {
    constructor() {
      this.audioCtx = null;
      this.isPlaying = false;
      this.isMuted = false;
      this.volume = 0.15;
      this.nodes = [];
      this.timerId = null;
      this.initUI();
    }

    initUI() {
      if (document.getElementById('cosy-bgm-container')) return;

      const container = document.createElement('div');
      container.id = 'cosy-bgm-container';
      container.setAttribute('aria-label', 'Background Music Controls');
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid var(--cosy-border, #e0e0e0);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        border-radius: 30px;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        color: #333;
        transition: all 0.3s ease;
      `;

      container.innerHTML = `
        <button id="cosy-bgm-toggle" style="
          background: #3F2B96;
          color: white;
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(63,43,150,0.3);
          transition: transform 0.2s ease, background 0.2s ease;
        " title="Toggle Background Ambient Music">🎵</button>
        <span id="cosy-bgm-status" style="font-weight: 600; color: #3F2B96; font-size: 0.85rem; min-width: 90px;">Background Music</span>
        <input type="range" id="cosy-bgm-volume" min="0" max="1" step="0.05" value="0.15" style="
          width: 70px;
          accent-color: #3F2B96;
          cursor: pointer;
        " title="Volume">
      `;

      document.body.appendChild(container);

      const toggleBtn = document.getElementById('cosy-bgm-toggle');
      const volumeInput = document.getElementById('cosy-bgm-volume');
      const statusSpan = document.getElementById('cosy-bgm-status');

      toggleBtn.addEventListener('click', () => {
        if (!this.isPlaying) {
          this.startBGM();
          toggleBtn.innerHTML = '⏸️';
          toggleBtn.style.background = '#2e1f70';
          statusSpan.textContent = 'Ambient BGM Playing';
        } else {
          this.stopBGM();
          toggleBtn.innerHTML = '🎵';
          toggleBtn.style.background = '#3F2B96';
          statusSpan.textContent = 'Background Music';
        }
      });

      volumeInput.addEventListener('input', (e) => {
        this.volume = parseFloat(e.target.value);
        if (this.masterGain) {
          this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.1);
        }
      });
    }

    startBGM() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.isPlaying = true;
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Pentatonic warm ambient synth frequencies (Hz)
      const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

      const playChord = () => {
        if (!this.isPlaying) return;

        // Choose 3 soft harmonizing notes
        const note1 = scale[Math.floor(Math.random() * 4)];
        const note2 = scale[Math.floor(Math.random() * 4) + 3];
        const note3 = scale[Math.floor(Math.random() * 3) + 6];

        [note1, note2, note3].forEach(freq => {
          const osc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.value = freq;

          const now = this.audioCtx.currentTime;
          const duration = 4 + Math.random() * 3;

          noteGain.gain.setValueAtTime(0, now);
          noteGain.gain.linearRampToValueAtTime(0.08, now + 1.5);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          osc.connect(noteGain);
          noteGain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + duration);
        });

        // Schedule next gentle phrase transition
        this.timerId = setTimeout(playChord, 3500 + Math.random() * 2000);
      };

      playChord();
    }

    stopBGM() {
      this.isPlaying = false;
      if (this.timerId) clearTimeout(this.timerId);
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.setTargetAtTime(0.0001, this.audioCtx.currentTime, 0.2);
      }
    }
  }

  // Auto-init BGM Player on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BGMPlayer());
  } else {
    new BGMPlayer();
  }
})();
