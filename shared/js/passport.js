/**
 * COSY Passport ES Module
 * Module: shared/js/passport.js
 */

export const ALLOWED_SOURCES = [
  'COSYlanguages',
  'COSYtools',
  'COSYworld',
  'COSYgames',
  'COSYevents'
];

/**
 * Merges new progress entries and badges into an existing passport object (or creates a new passport).
 * Preserves progress entries and badges from other sources.
 *
 * @param {Object|string|null} existingJSON - Existing passport object or JSON string.
 * @param {Object} newEntries - Object containing { progress: Array, badges: Array, source: string }.
 * @param {string} [language] - Target language code.
 * @returns {Object} Updated passport object.
 */
export function exportPassport(existingJSON, newEntries = {}, language = 'en') {
  let passport = {
    cosy_passport_version: 1,
    language: language,
    updated: new Date().toISOString(),
    progress: [],
    badges: []
  };

  if (existingJSON) {
    try {
      const parsed = typeof existingJSON === 'string' ? JSON.parse(existingJSON) : existingJSON;
      if (parsed && typeof parsed === 'object') {
        passport.cosy_passport_version = parsed.cosy_passport_version || 1;
        passport.language = language || parsed.language || 'en';
        passport.progress = Array.isArray(parsed.progress) ? [...parsed.progress] : [];
        passport.badges = Array.isArray(parsed.badges) ? [...parsed.badges] : [];
      }
    } catch (e) {
      console.warn('Invalid existing passport JSON provided to exportPassport. Creating new passport structure.', e);
    }
  }

  const callingSource = newEntries.source;
  const newProgress = Array.isArray(newEntries.progress) ? newEntries.progress : [];
  const newBadges = Array.isArray(newEntries.badges) ? newEntries.badges : [];

  if (callingSource) {
    passport.progress = passport.progress.filter(entry => entry && entry.source !== callingSource);
  }

  for (const entry of newProgress) {
    if (entry && typeof entry === 'object' && entry.item) {
      passport.progress.push({
        source: entry.source || callingSource || 'COSYlanguages',
        item: entry.item,
        value: entry.value
      });
    }
  }

  for (const badge of newBadges) {
    if (typeof badge === 'string' && !passport.badges.includes(badge)) {
      passport.badges.push(badge);
    }
  }

  passport.updated = new Date().toISOString();
  return passport;
}

/**
 * Imports a passport JSON object or string and extracts progress entries and badges relevant to sourceName.
 *
 * @param {Object|string} json - Passport object or JSON string.
 * @param {string} sourceName - Source repository name (e.g., 'COSYevents').
 * @returns {Object} Filtered object containing { progress, badges, language, version }.
 */
export function importPassport(json, sourceName) {
  let passportData = null;

  if (typeof json === 'string') {
    try {
      passportData = JSON.parse(json);
    } catch (e) {
      throw new Error('Invalid JSON string passed to importPassport: ' + e.message);
    }
  } else if (json && typeof json === 'object') {
    passportData = json;
  } else {
    throw new Error('Invalid passport data format passed to importPassport');
  }

  const allProgress = Array.isArray(passportData.progress) ? passportData.progress : [];
  const allBadges = Array.isArray(passportData.badges) ? passportData.badges : [];

  const sourceProgress = sourceName
    ? allProgress.filter(entry => entry && entry.source === sourceName)
    : allProgress;

  return {
    version: passportData.cosy_passport_version || 1,
    language: passportData.language || 'en',
    updated: passportData.updated || null,
    progress: sourceProgress,
    badges: allBadges,
    rawPassport: passportData
  };
}

/**
 * Triggers a browser file download of the passport object as a JSON file.
 *
 * @param {Object} obj - Passport object to download.
 * @param {string} [filename='cosy-passport.json'] - File name for download.
 */
export function downloadPassport(obj, filename = 'cosy-passport.json') {
  const jsonStr = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Loads and parses a passport JSON file from an HTML file input element or File object.
 *
 * @param {HTMLInputElement|File} input - File object or HTML file input element.
 * @returns {Promise<Object>} Resolves to parsed passport JavaScript object.
 */
export function loadPassportFromFile(input) {
  return new Promise((resolve, reject) => {
    let file = null;

    if (input instanceof File) {
      file = input;
    } else if (input && input.files && input.files[0]) {
      file = input.files[0];
    } else {
      return reject(new Error('No valid File object or file input provided'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        resolve(parsed);
      } catch (e) {
        reject(new Error('Failed to parse passport file as JSON: ' + e.message));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading passport file'));
    };
    reader.readAsText(file);
  });
}
