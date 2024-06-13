class StaffPhrase {
    constructor(container) {
        const div = document.createElement('div');
        div.innerText= "=&4=";
        div.classList.add('staff');
        div.setAttribute('contenteditable', 'plaintext-only');
        div.setAttribute('spellcheck', 'false');
        container.appendChild(div);
    }
}
        
