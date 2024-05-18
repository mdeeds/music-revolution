class Metronome {
    constructor(audioContext, bpm = 120) {
		this.audioContext = audioContext;
        this.bpm = bpm;

        this.oscillator = null;
        this.intervalId = null;
        
        this.nextClickTime = 0.0;
        this.lastClickTime = 0.0;
        this.beatNumber = 0;
        this.running = false;
        
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.frequency.setValueAtTime(
            440,
            this.audioContext.currentTime); // Middle A
        this.oscillator.type = 'square';
        
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.setValueAtTime(0.0, this.audioContext.currentTime);
        
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        this.oscillator.start();
    }
    
    start() {
        this.running = true;
        requestAnimationFrame(this.nextBeat.bind(this));
    }
    
    nextBeat() {
        if (this.running) { requestAnimationFrame(this.nextBeat.bind(this)); }
        const nowTime = this.audioContext.currentTime;
        // If we already have something scheduled in the future, we are done.
        if (this.lastClickTime > nowTime) return;
        // Handle the case where we are late and need to run the clock
        // forward for beats we missed.
        while (nowTime > this.nextClickTime) {
            this.beatNumber++;
            this.nextClickTime += 60.0 / this.bpm;
        }
        const frequency = (this.beatNumber % 4 == 0) ? 440 : 220;
        this.oscillator.frequency.setValueAtTime(frequency, this.nextClickTime);
        this.gainNode.gain.setValueAtTime(0.1, this.nextClickTime);
        this.gainNode.gain.linearRampToValueAtTime(
            0.0, this.nextClickTime + 0.05);
        this.lastClickTime = this.nextClickTime;
        this.beatNumber++;
        this.nextClickTime += 60.0 / this.bpm;
    }
    
    stop() {
        this.running = false;
    }
}

class MidiLogger {
    constructor(textContainer, autioContext, bpm = 120) {
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
            this.currentNotes.set(noteName, {startTime: nowTime});
            this.lastNoteTime = nowTime;
        } else if (eventType == 0x80 || eventType == 0x90) { // Note Off
            if (this.currentNotes.has(noteName)) {
                const note = this.currentNotes.get(noteName);
                note.noteName = noteName;
                note.duration = this.getNoteOffset(nowTime) - this.getNoteOffset(note.startTime);
                this.notes.push(note);
                this.updateTextArea();
            }
        }
    }

    updateTextArea() {
        let output = "";
        if (this.notes.length > 0) {
            // Sort notes by start time
            this.notes.sort((a, b) => a.startTime - b.startTime);
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

class MidiPlayer {
    constructor(audioContext, bpm = 120) {
        this.audioContext = audioContext;
        this.noteMap = new Map();
        this.isPlaying = false;
        this.bpm = bpm;
    }

    play(midiString) {
        if (this.isPlaying) {
            return;
        }
        this.isPlaying = true;

        const notes = midiString.trim().split(/\s+/);
        const startTime = this.audioContext.currentTime;
        let currentTime = startTime;

        for (let i = 0; i < notes.length; i += 3) {
            const timeDelta = parseFloat(notes[i]);
            const duration = parseFloat(notes[i+1]);
            const noteName = notes[i + 2];

            currentTime += timeDelta * (60.0 / this.bpm / 12);
            const endTime = currentTime + duration * (60.0 / this.bpm / 12);

            if (!this.noteMap.has(noteName)) {
                this.createNote(noteName);
            }

            const gainNode = this.noteMap.get(noteName).gainNode;

            gainNode.gain.setValueAtTime(0.1, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.0, endTime);
        }

        // Schedule the cleanup after the last note
        const cleanupTime = currentTime + 0.5;
        setTimeout(this.stop.bind(this), (cleanupTime - startTime) * 1000);
    }

    createNote(noteName) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
            this.getFrequency(noteName), this.audioContext.currentTime);
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        this.noteMap.set(noteName, { oscillator, gainNode });
    }

    getFrequency(noteName) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F',
                       'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(noteName.slice(-1));
        const noteIndex = notes.indexOf(noteName.slice(0, -1));
        // C0 is MIDI note 12.
        const midiNote = noteIndex + (12 * octave) + 24;
        return 440 * Math.pow(2, (midiNote - 69) / 12); 
    }

    stop() {
        this.isPlaying = false;
        for (const [, { oscillator, gainNode }] of this.noteMap) {
            oscillator.stop();
            oscillator.disconnect();
            gainNode.disconnect();
        }
        this.noteMap.clear();
    }
}

class SpeechToText {
    constructor(container) {
        this.container = container;
        this.currentTranscript = '';
        const SpeechRecognition =
              window.SpeechRecognition || window.webkitSpeechRecognition;
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.addEventListener('result',  this.handleResult.bind(this));
		this.recognition.addEventListener('soundstart', (event) => { console.log(event) });
		this.recognition.addEventListener('speechstart', (event) => { console.log(event) });
		this.recognition.addEventListener('error', (event) => { console.log(event) });
		this.recognition.addEventListener('nomatch', (event) => { console.log(event) });
        this.recognition.onend = () => {
            if (this.capturing) {
                this.start();
            }
        };
        this.outputDiv = undefined;
        this.capturing = false;
    }

    start() {
        console.log('Starting speech recognition');
        this.capturing = true;
        this.recognition.start();
    }

    stop() {
        console.log('Stopping speech recognition');
        this.capturing = false;
        this.recognition.stop();
    }

    handleResult(event) {
		console.log(event);
        const transcript = event.results[event.resultIndex][0].transcript;
        if (!transcript) return;
		console.log(transcript);

        if (!this.currentTranscript) {
            // Create an empty div for the first transcript
            this.outputDiv = document.createElement('div');
			this.outputDiv.classList.add('midi-log-line');
            this.container.appendChild(this.outputDiv);
        }

        this.outputDiv.innerText = transcript;
        this.currentTranscript = transcript;

        // Reset currentTranscript when transcription is final
        if (event.results[event.resultIndex].isFinal) {
            this.currentTranscript = null;
        }
    }
}

const audioContext = new AudioContext();	
const metronome = new Metronome(audioContext);
const midiLogger = new MidiLogger(document.getElementById('midi-log-area'), audioContext);
midiLogger.connect();
const speechLogger = new SpeechToText(document.getElementById('midi-log-area'));

document.getElementById('start-button').addEventListener('click', metronome.start.bind(metronome));
document.getElementById('stop-button').addEventListener('click', metronome.stop.bind(metronome));
document.getElementById('start-stt').addEventListener('click', speechLogger.start.bind(speechLogger));
document.getElementById('stop-stt').addEventListener('click', speechLogger.stop.bind(speechLogger));

const midiPlayer = new MidiPlayer(metronome.audioContext);

document.getElementById('play-button').addEventListener('click', () => {
  const midiString = document.getElementById('midi-player-area').value;
  midiPlayer.play(midiString);
});
