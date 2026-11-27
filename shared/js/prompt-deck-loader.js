/**
 * PromptDeckLoader - Reusable prompt viewer component for COSYevents
 * Renders card-by-card deck view with next/prev navigation and keyboard controls.
 */
class PromptDeckLoader {
  /**
   * @param {Object} options Configuration options
   * @param {string} options.containerId DOM element ID where viewer will be rendered
   * @param {string} [options.deckUrl] Path to JSON deck file
   * @param {Array} [options.cards] Preloaded card items array
   */
  constructor(options = {}) {
    this.container = document.getElementById(options.containerId);
    if (!this.container) {
      console.error(`[PromptDeckLoader] Container with ID "${options.containerId}" not found.`);
      return;
    }

    this.deckUrl = options.deckUrl || null;
    this.cards = options.cards || [];
    this.currentIndex = 0;
    this.title = options.title || 'Prompt Deck';

    this.init();
  }

  async init() {
    this.renderSkeleton();

    if (this.deckUrl && (!this.cards || this.cards.length === 0)) {
      await this.loadDeck(this.deckUrl);
    } else {
      this.renderCard();
    }

    this.bindEvents();
  }

  renderSkeleton() {
    this.container.innerHTML = `
      <div class="prompt-viewer" tabindex="0" aria-label="Prompt Deck Viewer">
        <div class="prompt-viewer-header">
          <h3 class="prompt-viewer-title">${this.escapeHtml(this.title)}</h3>
          <span class="prompt-viewer-counter" id="deck-counter">0 / 0</span>
        </div>
        <div class="prompt-card-wrapper" id="deck-card-slot">
          <div class="prompt-card-placeholder">Loading prompt deck...</div>
        </div>
        <div class="prompt-viewer-controls">
          <button type="button" class="prompt-btn btn-prev" id="btn-prev" disabled aria-label="Previous Card">
            ← Previous
          </button>
          <button type="button" class="prompt-btn btn-next" id="btn-next" disabled aria-label="Next Card">
            Next →
          </button>
        </div>
      </div>
    `;
  }

  async loadDeck(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load deck from ${url}: ${response.statusText}`);
      }
      const data = await response.json();
      this.title = data.title || this.title;
      this.cards = data.cards || data.prompts || (Array.isArray(data) ? data : []);
      this.currentIndex = 0;
      this.renderCard();
    } catch (err) {
      console.error('[PromptDeckLoader] Load Error:', err);
      const cardSlot = this.container.querySelector('#deck-card-slot');
      if (cardSlot) {
        cardSlot.innerHTML = `
          <div class="prompt-card prompt-card-error">
            <p>Unable to load prompt deck.</p>
            <small>${this.escapeHtml(err.message)}</small>
          </div>
        `;
      }
    }
  }

  renderCard() {
    const counterEl = this.container.querySelector('#deck-counter');
    const cardSlot = this.container.querySelector('#deck-card-slot');
    const prevBtn = this.container.querySelector('#btn-prev');
    const nextBtn = this.container.querySelector('#btn-next');
    const titleEl = this.container.querySelector('.prompt-viewer-title');

    if (titleEl) titleEl.textContent = this.title;

    if (!this.cards || this.cards.length === 0) {
      if (counterEl) counterEl.textContent = '0 / 0';
      if (cardSlot) {
        cardSlot.innerHTML = `
          <div class="prompt-card">
            <p class="prompt-text">No prompt cards available in this deck.</p>
          </div>
        `;
      }
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    const currentCard = this.cards[this.currentIndex];
    const total = this.cards.length;

    if (counterEl) {
      counterEl.textContent = `Card ${this.currentIndex + 1} of ${total}`;
    }

    if (cardSlot) {
      const cardText = typeof currentCard === 'string' ? currentCard : (currentCard.text || currentCard.prompt || currentCard.question || JSON.stringify(currentCard));
      const category = typeof currentCard === 'object' && currentCard.category ? `<span class="prompt-badge">${this.escapeHtml(currentCard.category)}</span>` : '';
      const level = typeof currentCard === 'object' && currentCard.level ? `<span class="prompt-badge level-badge">${this.escapeHtml(currentCard.level)}</span>` : '';
      const notes = typeof currentCard === 'object' && currentCard.note ? `<p class="prompt-note">${this.escapeHtml(currentCard.note)}</p>` : '';

      cardSlot.innerHTML = `
        <div class="prompt-card">
          ${category || level ? `<div class="prompt-card-meta">${category} ${level}</div>` : ''}
          <div class="prompt-body">
            <p class="prompt-text">${this.escapeHtml(cardText)}</p>
            ${notes}
          </div>
        </div>
      `;
    }

    if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
    if (nextBtn) nextBtn.disabled = this.currentIndex === total - 1;
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.renderCard();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCard();
    }
  }

  bindEvents() {
    const prevBtn = this.container.querySelector('#btn-prev');
    const nextBtn = this.container.querySelector('#btn-next');
    const viewer = this.container.querySelector('.prompt-viewer');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    if (viewer) {
      viewer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        }
      });
    }
  }

  escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PromptDeckLoader };
}
