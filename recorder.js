async function getAudioSourceNode() {
    const audioCtx = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                // Disable processing for higher quality audio.
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false, // Not guaranteed to work in all browsers
            },
        },
    });
    console.log(`Strem: ${stream.id}`);
    const source = audioCtx.createMediaStreamSource(stream);
    return source;
}

class WorkletRecorder {
    constructor(source) {
        this.source = source;
        this.button = document.createElement('button');
        this.button.innerText = 'record';
        this.button.addEventListener('click', () => { this.handleClick(); });
        document.body.appendChild(this.button);
        this.isRecording = false;
        this.startRecording().then((worklet) => { this.worklet = worklet; });
    }

    async startRecording() {
	      return new Promise(async (resolve, reject) => {
            try {
                const audioCtx = this.source.context;
	              await audioCtx.audioWorklet.addModule("work-worker.js");
                const workletNode = new AudioWorkletNode(audioCtx, "recorder-worklet");
                this.source.connect(workletNode);
                
                // Set up a port to receive messages from the worklet
                const workletPort = workletNode.port;
                workletPort.onmessage = (event) => {
                    // Handle messages received from the worklet (e.g., waveform data)
                    console.log("Message from worklet:", event.data.command);
                    switch (event.data.command) {
                    case 'waveformData':
                        this.handleNewWaveform(event.data.data);
                        break;
                    default:
                        console.log(`Unrecognized command: '${event.data.command}'`);
                    }
                };
                
	              resolve(workletNode);
            } catch (error) {
                reject(error);
            }
	      });
    }

    handleClick() {
        if (this.isRecording) {
            const message = {
                command: 'getData', startTime:
                this.startTime,
                endTime: this.source.context.currentTime };
            console.log(message);
            this.worklet.port.postMessage(message);
            this.button.innerText = 'record';
        } else {
            this.startTime = this.source.context.currentTime;
            this.button.innerText = 'stop';
        }
        this.isRecording = !this.isRecording;
    }

    handleNewWaveform(waveformData) {
        const canvas = document.createElement('canvas');
        const recordingLength = waveformData.length / this.source.context.sampleRate;
        canvas.width = Math.round(10 * recordingLength);
        canvas.height = 60;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        const bufferLength = waveformData.length;

        let previousX = 0;
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < bufferLength; i++) {
            const x = Math.floor(i * (canvas.width / bufferLength));
            if (x > previousX) {
                ctx.fillRect(previousX, minY, 1, (maxY - minY + 1));
                previousX = x;
                minY = Infinity;
                maxY = -Infinity;
            }
            const y = canvas.height / 2 - (canvas.height / 3) * waveformData[i];
            // const y = canvas.height / 2 - (canvas.height / 3) * Math.sin(i * 0.00001);
            minY = Math.min(y, minY);
            maxY = Math.max(y, maxY);
        }
        document.body.appendChild(canvas);
        // canvas.addEventListener('click', this.handlePlayback.bind(this));
    }
}

async function initAudio() {
	  document.body.innerHTML = "";
    const source = await getAudioSourceNode();
    const recorder = new WorkletRecorder(source);
}
 
