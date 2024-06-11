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
			      this.outputDiv.classList.add('lyrics-line');
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
