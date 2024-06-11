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
