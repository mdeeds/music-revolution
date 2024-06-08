
// TODO: Look at indexd db:
// const quota = await navigator.storage.estimate();
// const totalSpace = quota.quota;
// const usedSpace = quota.usage;
// quota.quota : 17,846,894,592

class Settings {
    constructor(containerDiv) {
        this.containerDiv = containerDiv;
        this.settings = new Map();
        this.loadSettings();
        this.createSettingsUI();
        this.attachEventListeners();
    }

    loadSettings() {
        const searchParams = new URLSearchParams(window.location.search);
        for (const key of ['name', 'bpm', 'title']) {
            const urlValue = searchParams.get(key);
            if (urlValue !== null) {
                this.settings.set(key, urlValue);
            } else {
                // Fallback to localStorage if not found in URL
                const value = localStorage.getItem(key) || "";
                this.settings.set(key, value);
            }
        }
    }

    _getIdForKey(key) {
        return `setting-${key}-value`;
    }

    createSettingsUI() {
        this.settingsDiv = document.createElement('div');
        this.settingsDiv.classList.add('settings-hidden');

        for (const [key, value] of this.settings.entries()) {
            const settingElement = document.createElement('div');
            settingElement.classList.add('setting');
            settingElement.innerHTML = `
        <span class="setting-key">${key}</span>
        <input id="${this._getIdForKey(key)}" type="text" class="setting-value" value="${value}">
      `;
            this.settingsDiv.appendChild(settingElement);
        }
        this.containerDiv.appendChild(this.settingsDiv);
    }

    attachEventListeners() {
        const settingInputs = this.containerDiv.querySelectorAll('.setting-value');
        settingInputs.forEach(input => {
            input.addEventListener('change', () => {
                const key = input.parentNode.querySelector('.setting-key').textContent;
                this.set(key, input.value);
            });
        });
    }

    get(key) {
        return this.settings.get(key) || "";
    }

    getOr(key, defaultValue) {
        const result = this.settings.get(key);
        if (result) {
            return result;
        } else {
            this.set(key, defaultValue);
            return defaultValue;
        }
    }

    numberGetOr(key, defaultValue) {
        const result = this.getOr(key, defaultValue);
        if (typeof(result) === 'number') {
            return result;
        }  else {
            return parseInt(result);
        }
    }

    set(key, value) {
        this.settings.set(key, value);
        localStorage.setItem(key, value);
        const input = this.containerDiv.querySelector(`.setting-value[data-key="${key}"]`);
        if (input) {
            input.value = value;
        }
    }
}
