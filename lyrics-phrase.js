class LyricsPhrase {
    constructor(container) {
        this.div = document.createElement('div');
        this.div.classList.add('lyrics');
        this.div.innerHTML = '&nbsp;';
        container.appendChild(this.div);
    }
    setContent(content) {
        this.div.innerText = content;
    }
}
