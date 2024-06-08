class KeySignature {
    constructor(numSharps = 0) {
        this.numSharps = numSharps;
        this.stafMap = this.getStafMap();
    }

    getStafMap() {
        const mapOfMaps = [
            [], // 5 flats
            [], // 4 flats
            [], // 3 flats
            [], // 2 flats
            [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5], // 1 flat
            [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6], // E.g. C major
            [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 4.5, 5, 5.5, 6], // 1 sharp
        ];
        return mapOfMaps(this.numSharps + 5);
    }
    
    getStafLineForMIDINote(noteNumber) {
        const linesFromC = this.stafMap[noteNumber % 12];
        const octavesFromC = Math.floor((noteNumber - 60) / 12);
        if (this.numSharps < 0) {
            return Math.ceil(linesFromC) + 7 * octavesFromC;
        } else {
            return Math.floor(linesFromC) + 7 * octavesFromC;
        }
    }
}

class Clef {
    constructor(notes) {
        let minNote = 255;
        let maxNote = 0;
        for (const n of notes) {
            minNote = Math.min(n.noteNumber, minNote);
            maxNote = Math.max(n.noteNumber, maxNote);
        }
        midNote = (minNote + maxNote) / 2;
        if (midNote >= 60) {
            this.clefSymbol = '&';
            this.clefName = 'treble';
        } else {
            this.clefSymbol = '¯';
            this.clefName = 'bass';
        }
        // TODO, consider the tenor clef: ÿ 

        this.keySignature = new KeySignature();
    }

    getStafLineForMIDINote(noteNumber) {
        const offsetFromMiddleC = this.keySignature.getStafLineForMIDINote(noteNumber);
        
    }
}

class NoteFormatter {
    // Note: assumes 4/4 time.
    constructor() {
        // MusiQwik font. Arrows are middle C for treble and bass clef.
        // https://www.fontspace.com/musiqwik-font-f3722
        //                v           v
        eigthNotes =   '@ABCDEFGHIJKLMN';
        quarterNotes = 'PQRSTUVWXYZ[\\]^';
        halfNotes =    '`abcdefghijklmn';
        wholeNotes =   'pqrstuvwxyz{|}~';
        sixteenthRest = '8';
        eighthRest = '7';
        quarterRest = ':';
        halfRest = ';';
        fullRest = '<';
    }

    // Notes are objects {noteName, noteNumber, startTime: seconds, duration:seconds}
    format(notes, secondsPerBeat) {
        const clef = new Clef(notes);
        // 0 = common time.
        result = [clef.clefSymbol, '=0'];

        let notedTime = 0;
        let elapsedTime = 0;
        let beatsInBar = 0;
        for (const note of notes) {
            // TODO: Handle rests by advancing time appropriately to note.startTime

            // Write the note
            const numBeats = note.duration / secondsPerBeat;
            let closestBeats = Math.pow(2, Math,round(Math.log2(numBeats)));
            closestBeats = Math.min(4.0, Math.max(closestBeats, 0.5));
            const index = clef.getStafLineForMIDINote(note.noteNumber) + 2;
            if (index < 0 || index >= this.eighthNotes.length) {
                // Note is out of range, just put a dot on the staf.
                result.push('·');
            } else {
                switch (closestBeats) {
                case 0.5: result.push(this.eighthNotes[index]); break;
                case 1.0: result.push(this.quarterNotes[index]); break;
                case 2.0: result.push(this.halfNotes[index]); break;
                case 4.0: result.push(this.wholeNotes[index]); break;
                default: console.error('Unreachable.'); break;
                }
            }
            notedTime += secondsPerBeat * closestBeats;
            elapsedTime += note.duration;
            // Handle bar lines.  Note: for now we don't handle the case where a note
            // is held over the bar line.  We probably want to truncate the note in that case.
            beatsInBar += closestBeats;
            if (beatsInBar >= 4) {
                result.push('!');
                beatsInBar -= 4;
            }
        }
        return result.join('');
    }
}

class MidiLogger {
    constructor(textContainer, audioContext, bpm = 120) {
        this.bpm = bpm;
        this.textContainer = textContainer
        this.textArea = document.createElement('div');
        this.textArea.classList.add('midi-log-line');
        this.textArea.innerHTML = '&nbsp;';
        this.textContainer.appendChild(this.textArea);
        this.lastNoteTime = 0;
		    this.audioContext = audioContext;
        this.notes = [];
        this.currentNotes = new Map();
    }
    
    connect() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(midiAccess => {
				for (const input of midiAccess.inputs.values()) {
					console.log(input);
					input.open();
					input.onstatechange = () => {
						if (input.state === 'connected') {
							// Input port is now connected and ready
                            input.onmidimessage = this.handleMidiMessage.bind(this);
                            console.log('MIDI Connected');
							console.log(input);
						} else {
							console.log(`Failed: ${input.state}`);
						}							
                    };
				}
            }, error => console.error('MIDI Error:', error));
        } else {
            console.error('Web MIDI API not supported');
        }
    }

    // Returns the offset of the current note in 12ths of beats from the
    // start of time.
    getNoteOffset(time){
        const secondsPerBeat = 60.0 / this.bpm;
        const beatNumber = time / secondsPerBeat;
        return Math.round(beatNumber * 12);
    }
    
    handleMidiMessage(message) {
        const data = message.data;
        // Enable this for debugging to log MIDI data to the console.
		    // if (data[0] != 248) console.log(data);
        if (data.length != 3) {
            // Note on and note off events are always 3 bytes.
            // 0xEC 0xNN 0xVV
            // Where 'E' is the event type, 'C' is the MIDI channel
            // 'NN' is the note number, and 'VV' is the velocity.
            return;
        }
        const eventType = data[0] & 0xF0;
        if (eventType != 0x80 && eventType != 0x90) {
            // Ignore any events that are not note-on or note-off.
            return;
        }
        const noteNumber = data[1];
        const noteName = this.getNoteName(noteNumber);
        const nowTime = this.audioContext.currentTime;
        let timeDelta = (this.getNoteOffset(nowTime) -
                         this.getNoteOffset(this.lastNoteTime));

        // If there is a gap larger than 6 beats, we create a new line.
        // 6 beats = 72 twelths of a beat, so we compare timeDelta to 72.
		    if (timeDelta > 72) {
			      this.textArea = document.createElement('div');
				  this.textArea.classList.add('midi-log-line');
            this.textContainer.appendChild(this.textArea);
            this.currentNotes.clear();
			      timeDelta = 0;
				  this.notes = [];
		    }
        
        if (eventType == 0x90 && data[2] > 0) { // Note On
            this.handleNoteOn(noteName, nowTime, noteNumber);
        } else if (eventType == 0x80 || eventType == 0x90) { // Note Off
            this.handleNoteOff(noteName, nowTime, noteNumber);
        }
    }

    handleNoteOn(noteName, nowTime, noteNumber) {
        this.currentNotes.set(noteName, noteNumber, {startTime: nowTime});
        this.lastNoteTime = nowTime;
    }

    handleNoteOff(noteName, nowTime, noteNumber) {
        if (this.currentNotes.has(noteName)) {
            const note = this.currentNotes.get(noteName);
            note.noteName = noteName;
            note.noteNumber = noteNumber;
            note.duration = this.getNoteOffset(nowTime) - this.getNoteOffset(note.startTime);
            this.notes.push(note);
            this.updateTextArea();
        }
    }
    
    getNoteNumber(noteName) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F',
                       'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(noteName.slice(-1));
        const noteIndex = notes.indexOf(noteName.slice(0, -1));
        return noteIndex + (12 * octave) + 24;
    }

    quantizeNotes(notes) {
        const secondsPerEighthNote = 60.0 / this.bpm / 2.0;
        
        const quantizedNotes = notes.map(note => {
            const quantizedStart = secondsPerEighthNote * Math.round(note.startTime / secondsPerEighthNote);
            const quantizedDuration = secondsPerEigthNote * Math.round(note.duration / secondsPerEighthNote);
            return {
                ...note,
                startTime: quantizedStart,
                duration: quantizedDuration 
            };
        });
        return quantizedNotes.filter(note => note.duration > 0);
    }

    makeMonophonicNotes(notes) {
        // Sort notes by start time
        notes.sort((a, b) => a.startTime - b.startTime);

        const monophonicNotes = [];
        let activeNote = null;

        for (const note of notes) {
            if (activeNote === null) {
                // No active note, so add this one
                activeNote = { ...note }; 
                monophonicNotes.push(activeNote);
            } else if (note.startTime >= activeNote.startTime + activeNote.duration) {
                // This note starts after the active note ends
                activeNote = { ...note };
                monophonicNotes.push(activeNote);
            } else if (note.startTime + note.duration > activeNote.startTime + activeNote.duration) {
                // This note overlaps and extends beyond the active note
                activeNote.duration = note.startTime - activeNote.startTime; 
                activeNote = { ...note };
                monophonicNotes.push(activeNote);
            } else {
                // This note is completely overlapped by the active note, ignore it
                continue; 
            }
        }

        // Filter out any notes that might have been reduced to zero duration
        return monophonicNotes.filter(note => note.duration > 0); 
    }

    // Treble clef: &
    // C clef: ÿ
    // Bass clef: ¯
    updateTextArea() {
        let output = "";
        if (notes.length > 0) {
            let notes = this.quantizeNotes(this.notes);
            notes = this.makeMonophonicNotes(notes);
            notes.sort((a, b) => a.startTime - b.startTime);
            let lastNoteTime = this.notes[0].startTime;
            for (const note of this.notes) {
                const timeDelta = this.getNoteOffset(note.startTime) - this.getNoteOffset(lastNoteTime);
                output += timeDelta + " " + note.duration + " " + note.noteName + " ";
				        lastNoteTime = note.startTime;
            }
        }
        this.textArea.innerHTML = output;
    }
    
    getNoteName(noteNumber) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F',
                       'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor((noteNumber - 24) / 12);
        const noteIndex = (noteNumber - 24) % 12;
        return notes[noteIndex] + octave;
    }
}
