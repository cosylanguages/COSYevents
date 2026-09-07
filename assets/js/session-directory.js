/**
 * COSYlanguages — Session Directory Vanilla JS Component
 * Standalone, dependency-free static directory component.
 */

(function () {
  'use strict';

  class SessionDirectory {
    constructor(containerId = 'session-directory-root', dataPath = 'data/sessions.json') {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error(`SessionDirectory: Element #${containerId} not found.`);
        return;
      }

      this.dataPath = dataPath;
      this.sessions = [];
      this.filteredSessions = [];

      // Filter State
      this.state = {
        searchQuery: '',
        selectedLang: 'ALL',
        selectedFormat: 'ALL',
        selectedLevel: null // null means 'All Levels', string or Array for level filter
      };

      this.init();
    }

    async init() {
      this.renderSkeleton();
      await this.loadData();
      this.renderUI();
      this.bindEvents();
      this.bindBackToTopEvents();
      this.bindScrollspyEvents();
      this.bindQuickStartLinks();
      this.applyFilters();
    }

    renderSkeleton() {
      this.container.innerHTML = `
        <div class="sd-container">
          <div class="sd-filter-bar" style="opacity: 0.6;">
            <div style="padding: 1rem; text-align: center; font-weight: 600; color: var(--ink-muted);">
              Loading session directory... ⏳
            </div>
          </div>
        </div>
      `;
    }

    async loadData() {
      try {
        let response = await fetch(this.dataPath);
        if (!response.ok) {
          // Fallback path attempt if relative path differs
          response = await fetch('events/' + this.dataPath);
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.sessions = await response.json();
      } catch (err) {
        console.error('SessionDirectory: Error loading sessions data:', err);
        this.container.innerHTML = `
          <div class="sd-container">
            <div class="sd-empty-state">
              <span class="sd-empty-icon">⚠️</span>
              <h3 class="sd-empty-title">Unable to load sessions</h3>
              <p class="sd-empty-msg">Please check your network connection or reload the page.</p>
            </div>
          </div>
        `;
      }
    }

    renderUI() {
      // Extract unique languages and formats from sessions
      const languages = Array.from(new Set(this.sessions.map(s => s.lang).filter(Boolean))).sort();
      const formats = Array.from(new Set(this.sessions.map(s => s.format).filter(Boolean))).sort();
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

      this.container.innerHTML = `
        <div class="sd-container">
          <section class="sd-filter-bar" aria-label="Session Filter Controls">
            <div class="sd-filter-top-row">
              <div class="sd-controls-group">
                <!-- Search Input -->
                <div class="sd-search-wrapper">
                  <span class="sd-search-icon" aria-hidden="true">🔍</span>
                  <input
                    type="text"
                    id="sd-search"
                    class="sd-search-input"
                    placeholder="Search by title or club name..."
                    aria-label="Search sessions by title or club name"
                    autocomplete="off"
                  />
                </div>

                <!-- Language Select -->
                <div class="sd-select-wrapper">
                  <select id="sd-lang-select" class="sd-select" aria-label="Filter sessions by language">
                    <option value="ALL">All Languages</option>
                    ${languages.map(lang => `<option value="${this.escapeAttr(lang)}">${this.escapeText(lang)}</option>`).join('')}
                  </select>
                </div>

                <!-- Format Select -->
                <div class="sd-select-wrapper">
                  <select id="sd-format-select" class="sd-select" aria-label="Filter sessions by format">
                    <option value="ALL">All Formats</option>
                    ${formats.map(fmt => `<option value="${this.escapeAttr(fmt)}">${this.escapeText(fmt)}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Result Count -->
              <div id="sd-results-count" class="sd-results-count" aria-live="polite">
                Showing ${this.sessions.length} sessions
              </div>
            </div>

            <!-- Level Pills Row -->
            <div class="sd-pills-row" role="group" aria-label="Filter sessions by level">
              <span class="sd-pills-label">Level:</span>
              <button
                type="button"
                class="sd-pill active"
                data-level="ALL"
                aria-pressed="true"
              >
                All Levels
              </button>
              ${levels.map(lvl => `
                <button
                  type="button"
                  class="sd-pill"
                  data-level="${lvl}"
                  aria-pressed="false"
                >
                  ${lvl}
                </button>
              `).join('')}
            </div>
          </section>

          <!-- Cards Grid Container -->
          <div id="sd-cards-grid" class="sd-cards-grid" role="region" aria-label="Session Search Results"></div>
        </div>
      `;

      // Cache DOM references
      this.searchInput = this.container.querySelector('#sd-search');
      this.langSelect = this.container.querySelector('#sd-lang-select');
      this.formatSelect = this.container.querySelector('#sd-format-select');
      this.resultsCount = this.container.querySelector('#sd-results-count');
      this.cardsGrid = this.container.querySelector('#sd-cards-grid');
      this.pillButtons = this.container.querySelectorAll('.sd-pill');
    }

    bindEvents() {
      // Live search input
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.state.searchQuery = e.target.value.trim().toLowerCase();
          this.applyFilters();
        });
      }

      // Language selection
      if (this.langSelect) {
        this.langSelect.addEventListener('change', (e) => {
          this.state.selectedLang = e.target.value;
          this.applyFilters();
        });
      }

      // Format selection
      if (this.formatSelect) {
        this.formatSelect.addEventListener('change', (e) => {
          this.state.selectedFormat = e.target.value;
          this.applyFilters();
        });
      }

      // Level Pills toggle logic
      if (this.pillButtons) {
        this.pillButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const targetLevel = btn.getAttribute('data-level');

            if (targetLevel === 'ALL') {
              this.state.selectedLevel = null;
            } else if (this.state.selectedLevel === targetLevel) {
              // Toggle off if already selected
              this.state.selectedLevel = null;
            } else {
              this.state.selectedLevel = targetLevel;
            }

            this.updatePillsUI();
            this.applyFilters();
          });
        });
      }
    }

    bindQuickStartLinks() {
      const qsLinks = document.querySelectorAll('.qs-level-link');
      qsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const group = link.getAttribute('data-level-group');
          if (group === 'A1-A2') {
            this.state.selectedLevel = ['A1', 'A2'];
          } else if (group === 'B1-B2') {
            this.state.selectedLevel = ['B1', 'B2'];
          } else if (group === 'B2-C2') {
            this.state.selectedLevel = ['B2', 'C1', 'C2'];
          }
          this.updatePillsUI();
          this.applyFilters();
          const browseSection = document.getElementById('browse') || document.getElementById('browse-section');
          if (browseSection) {
            browseSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }

    bindBackToTopEvents() {
      const backToTopBtn = document.getElementById('sd-back-to-top');
      if (!backToTopBtn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      });

      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    bindScrollspyEvents() {
      const jumpLinks = document.querySelectorAll('.sd-jump-link');
      const sections = [
        document.getElementById('onboarding-guide'),
        document.getElementById('upcoming'),
        document.getElementById('types'),
        document.getElementById('browse'),
        document.getElementById('browse-section'),
        document.getElementById('join')
      ].filter(Boolean);

      // Smooth scroll on jump link click
      jumpLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetEl = document.querySelector(href);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      });

      // Scrollspy highlight on scroll
      window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 180;

        sections.forEach(sec => {
          const top = sec.offsetTop;
          const height = sec.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSectionId = sec.id;
          }
        });

        jumpLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === '#' + currentSectionId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      });
    }

    updatePillsUI() {
      this.pillButtons.forEach(btn => {
        const lvl = btn.getAttribute('data-level');
        let isActive = false;

        if (this.state.selectedLevel === null) {
          isActive = (lvl === 'ALL');
        } else if (Array.isArray(this.state.selectedLevel)) {
          isActive = this.state.selectedLevel.includes(lvl);
        } else {
          isActive = (lvl === this.state.selectedLevel);
        }

        if (isActive) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    }

    applyFilters() {
      const { searchQuery, selectedLang, selectedFormat, selectedLevel } = this.state;

      this.filteredSessions = this.sessions.filter(session => {
        // Search query filter (title or club)
        if (searchQuery) {
          const matchTitle = session.title && session.title.toLowerCase().includes(searchQuery);
          const matchClub = session.club && session.club.toLowerCase().includes(searchQuery);
          if (!matchTitle && !matchClub) return false;
        }

        // Language filter
        if (selectedLang !== 'ALL') {
          if (session.lang !== selectedLang) return false;
        }

        // Format filter
        if (selectedFormat !== 'ALL') {
          if (session.format !== selectedFormat) return false;
        }

        // Level filter
        if (selectedLevel !== null) {
          const sessionLevel = session.level ? String(session.level).trim() : null;
          if (Array.isArray(selectedLevel)) {
            if (!sessionLevel || !selectedLevel.includes(sessionLevel)) return false;
          } else {
            if (sessionLevel !== selectedLevel) return false;
          }
        }

        return true;
      });

      this.renderResults();
    }

    renderResults() {
      const count = this.filteredSessions.length;
      if (this.resultsCount) {
        this.resultsCount.textContent = count === 1 ? 'Showing 1 session' : `Showing ${count} sessions`;
      }

      if (!this.cardsGrid) return;

      if (count === 0) {
        this.cardsGrid.style.display = 'block';
        this.cardsGrid.innerHTML = `
          <div class="sd-empty-state">
            <span class="sd-empty-icon">🔎</span>
            <h3 class="sd-empty-title">No matching sessions found</h3>
            <p class="sd-empty-msg">
              No sessions match those filters — try clearing the level or switching languages.
            </p>
            <button type="button" id="sd-clear-filters" class="sd-empty-clear-btn">
              Clear All Filters
            </button>
          </div>
        `;

        const clearBtn = this.cardsGrid.querySelector('#sd-clear-filters');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => this.resetFilters());
        }
        return;
      }

      this.cardsGrid.style.display = 'grid';
      this.cardsGrid.innerHTML = this.filteredSessions.map(session => this.renderCardHTML(session)).join('');
    }

    renderCardHTML(session) {
      const levelLabel = session.level ? session.level : 'All Levels';
      const langLabel = session.lang ? session.lang : 'Language N/A';
      const formatLabel = session.format ? session.format : 'Speaking Club';

      return `
        <article class="sd-card">
          <div class="sd-card-badges">
            <span class="sd-badge sd-badge-level">${this.escapeText(levelLabel)}</span>
            <span class="sd-badge sd-badge-format">${this.escapeText(formatLabel)}</span>
            <span class="sd-badge sd-badge-lang">${this.escapeText(langLabel)}</span>
          </div>

          <p class="sd-card-club">${this.escapeText(session.club)}</p>

          <h3 class="sd-card-title">
            <a href="${this.escapeAttr(session.href)}">${this.escapeText(session.title)}</a>
          </h3>

          <div class="sd-card-footer">
            <a href="${this.escapeAttr(session.href)}" class="sd-card-link-btn" aria-label="Explore session: ${this.escapeAttr(session.title)}">
              Explore Session ➔
            </a>
          </div>
        </article>
      `;
    }

    resetFilters() {
      this.state = {
        searchQuery: '',
        selectedLang: 'ALL',
        selectedFormat: 'ALL',
        selectedLevel: null
      };

      if (this.searchInput) this.searchInput.value = '';
      if (this.langSelect) this.langSelect.value = 'ALL';
      if (this.formatSelect) this.formatSelect.value = 'ALL';

      this.updatePillsUI();
      this.applyFilters();
    }

    escapeText(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    escapeAttr(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.sessionDirectory = new SessionDirectory();
    });
  } else {
    window.sessionDirectory = new SessionDirectory();
  }
})();
