// Base class for all components with state
class Component {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.data = {}; // Placeholder for component-specific data
  }
}

// PhraseState class (abstract)
class PhraseState extends Component {
  constructor(id, type) {
    super(id, type);
  }

  // Static method to load a PhraseState from IDB
    static load(store, id) {
    const phrase = new PhraseState(id, 'phrase');
    const phraseData = store.get(id);
    phrase.data = phraseData;
    return phrase;
  }
}

// Concrete PhraseState classes
class LyricsPhraseState extends PhraseState {
  constructor(id) {
    super(id, 'lyrics');
    this.data = { text: '' };
  }

  setLyrics(lyricsText) {
    this.data.text = lyricsText;
  }

  getLyrics() {
    return this.data.text;
  }

  // Static method to load a LyricsPhraseState from IDB
    static load(store, id) {
    const phrase = new LyricsPhraseState(id);
    const phraseData = store.get(id);
    phrase.data = phraseData;
    return phrase;
  }
}

// ... other PhraseState subclasses (AudioPhraseState, MidiPhraseState, ChordPhraseState)

// LineState class
class LineState extends Component {
  constructor(id) {
    super(id, 'line');
    this.data = { phrases: [] }; 
  }

  addPhrase(phrase) {
    this.data.phrases.push(phrase.id);
  }

  getPhrases() {
    return this.data.phrases.map(id => {
      // Assuming you have a global registry or method to get PhraseState by ID
      const phrase = getPhraseState(id); 
      return phrase;
    });
  }

  // Static method to load a LineState from IDB
    static load(store, id) {
    const line = new LineState(id);
    const lineData = store.get(id);
    line.data = lineData;
    for (const phraseId of lineData.phrases) {
        line.addPhrase(PhraseState.load(store, phraseId));
    }
    return line;
  }
}

// SectionState class
class SectionState extends Component {
  constructor(id, title) {
    super(id, 'section');
    this.data = { title: title, lines: [] };
  }

  setTitle(title) {
    this.data.title = title;
  }

  getTitle() {
    return this.data.title;
  }

  addLine(line) {
    this.data.lines.push(line.id);
  }

  getLines() {
    return this.data.lines.map(id => {
      // Assuming you have a global registry or method to get LineState by ID
      const line = getLine(id); 
      return line;
    });
  }

  // Static method to load a SectionState from Store
    static load(store, id) {
    const section = new SectionState(id);
    const sectionData = store.get(id);
    section.data = sectionData;
    for (const lineId of sectionData.lines) {
        section.addLine(LineState.load(store, lineId));
    }
    return section;
  }
}

// SongState class
class SongState extends Component {
  constructor(id, name) {
    super(id, 'song');
    this.data = { name: name, sections: [] };
  }

  setName(name) {
    this.data.name = name;
  }

  getName() {
    return this.data.name;
  }

  addSection(section) {
    this.data.sections.push(section.id);
  }

  getSections() {
    return this.data.sections.map(id => {
      // Assuming you have a global registry or method to get SectionState by ID
      const section = getSection(id);
      return section;
    });
  }

  // Static method to load a SongState from Store
    static load(store, id) {
        const song = new SongState(id);
        const songData = store.get(id);
        song.data = songData;
        for (const sectionId of songData.sections) {
            song.addSection(SectionState.load(store, sectionId));
        }
        return song;
    }
}
