/**
 * COSYevents Wonder Voiceover & Transcript Narration Player
 * Dynamically plays recorded voiceover MP3 audio when available for "I Couldn't Help But Wonder" sessions,
 * with seamless fallback to Web Speech API text-to-speech synthesis.
 */
(function () {
  'use strict';

  // 1:1 mapping between session HTML files and recorded draft MP3 audio files
  const SESSION_AUDIO_MAP = {
    'whether-raindrops-select-where-to-fall.html': 'draft1.mp3',
    'do-insects-hide-when-it-rains.html': 'draft2.mp3',
    'is-bad-weather-gods-anger.html': 'draft3.mp3',
    'always-watched-in-a-crowd.html': 'draft4.mp3',
    'why-is-everyone-copying-me.html': 'draft5.mp3',
    'feeling-empty-after-series.html': 'draft6.mp3',
    'death-of-the-album.html': 'draft7.mp3',
    'ugly-produce-anti-waste.html': 'draft8.mp3',
    'does-euthanasia-reduce-suicide-rates.html': 'draft9.mp3',
    'appreciating-amy-winehouse-after-death.html': 'draft10.mp3',
    'why-do-we-try-to-relate-to-adhd.html': 'draft11.mp3',
    'is-parenting-instinct-a-real-thing-or-scam.html': 'draft12.mp3',
    'are-traditions-hidden-monogamy.html': 'draft13.mp3',
    'collective-guilt-global-crisis.html': 'draft14.mp3',
    'are-traditions-hidden-monogamy-upper-intermediate.html': 'draft15.mp3',
    'i-have-no-time-for-it.html': 'draft16.mp3',
    'why-do-i-spend-more-when-i-earn-more.html': 'draft17.mp3',
    'does-inclusive-language-make-us-equal.html': 'draft18.mp3'
  };

  function getRootPrefix() {
    var me = document.currentScript;
    var src = me && me.getAttribute('src');
    if (!src) {
      var scripts = document.scripts;
      for (var i = scripts.length - 1; i >= 0; i--) {
        var s = scripts[i].getAttribute('src') || '';
        if (s.indexOf('wonder-voiceover.js') !== -1) {
          src = s;
          break;
        }
      }
    }
    if (!src) return '../../';
    return src.replace('shared/js/wonder-voiceover.js', '');
  }

  class WonderVoiceoverPlayer {
    constructor() {
      this.synth = window.speechSynthesis;
      this.utterance = null;
      this.audioObj = null;
      this.isPlaying = false;
      this.mode = 'audio'; // 'audio' or 'tts'
      this.init();
    }

    init() {
      const placeholders = document.querySelectorAll('.wonder-audio-player-placeholder');
      if (!placeholders.length) return;

      const pageFile = window.location.pathname.split('/').pop();
      const mappedAudioFile = SESSION_AUDIO_MAP[pageFile];
      const rootPrefix = getRootPrefix();
      const audioPath = mappedAudioFile ? `${rootPrefix}shared/audio/wonder/${mappedAudioFile}` : null;

      placeholders.forEach(placeholder => {
        // Find transcript text in adjacent details element or column section
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

        const badgeLabel = audioPath ? '🎙️ Studio Voiceover Recording' : '🤖 AI Voice Synthesis (TTS)';
        const initialStatus = audioPath
          ? 'Click play to listen to the recorded studio voiceover.'
          : 'Click play to synthesize narration from transcript.';

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
          " title="Listen to Column Narration">🎙️</button>

          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #3F2B96; font-size: 0.95rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span>🎙️ Listen to Column Narration</span>
              <span class="speech-mode-badge" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; background: #EEEDFE; color: #3F2B96; font-weight: 600;">${badgeLabel}</span>
            </div>
            <div class="speech-status-text" style="font-size: 0.85rem; color: #666;">
              ${initialStatus}
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
              display: ${audioPath ? 'none' : 'block'};
            " title="Select Voice Fallback"></select>
          </div>
        `;

        placeholder.parentNode.replaceChild(playerCard, placeholder);

        const playBtn = playerCard.querySelector('.wonder-speech-play-btn');
        const statusText = playerCard.querySelector('.speech-status-text');
        const voiceSelect = playerCard.querySelector('.speech-voice-select');
        const modeBadge = playerCard.querySelector('.speech-mode-badge');

        const populateVoices = () => {
          if (!this.synth) return;
          const voices = this.synth.getVoices().filter(v => v.lang.startsWith('en'));
          voiceSelect.innerHTML = voices.map(v => `<option value="${v.name}">${v.name.replace(/Google|Microsoft|Apple/g, '').trim()} (${v.lang})</option>`).join('');
        };

        populateVoices();
        if (this.synth && this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = populateVoices;
        }

        if (!audioPath) {
          this.mode = 'tts';
        }

        playBtn.addEventListener('click', () => {
          if (this.isPlaying) {
            this.stopAll(playBtn, statusText);
          } else {
            if (this.mode === 'audio' && audioPath) {
              if (!this.audioObj) {
                this.audioObj = new Audio(audioPath);
                this.audioObj.addEventListener('ended', () => {
                  this.isPlaying = false;
                  playBtn.innerHTML = '🎙️';
                  playBtn.style.background = '#3F2B96';
                  statusText.textContent = 'Voiceover complete.';
                });
                this.audioObj.addEventListener('error', () => {
                  console.warn(`Recorded audio at ${audioPath} unavailable. Falling back to Speech Synthesis TTS.`);
                  this.mode = 'tts';
                  if (voiceSelect) voiceSelect.style.display = 'block';
                  if (modeBadge) {
                    modeBadge.textContent = '🤖 AI Voice Synthesis (TTS Fallback)';
                    modeBadge.style.background = '#FAEEE8';
                    modeBadge.style.color = '#B84318';
                  }
                  this.playTTS(transcriptText, playBtn, statusText, voiceSelect);
                });
              }

              const playPromise = this.audioObj.play();
              if (playPromise !== undefined) {
                playPromise.then(() => {
                  this.isPlaying = true;
                  playBtn.innerHTML = '⏸️';
                  playBtn.style.background = '#2e1f70';
                  statusText.textContent = 'Playing recorded studio voiceover...';
                }).catch(() => {
                  // Fallback to TTS on play error/failure
                  this.mode = 'tts';
                  if (voiceSelect) voiceSelect.style.display = 'block';
                  if (modeBadge) {
                    modeBadge.textContent = '🤖 AI Voice Synthesis (TTS Fallback)';
                    modeBadge.style.background = '#FAEEE8';
                    modeBadge.style.color = '#B84318';
                  }
                  this.playTTS(transcriptText, playBtn, statusText, voiceSelect);
                });
              }
            } else {
              this.playTTS(transcriptText, playBtn, statusText, voiceSelect);
            }
          }
        });
      });
    }

    playTTS(transcriptText, playBtn, statusText, voiceSelect) {
      if (!this.synth) {
        alert('Text-to-speech voiceover is not supported in this browser.');
        return;
      }

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
      statusText.textContent = 'Playing synthesized voiceover...';
    }

    stopAll(playBtn, statusText) {
      if (this.audioObj) {
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
      }
      if (this.synth) {
        this.synth.cancel();
      }
      this.isPlaying = false;
      playBtn.innerHTML = '🎙️';
      playBtn.style.background = '#3F2B96';
      statusText.textContent = 'Voiceover paused.';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WonderVoiceoverPlayer());
  } else {
    new WonderVoiceoverPlayer();
  }
})();
