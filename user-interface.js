class UserInterface {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;
        this.parentDiv.innerHTML = '';
        this._createSettingsDiv();
        this._createAvatar();

        this._createStudiosDiv();
        this._createScoreDiv();
    }

    _createSettingsDiv() {
        this.settingsDiv = document.createElement('div');
        this.settingsDiv.classList.add('section');
        this.settingsDiv.id = 'settings'

        const settingsButton = document.createElement('button');
        settingsButton.innerText = 'settings';
        this.settingsDiv.appendChild(settingsButton);
        const settingsValues = document.createElement('div');
        this.settingsDiv.appendChild(settingsValues);

        settingsButton.addEventListener(
            'click', () => { settingsValues.classList.toggle('hidden'); });
        this.settings = new Settings(settingsValues);
        this.parentDiv.appendChild(this.settingsDiv);
    }

    _createAvatar() {
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerText = this.settings.get('name');
        this.settingsDiv.appendChild(avatar);
    }

    _createStudiosDiv() {
        this.huddleDiv = document.createElement('div');
        this.huddleDiv.classList.add('section');
        this.huddleDiv.id = 'studios'
        this.parentDiv.appendChild(this.huddleDiv);
        for (const name of ['Chatter Box', 'Mercury Cove', 'Apollo Room', 'Muse Booth', 'Dark Corner']) {
            const span = document.createElement('div');
            span.classList.add('studio');
            // const img = document.createElement('img');
            // img.src = 'resources/Studio.jpeg';
            // span.appendChild(img);
            this._fillStudioDiv(span, name);
            this.huddleDiv.appendChild(span);
        }
    }

    _fillStudioDiv(studioDiv, name) {
        // Create the "rec" div
        const recDiv = document.createElement('div');
        recDiv.textContent = 'rec';
        recDiv.classList.add('rec'); // Add a class for styling
        // Add the divs to the studio div
        studioDiv.appendChild(recDiv);
        
        // Create the remaining four divs
        const innerDiv = document.createElement('div');
        innerDiv.innerText = name;
        innerDiv.classList.add('inner-studio');
        studioDiv.appendChild(innerDiv);
    }
    

    _createScoreDiv() {
        this.scoreDiv = document.createElement('div');
        this.scoreDiv.classList.add('section');
        this.scoreDiv.id = 'score';
        this.parentDiv.appendChild(this.scoreDiv);
        this.pagesDiv = document.createElement('div');
        this.pagesDiv.id = 'pages'
        this.scoreDiv.appendChild(this.pagesDiv);
        this.pages = [];
        this.addPage();
        
        this.addPageButton = document.createElement('button');
        this.addPageButton.id = 'addPage';
        this.addPageButton.innerHTML = '<img src=resources/add-page.jpeg>';
        this.addPageButton.addEventListener('click', (event) => {
            this.addPage();
        });
        this.scoreDiv.appendChild(this.addPageButton);
    }

    addPage() {
        const page = document.createElement('div');
        page.classList.add('page');
        this.pages.push(page);
        this.currentPage = page;
        this.pagesDiv.appendChild(page);
        this._select(page);
        page.addEventListener('click', (event) => { event.stopPropagation(); this._select(page); });

        const recordButton = document.createElement('button');
        recordButton.innerHTML = '&#9679;';
        page.appendChild(recordButton);
        const chordButton = document.createElement('button');
        chordButton.innerText = 'C';
        page.appendChild(chordButton);
        const textButton = document.createElement('button');
        textButton.innerText = 'Text';
        page.appendChild(textButton);
        const midiButton = document.createElement('button');
        midiButton.innerHTML = '&#9835;';
        page.appendChild(midiButton);
        
    }

    _addLine() {
        const line = document.createElement('div');
        line.classList.add('line');
        this.currentPage.appendChild(line);
        this._select(line);
        line.addEventListener('click', (event) => { event.stopPropagation(); this._select(line); });
        return line;
    }
    
    addNotationLine() {
        const line = this._addLine();
        line.classList.add('notation');
        line.innerHTML = '&4=A=B=C=D=E=F=G=H=!=C=D=E=F=G=H=I=J=!=E=F=G=H=I=J=K=L=!=G=H=I=J=K=L=M=N=!'
    }

    addChordLine() {
        const line = this._addLine();
        line.classList.add('chords');
        line.innerHTML = 'A&sharp;    &VerticalSeparator; B&flat;    &VerticalSeparator; Gm7  E&#9837; &VerticalSeparator; C#m    ';
    }

    addLyricLine() {
        const line = this._addLine();
        line.classList.add('lyrics');
        line.innerHTML = 'On the keys, I can be quiet clever';
    }

    _select(elm) {
        document.querySelectorAll('.selected').forEach(element =>
            element.classList.remove('selected'));
        elm.classList.add('selected');
    }

}
