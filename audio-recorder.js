class AudioRecorder {
  constructor(container) {
    this.container = container;
    this.isRecording = false;
    this.recorder = null;
    this.audioData = null;

    this.recordButton = document.createElement('button');
    this.recordButton.textContent = 'Record';
    this.container.appendChild(this.recordButton);
    this.recordButton.addEventListener('click', this.handleRecordClick.bind(this));
  }

  handleRecordClick() {
    if (this.isRecording) {
      this.stopRecording();
      this.renderWaveform();
    } else {
      this.startRecording();
      this.recordButton.textContent = 'Stop Recording';
    }
    this.isRecording = !this.isRecording;
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recorder = new MediaRecorder(stream, {
          mimeType: "audio/pcm;rate=48000;encoding=float;bits=32"});
    this.audioData = [];
    this.recorder.ondataavailable = (event) => this.audioData.push(event.data);
    this.recorder.start();
  }

  stopRecording() {
    this.recorder.stop();
  }

  renderWaveform() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const audioBuffer = new Blob(this.audioData, { type: 'audio/webm' });

    // Simulate audio processing to get max/min values (replace with your audio analysis library)
    const audioCtx = new AudioContext();
    audioCtx.decodeAudioData(audioBuffer, (decodedData) => {
      const bufferLength = decodedData.length;
      let maxValue = -Infinity;
      let minValue = Infinity;
      for (let i = 0; i < bufferLength; i++) {
        maxValue = Math.max(maxValue, decodedData.getChannelData(0)[i]);
        minValue = Math.min(minValue, decodedData.getChannelData(0)[i]);
      }

      const recordingLength = this.audioData.length / 44100; // Assuming 44100 Hz sample rate
      canvas.width = 10 * recordingLength;
      canvas.height = 150;

      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        const x = i * (canvas.width / bufferLength);
        const y = canvas.height / 2 - (decodedData.getChannelData(0)[i] - minValue) * (canvas.height / (maxValue - minValue));
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      this.container.appendChild(canvas);
      canvas.addEventListener('click', this.handlePlayback.bind(this));
    });
  }

  handlePlayback(event) {
    const audioElement = new Audio();
    const audioBlob = new Blob(this.audioData, { type: 'audio/webm' });
    audioElement.src = URL.createObjectURL(audioBlob);

    if (audioElement.paused) {
      audioElement.play();
      event.target.style.cursor = 'pointer'; // Change cursor to indicate playing
    } else {
      audioElement.pause();
      event.target.style.cursor = 'default'; // Change cursor back to default
    }
  }
}

