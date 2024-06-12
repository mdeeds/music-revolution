class LyricsPhrase {
    constructor(container) {
        this.container = container;
        this.div = document.createElement('div');
        this.div.classList.add('lyrics');
        this.div.innerHTML = '&nbsp;';
        this.div.setAttribute('contenteditable', 'plaintext-only');
        container.appendChild(this.div);

        this.div.addEventListener('input', this.onChange.bind(this));
    }
    setContent(content) {
        this.div.innerText = content;
        this.onChange();
    }
    onChange() {
        const content = this.div.innerText;
        const lineBreakIndex = content.indexOf('\n');
        if (lineBreakIndex >= 0) {
            const remainingText = content.substring(lineBreakIndex + 1);
            this.div.innerText = content.substring(0, lineBreakIndex);

            const nextPhrase = new LyricsPhrase(this.container);
            nextPhrase.setContent(remainingText);
        }
    }
}
