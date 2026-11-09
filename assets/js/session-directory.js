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

      // Wishlist State (stored by href)
      this.savedHrefs = new Set();
      this.loadSavedHrefs();

      // Filter State
      this.state = {
        searchQuery: '',
        selectedLang: 'ALL',
        selectedType: 'ALL',
        selectedSpeakingClub: 'ALL',
        selectedLevel: null, // null means 'All Levels', string or Array for level filter
        wishlistOnly: false
      };

      this.readUrlParams();

      this.init();
    }

    loadSavedHrefs() {
      try {
        const raw = localStorage.getItem('ce_wishlist');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            this.savedHrefs = new Set(list);
          }
        }
      } catch (e) {}
    }

    saveSavedHrefs() {
      try {
        localStorage.setItem('ce_wishlist', JSON.stringify([...this.savedHrefs]));
      } catch (e) {}
    }

    readUrlParams() {
      if (typeof window === 'undefined' || !window.location) return;
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.has('q')) this.state.searchQuery = params.get('q').trim().toLowerCase();
        if (params.has('format')) this.state.selectedType = params.get('format');
        if (params.has('club')) this.state.selectedSpeakingClub = params.get('club');
        if (params.has('lang')) this.state.selectedLang = params.get('lang');
        if (params.has('level')) {
          const lvl = params.get('level');
          this.state.selectedLevel = lvl === 'ALL' ? null : lvl;
        }
        if (params.has('saved') && params.get('saved') === 'true') {
          this.state.wishlistOnly = true;
        }
      } catch (e) {}
    }

    updateUrlParams() {
      if (typeof window === 'undefined' || !window.history || !window.location) return;
      try {
        const params = new URLSearchParams();
        if (this.state.searchQuery) params.set('q', this.state.searchQuery);
        if (this.state.selectedType !== 'ALL') params.set('format', this.state.selectedType);
        if (this.state.selectedSpeakingClub !== 'ALL') params.set('club', this.state.selectedSpeakingClub);
        if (this.state.selectedLang !== 'ALL') params.set('lang', this.state.selectedLang);
        if (this.state.selectedLevel) {
          params.set('level', Array.isArray(this.state.selectedLevel) ? this.state.selectedLevel.join('-') : this.state.selectedLevel);
        }
        if (this.state.wishlistOnly) params.set('saved', 'true');

        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
        window.history.replaceState(null, '', newUrl);
      } catch (e) {}
    }

    async init() {
      this.renderSkeleton();
      await this.loadData();
      this.renderUI();
      this.bindEvents();
      this.bindBackToTopEvents();
      this.bindScrollspyEvents();
      this.bindQuickStartLinks();
      this.syncControlsWithState();
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
      // Extract unique languages and speaking clubs from sessions
      const languages = Array.from(new Set(this.sessions.map(s => s.lang).filter(Boolean))).sort();
      const speakingClubs = Array.from(
        new Set(
          this.sessions
            .filter(s => s.format === 'Speaking Club')
            .map(s => s.club)
            .filter(Boolean)
        )
      ).sort();
      const levelGroups = [
        { label: 'A0–A1', value: 'A0-A1' },
        { label: 'A2', value: 'A2' },
        { label: 'B1', value: 'B1' },
        { label: 'B2', value: 'B2' },
        { label: 'C1–C2', value: 'C1-C2' }
      ];

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
                    placeholder="Search by title or topic..."
                    aria-label="Search sessions by title or topic"
                    autocomplete="off"
                  />
                </div>

                <!-- Event Type Unfolding Menu -->
                <div class="sd-select-wrapper sd-type-wrapper">
                  <select id="sd-type-select" class="sd-select" aria-label="Filter sessions by event type">
                    <option value="ALL">All Event Types</option>
                    <option value="Speaking Club">Speaking Clubs</option>
                    <option value="Cinema Club">Cinema</option>
                    <option value="Karaoke Club">Karaoke</option>
                    <option value="Long Read">Long Reads</option>
                    <option value="Games">Games</option>
                  </select>
                </div>

                <!-- Conditional Speaking Clubs Sub-Selector -->
                <div id="sd-speaking-clubs-wrapper" class="sd-select-wrapper sd-speaking-clubs-wrapper hidden" aria-hidden="true">
                  <select id="sd-speaking-club-select" class="sd-select" aria-label="Select speaking club">
                    <option value="ALL">All Speaking Clubs</option>
                    ${speakingClubs.map(club => `<option value="${this.escapeAttr(club)}">${this.escapeText(club)}</option>`).join('')}
                  </select>
                </div>

                <!-- Language Select -->
                <div class="sd-select-wrapper">
                  <select id="sd-lang-select" class="sd-select" aria-label="Filter sessions by language">
                    <option value="ALL">All Languages</option>
                    ${languages.map(lang => `<option value="${this.escapeAttr(lang)}">${this.escapeText(lang)}</option>`).join('')}
                  </select>
                </div>
              </div>

              <!-- Result Count and Reset Button -->
              <div class="sd-results-wrapper" style="display: flex; align-items: center; gap: 0.75rem;">
                <div id="sd-results-count" class="sd-results-count" aria-live="polite">
                  Showing ${this.sessions.length} sessions
                </div>
                <button
                  type="button"
                  id="sd-active-reset-btn"
                  class="sd-active-reset-btn hidden"
                  aria-label="Reset all active filters"
                  title="Clear all active filters"
                >
                  ✕ Reset Filters
                </button>
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
              ${levelGroups.map(lg => `
                <button
                  type="button"
                  class="sd-pill"
                  data-level="${lg.value}"
                  aria-pressed="false"
                >
                  ${lg.label}
                </button>
              `).join('')}
              <button
                type="button"
                class="sd-pill"
                data-level="UNSPECIFIED"
                aria-pressed="false"
              >
                Not specified
              </button>
              <button
                type="button"
                class="sd-pill sd-pill-wishlist"
                data-level="WISHLIST"
                aria-pressed="false"
                style="margin-left: auto; background: var(--honey-pale, #fff8e7); border-color: rgba(148, 94, 5, 0.25); color: var(--honey-dark, #7d4d03);"
              >
                ⭐ Saved (<span id="sd-wishlist-count">${this.savedHrefs.size}</span>)
              </button>
            </div>
          </section>

          <!-- Cards Grid Container -->
          <div id="sd-cards-grid" class="sd-cards-grid" role="region" aria-label="Session Search Results"></div>
        </div>
      `;

      // Cache DOM references
      this.searchInput = this.container.querySelector('#sd-search');
      this.typeSelect = this.container.querySelector('#sd-type-select');
      this.speakingClubsWrapper = this.container.querySelector('#sd-speaking-clubs-wrapper');
      this.speakingClubSelect = this.container.querySelector('#sd-speaking-club-select');
      this.langSelect = this.container.querySelector('#sd-lang-select');
      this.resultsCount = this.container.querySelector('#sd-results-count');
      this.activeResetBtn = this.container.querySelector('#sd-active-reset-btn');
      this.cardsGrid = this.container.querySelector('#sd-cards-grid');
      this.pillButtons = this.container.querySelectorAll('.sd-pill');
    }

    syncControlsWithState() {
      if (this.searchInput && this.state.searchQuery) {
        this.searchInput.value = this.state.searchQuery;
      }
      if (this.typeSelect && this.state.selectedType !== 'ALL') {
        this.typeSelect.value = this.state.selectedType;
      }
      if (this.state.selectedType === 'Speaking Club') {
        if (this.speakingClubsWrapper) {
          this.speakingClubsWrapper.classList.remove('hidden');
          this.speakingClubsWrapper.classList.add('visible');
          this.speakingClubsWrapper.setAttribute('aria-hidden', 'false');
        }
        if (this.speakingClubSelect && this.state.selectedSpeakingClub !== 'ALL') {
          this.speakingClubSelect.value = this.state.selectedSpeakingClub;
        }
      }
      if (this.langSelect && this.state.selectedLang !== 'ALL') {
        this.langSelect.value = this.state.selectedLang;
      }
      this.updatePillsUI();
    }

    bindEvents() {
      // Active reset button
      if (this.activeResetBtn) {
        this.activeResetBtn.addEventListener('click', () => {
          this.resetFilters();
        });
      }

      // Live search input
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          this.state.searchQuery = e.target.value.trim().toLowerCase();
          this.applyFilters();
        });
      }

      // Event Type unfolding menu selection
      if (this.typeSelect) {
        this.typeSelect.addEventListener('change', (e) => {
          const newType = e.target.value;
          this.state.selectedType = newType;

          if (newType === 'Speaking Club') {
            if (this.speakingClubsWrapper) {
              this.speakingClubsWrapper.classList.remove('hidden');
              this.speakingClubsWrapper.classList.add('visible');
              this.speakingClubsWrapper.setAttribute('aria-hidden', 'false');
            }
          } else {
            // Fold/hide speaking clubs submenu and reset specific club
            if (this.speakingClubsWrapper) {
              this.speakingClubsWrapper.classList.remove('visible');
              this.speakingClubsWrapper.classList.add('hidden');
              this.speakingClubsWrapper.setAttribute('aria-hidden', 'true');
            }
            this.state.selectedSpeakingClub = 'ALL';
            if (this.speakingClubSelect) {
              this.speakingClubSelect.value = 'ALL';
            }
          }

          this.applyFilters();
        });
      }

      // Speaking Club selection
      if (this.speakingClubSelect) {
        this.speakingClubSelect.addEventListener('change', (e) => {
          this.state.selectedSpeakingClub = e.target.value;
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

      // Level Pills toggle logic
      if (this.pillButtons) {
        this.pillButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const targetLevel = btn.getAttribute('data-level');

            if (targetLevel === 'WISHLIST') {
              this.state.wishlistOnly = !this.state.wishlistOnly;
              this.state.selectedLevel = null;
            } else if (targetLevel === 'ALL') {
              this.state.selectedLevel = null;
              this.state.wishlistOnly = false;
            } else if (this.state.selectedLevel === targetLevel) {
              // Toggle off if already selected
              this.state.selectedLevel = null;
            } else {
              this.state.selectedLevel = targetLevel;
              this.state.wishlistOnly = false;
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

        if (lvl === 'WISHLIST') {
          isActive = this.state.wishlistOnly;
        } else if (this.state.wishlistOnly) {
          isActive = false;
        } else if (this.state.selectedLevel === null) {
          isActive = (lvl === 'ALL');
        } else if (Array.isArray(this.state.selectedLevel)) {
          const serialized = this.state.selectedLevel.join('-');
          isActive = (lvl === serialized || (lvl === 'A0-A1' && serialized === 'A0-A1') || (lvl === 'C1-C2' && serialized === 'C1-C2'));
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

      const countEl = document.getElementById('sd-wishlist-count');
      if (countEl) {
        countEl.textContent = this.savedHrefs.size;
      }
    }

    isAnyFilterActive() {
      return (
        !!this.state.searchQuery ||
        this.state.selectedLang !== 'ALL' ||
        this.state.selectedType !== 'ALL' ||
        this.state.selectedSpeakingClub !== 'ALL' ||
        this.state.selectedLevel !== null ||
        this.state.wishlistOnly
      );
    }

    applyFilters() {
      this.updateUrlParams();

      if (this.activeResetBtn) {
        if (this.isAnyFilterActive()) {
          this.activeResetBtn.classList.remove('hidden');
          this.activeResetBtn.classList.add('visible');
        } else {
          this.activeResetBtn.classList.remove('visible');
          this.activeResetBtn.classList.add('hidden');
        }
      }

      const { searchQuery, selectedLang, selectedType, selectedSpeakingClub, selectedLevel, wishlistOnly } = this.state;

      this.filteredSessions = this.sessions.filter(session => {
        if (wishlistOnly && !this.savedHrefs.has(session.href)) {
          return false;
        }

        // Search query filter (title, club, theme_area, or sub_topic)
        if (searchQuery) {
          const matchTitle = session.title && session.title.toLowerCase().includes(searchQuery);
          const matchClub = session.club && session.club.toLowerCase().includes(searchQuery);
          const matchTheme = session.theme_area && session.theme_area.toLowerCase().includes(searchQuery);
          const matchSub = session.sub_topic && session.sub_topic.toLowerCase().includes(searchQuery);
          if (!matchTitle && !matchClub && !matchTheme && !matchSub) return false;
        }

        // Event Type filter
        if (selectedType !== 'ALL') {
          if (session.format !== selectedType) return false;

          // If Speaking Club is chosen, apply specific speaking club filter if selected
          if (selectedType === 'Speaking Club' && selectedSpeakingClub !== 'ALL') {
            if (session.club !== selectedSpeakingClub) return false;
          }
        }

        // Language filter
        if (selectedLang !== 'ALL') {
          if (session.lang !== selectedLang) return false;
        }

        // Level filter
        if (selectedLevel !== null) {
          const sessionLevels = session.level
            ? String(session.level).match(/\b(A0|A1|A2|B1|B2|C1|C2)\b/g) || []
            : [];
          if (selectedLevel === 'UNSPECIFIED') {
            if (sessionLevels.length > 0) return false;
          } else if (selectedLevel === 'A0-A1') {
            if (!sessionLevels.some(l => l === 'A0' || l === 'A1')) return false;
          } else if (selectedLevel === 'C1-C2') {
            if (!sessionLevels.some(l => l === 'C1' || l === 'C2')) return false;
          } else if (Array.isArray(selectedLevel)) {
            if (!sessionLevels.some(level => selectedLevel.includes(level))) return false;
          } else {
            if (!sessionLevels.includes(selectedLevel)) return false;
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

      // Bind bookmark star toggle events
      const bookmarkBtns = this.cardsGrid.querySelectorAll('.sd-bookmark-btn');
      bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const href = btn.getAttribute('data-href');
          if (!href) return;

          if (this.savedHrefs.has(href)) {
            this.savedHrefs.delete(href);
          } else {
            this.savedHrefs.add(href);
          }

          this.saveSavedHrefs();
          this.updatePillsUI();
          this.applyFilters();
        });
      });
    }

    getStructureSignature(session) {
      const club = session.club || '';
      const format = session.format || '';

      if (format === 'Cinema Club' || club === 'Cinema Club') {
        return { icon: '🎬', label: 'Scene Screening & Cultural Analysis' };
      }
      if (format === 'Karaoke Club' || club === 'Karaoke Club') {
        return { icon: '🎵', label: 'Lyric Deconstruction & Rhythm Practice' };
      }
      if (format === 'Long Read' || club === 'Long Reads') {
        return { icon: '📖', label: 'Literary Parlor Ledger & Extended Text' };
      }
      if (format === 'Games' || club === 'Game Evenings') {
        return { icon: '🎲', label: 'Parlor Play & Boardgame Immersion' };
      }
      if (club === 'Keeping Up with Science') {
        return { icon: '🔬', label: 'Peer-Reviewed Research & Future Speculation' };
      }
      if (club === "I Couldn't Help But Wonder") {
        return { icon: '💭', label: 'Philosophical Dilemmas & Introspection' };
      }
      if (club === 'Debatable & Relatable') {
        return { icon: '⚖️', label: 'Structured Debates & Flash Voting' };
      }
      if (club === 'Mind Matters') {
        return { icon: '🧠', label: 'Subconscious Profiles & Behavioral Prompts' };
      }
      if (club === 'The Greatest Quotes') {
        return { icon: '☕', label: "Café Debates & Philosophers' Ledger" };
      }
      if (club === "Let's Celebrate") {
        return { icon: '🎉', label: 'Festivity Traditions & Cultural Customs' };
      }
      if (club === 'My Life With & Without') {
        return { icon: '🪞', label: 'Life Ledger & Counterfactual Reflections' };
      }
      if (club === 'If You Were') {
        return { icon: '✨', label: 'Perspective Mirror & Role Immersions' };
      }
      return { icon: '💬', label: 'Warm-up · Theoretical Rounds · Fluency Outro' };
    }

    renderCardHTML(session) {
      const levelLabel = session.level ? session.level : 'All Levels';
      const langLabel = session.lang ? session.lang : 'Language N/A';
      const formatLabel = session.format ? session.format : 'Speaking Club';
      const isBookmarked = this.savedHrefs.has(session.href);
      const signature = this.getStructureSignature(session);

      return `
        <article class="sd-card" data-club="${this.escapeAttr(session.club || '')}" data-format="${this.escapeAttr(formatLabel)}">
          <button
            type="button"
            class="sd-bookmark-btn ${isBookmarked ? 'saved' : ''}"
            data-href="${this.escapeAttr(session.href)}"
            aria-label="${isBookmarked ? 'Remove from saved wishlist' : 'Save to wishlist'}"
            title="${isBookmarked ? 'Remove from saved' : 'Save session'}"
            style="position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.25rem; cursor: pointer; transition: transform 0.2s ease; z-index: 2;"
          >
            ${isBookmarked ? '★' : '☆'}
          </button>

          <div class="sd-card-badges" style="padding-right: 2rem; display: flex; flex-wrap: wrap; gap: 4px;">
            <span class="sd-badge sd-badge-level">${this.escapeText(levelLabel)}</span>
            <span class="sd-badge sd-badge-format">${this.escapeText(formatLabel)}</span>
            <span class="sd-badge sd-badge-lang">${this.escapeText(langLabel)}</span>
            ${session.theme_area ? `<span class="sd-badge sd-badge-theme" style="background: rgba(15, 110, 86, 0.1); color: #0F6E56; font-weight: 600;">${this.escapeText(session.theme_area)}</span>` : ""}
            ${session.sub_topic ? `<span class="sd-badge sd-badge-subtopic" style="background: rgba(0, 0, 0, 0.05); color: var(--ink-soft); font-size: 0.75rem;">${this.escapeText(session.sub_topic)}</span>` : ""}
          </div>

          <p class="sd-card-club">${signature.icon} ${this.escapeText(session.club)}</p>

          <h3 class="sd-card-title">
            <a href="${this.escapeAttr(session.href)}">${this.escapeText(session.title)}</a>
          </h3>

          <div class="sd-structure-tag">
            <span>${signature.icon}</span>
            <span>${this.escapeText(signature.label)}</span>
          </div>

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
        selectedType: 'ALL',
        selectedSpeakingClub: 'ALL',
        selectedLevel: null,
        wishlistOnly: false
      };

      if (this.searchInput) this.searchInput.value = '';
      if (this.typeSelect) this.typeSelect.value = 'ALL';
      if (this.speakingClubSelect) this.speakingClubSelect.value = 'ALL';
      if (this.speakingClubsWrapper) {
        this.speakingClubsWrapper.classList.remove('visible');
        this.speakingClubsWrapper.classList.add('hidden');
        this.speakingClubsWrapper.setAttribute('aria-hidden', 'true');
      }
      if (this.langSelect) this.langSelect.value = 'ALL';

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
