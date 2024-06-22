// This is an abstract class which is the parent class of all visual song comonents.
class Component {
    constructor(element) {
        this.element = element;
        this.guid = `id${Math.random()*1000 + Math.random()}`;
    }

    getElement() {
        return element;
    }
}


// The base level component.  It has no children.  This is also an abstract class which
// is extended by the four basic phrase types: waveform, lyrics, chords, and notation.
class Phrase extends Component {
    
}

class Line extends Component {
    constructor(element) {
        super(element);
        this.phrases = [];
    }

    addPhrase(phrase) {
        this.phrases.push(phrase);
        this.element.appendChild(phrase.getElement());
    }
}

class Section extends Component {
    addLine(line) {
    }
}

class Song extends Component {
    addSection(section) {
    }
}
