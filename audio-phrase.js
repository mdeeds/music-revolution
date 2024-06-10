class AudioPhrase {
    constructor(audioContext, waveformData, canvasWrapper) {
        this.audioContext = audioContext;
        this.waveformData = waveformData;
        this.canvasWrapper = canvasWrapper;
        this.audioBufferSourceNode = null;
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
        this.gainNode.connect(this.audioContext.destination);

        this.muted = false;

        this.audioBuffer = this.audioContext.createBuffer(
            1, // Number of channels
            this.waveformData.length, // Length of the buffer
            this.audioContext.sampleRate // Sample rate
        );
        this.audioBuffer.getChannelData(0).set(this.waveformData);
        this.createMuteButton();
    }

    createMuteButton() {
        const muteButton = document.createElement('button');
        muteButton.textContent = this.muted ? 'Unmute' : 'Mute'; 

        muteButton.addEventListener('click', () => {
            this.toggleMute(); 
            muteButton.textContent = this.muted ? 'Unmute' : 'Mute';
        });

        this.canvasWrapper.appendChild(muteButton);
    }

    toggleMute() {
        this.muted = !this.muted;
        this.gainNode.gain.setValueAtTime(
            this.muted ? 0 : 1, this.audioContext.currentTime);
    }

    play() {
        if (this.muted) {
            return;
        }

        this.stop();
        this.audioBufferSourceNode = this.audioContext.createBufferSource();
        this.audioBufferSourceNode.buffer = this.audioBuffer;
        this.audioBufferSourceNode.connect(this.gainNode);
        this.audioBufferSourceNode.start();
    }

    stop() {
        if (this.audioBufferSourceNode) {
            this.audioBufferSourceNode.stop();
            this.audioBufferSourceNode.disconnect();
            this.audioBufferSourceNode = null;
        }
    }
}
