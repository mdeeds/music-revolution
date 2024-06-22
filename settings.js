
// TODO: Look at indexd db:
// const quota = await navigator.storage.estimate();
// const totalSpace = quota.quota;
// const usedSpace = quota.usage;
// quota.quota : 17,846,894,592

class Settings {
    constructor(containerDiv, store) {
        this.containerDiv = containerDiv;
        this.store = store;
        this.createSettingsUI();
        this.attachEventListeners();
    }

    _getIdForKey(key) {
        return `setting-${key}-value`;
    }

    createSettingsUI() {
        this.settingsDiv = document.createElement('div');
        this.settingsDiv.classList.add('settings-hidden');

        for (const key of ['name', 'bpm', 'title', 'bars per line']) {
            let value = this.store.get(key) || "";
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
        return this.store.get(key) || "";
    }

    getOr(key, defaultValue) {
        const result = this.store.get(key);
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
        this.store.set(key, value);
        const input = this.containerDiv.querySelector(`.setting-value[data-key="${key}"]`);
        if (input) {
            input.value = value;
        }
    }
}
