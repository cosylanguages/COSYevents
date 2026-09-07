/**
 * COSYevents Wonder Voiceover & Transcript Narration Player
 * Automatically replaces .wonder-audio-player-placeholder with an interactive Web Speech API text-to-speech player.
 */
(function () {
  'use strict';

  class WonderVoiceoverPlayer {
    constructor() {
      this.synth = window.speechSynthesis;
      this.utterance = null;
      this.isPlaying = false;
      this.init();
    }

    init() {
      const placeholders = document.querySelectorAll('.wonder-audio-player-placeholder');
      if (!placeholders.length) return;

      placeholders.forEach(placeholder => {
        let transcriptText = '';
        const details = placeholder.nextElementSibling;
        if (details && details.classList.contains('transcript-details')) {
          transcriptText = details.textContent.replace('📜 Read Column Transcript', '').trim();
        } else {
          const introP = document.querySelector('.content-container p');
          transcriptText = introP ? introP.textContent.trim() : 'Welcome to I Couldnt Help But Wonder.';
        }

        const playerCard = document.createElement('div');
        playerCard.className = 'wonder-voiceover-player';
        playerCard.style.cssText = `
          background: linear-gradient(135deg, rgba(63,43,150,0.06), rgba(31,16,77,0.03));
          border: 1px solid var(--cosy-border, #E2D9C8);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        `;

        playerCard.innerHTML = `
          <button class="wonder-speech-play-btn" style="
            background: #3F2B96;
            color: white;
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 2px 8px rgba(63,43,150,0.25);
            transition: transform 0.2s ease, background 0.2s ease;
            flex-shrink: 0;
          " title="Listen to Voiceover Narration">🎙️</button>

          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #3F2B96; font-size: 0.95rem; margin-bottom: 0.2rem;">
              🎙️ Listen to Column Narration
            </div>
            <div class="speech-status-text" style="font-size: 0.85rem; color: #666;">
              Click play to listen to the audio voiceover transcript.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <select class="speech-voice-select" style="
              padding: 0.3rem 0.5rem;
              border-radius: 6px;
              border: 1px solid #ccc;
              font-size: 0.8rem;
              background: white;
              color: #333;
              max-width: 130px;
            " title="Select Voice"></select>
          </div>
        `;

        placeholder.parentNode.replaceChild(playerCard, placeholder);

        const playBtn = playerCard.querySelector('.wonder-speech-play-btn');
        const statusText = playerCard.querySelector('.speech-status-text');
        const voiceSelect = playerCard.querySelector('.speech-voice-select');

        const populateVoices = () => {
          if (!this.synth) return;
          const voices = this.synth.getVoices().filter(v => v.lang.startsWith('en'));
          voiceSelect.innerHTML = voices.map(v => `<option value="${v.name}">${v.name.replace(/Google|Microsoft|Apple/g, '').trim()} (${v.lang})</option>`).join('');
        };

        populateVoices();
        if (this.synth && this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = populateVoices;
        }

        playBtn.addEventListener('click', () => {
          if (!this.synth) {
            alert('Text-to-speech voiceover is not supported in this browser.');
            return;
          }

          if (this.isPlaying) {
            this.synth.cancel();
            this.isPlaying = false;
            playBtn.innerHTML = '🎙️';
            playBtn.style.background = '#3F2B96';
            statusText.textContent = 'Voiceover paused.';
          } else {
            this.synth.cancel();
            this.utterance = new SpeechSynthesisUtterance(transcriptText);
            this.utterance.rate = 0.95;

            const selectedVoiceName = voiceSelect.value;
            if (selectedVoiceName) {
              const voices = this.synth.getVoices();
              const matchedVoice = voices.find(v => v.name === selectedVoiceName);
              if (matchedVoice) this.utterance.voice = matchedVoice;
            }

            this.utterance.onend = () => {
              this.isPlaying = false;
              playBtn.innerHTML = '🎙️';
              playBtn.style.background = '#3F2B96';
              statusText.textContent = 'Voiceover complete.';
            };

            this.utterance.onerror = () => {
              this.isPlaying = false;
              playBtn.innerHTML = '🎙️';
              statusText.textContent = 'Voiceover error occurred.';
            };

            this.synth.speak(this.utterance);
            this.isPlaying = true;
            playBtn.innerHTML = '⏸️';
            playBtn.style.background = '#2e1f70';
            statusText.textContent = 'Playing voiceover narration...';
          }
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WonderVoiceoverPlayer());
  } else {
    new WonderVoiceoverPlayer();
  }
})();
