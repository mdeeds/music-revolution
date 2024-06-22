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
  static async load(id) {
    const phrase = new PhraseState(id, 'phrase');
    const phraseData = await loadComponent(id);
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
  static async load(id) {
    const phrase = new LyricsPhraseState(id);
    const phraseData = await loadComponent(id);
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
  static async load(id) {
    const line = new LineState(id);
    const lineData = await loadComponent(id);
    line.data = lineData;
    for (const phraseId of lineData.phrases) {
      line.addPhrase(await PhraseState.load(phraseId));
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

  // Static method to load a SectionState from IDB
  static async load(id) {
    const section = new SectionState(id);
    const sectionData = await loadComponent(id);
    section.data = sectionData;
    for (const lineId of sectionData.lines) {
      section.addLine(await LineState.load(lineId));
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

  // Static method to load a SongState from IDB
  static async load(id) {
    const song = new SongState(id);
    const songData = await loadComponent(id);
    song.data = songData;
    for (const sectionId of songData.sections) {
      song.addSection(await SectionState.load(sectionId));
    }
    return song;
  }
}


// Example usage:
async function example() {
  // ... create and save the song state as before ...

  // Load the song state using the class's static load method
  const loadedSong = await SongState.load('song1'); 

  // Now, loadedSong is a properly constructed SongState object with 
  // all child sections, lines, and phrases loaded and reconstructed.
  console.log(loadedSong);
}

