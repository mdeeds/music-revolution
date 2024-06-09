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
    console.log(`Stream: ${stream.id}`);
    const source = audioCtx.createMediaStreamSource(stream);
    return source;
}

class WorkletRecorder {
    constructor(source, controlsDiv, outputDiv) {
        this.source = source;
        this.controlsDiv = controlsDiv;
        this.outputDiv = outputDiv;
        this.button = document.createElement('button');
        this.button.innerText = 'record';
        this.button.addEventListener('click', () => { this.handleClick(); });
        controlsDiv.appendChild(this.button);
        this.isRecording = false;
        this.startRecording().then((worklet) => { this.worklet = worklet; });
        this.waveformCanvases = [];
        this.dropTarget = document.createElement('div');
        this.dropTarget.id = 'drop-target';
        this.dropTarget.innerText = "Drop Audio Here";
        controlsDiv.appendChild(this.dropTarget);
        this.dropTarget.addEventListener('dragover', this.handleDragOver.bind(this));
        this.dropTarget.addEventListener('drop', this.handleDrop.bind(this));
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
        const canvasWrapper = document.createElement('div');
        canvasWrapper.classList.add('canvas-wrapper');
        canvasWrapper.draggable = true;
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
            minY = Math.min(y, minY);
            maxY = Math.max(y, maxY);
        }
        canvasWrapper.appendChild(canvas);
        canvasWrapper.appendChild(this.createPlayButton(waveformData)); 
        this.outputDiv.appendChild(canvasWrapper);

        canvasWrapper.addEventListener(
            'dragstart', this.handleDragStart.bind(this, canvasWrapper, waveformData));
        this.waveformCanvases.push(canvasWrapper);
    }

    createPlayButton(waveformData) {
        const playButton = document.createElement('button');
        playButton.textContent = 'Play';

        let audioBufferSourceNode = null;
        const audioBuffer = this.source.context.createBuffer(
            1, // Number of channels
            waveformData.length, // Length of the buffer
            this.source.context.sampleRate // Sample rate
        );
        audioBuffer.getChannelData(0).set(waveformData); 
        
        playButton.addEventListener('click', () => {
            if (!!audioBufferSourceNode) {
                audioBufferSourceNode.stop();
                audioBufferSourceNode.disconnect();
            }
            
            // Create and store the audio buffer source node
            audioBufferSourceNode = this.source.context.createBufferSource();
            audioBufferSourceNode.buffer = audioBuffer;
            audioBufferSourceNode.connect(this.source.context.destination);
            audioBufferSourceNode.start();
        });

        return playButton;
    }

    handleDragStart(canvasWrapper, waveformData, event) {
        event.dataTransfer.setData('text/plain', 'Audio Data');
        event.dataTransfer.setData(
            `audio/pcm;rate=${this.source.context.sampleRate};encoding=float;bits=32`, waveformData.buffer);
        canvasWrapper.style.cursor = "grabbing";
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy"; 
        this.dropTarget.style.backgroundColor = "lightblue"; 
    }

    handleDrop(event) {
        event.preventDefault();
        this.dropTarget.style.backgroundColor = "darkgrey"; 
        const mimeTypes = [];
        for (const key of event.dataTransfer.types) {
            mimeTypes.push(key);
            const dataValue = event.dataTransfer.getData(key);
            console.log(`MIME Type: ${key}, Data: ${dataValue}`);
            if (key === 'Files') {
                // Handle dropped files
                const files = event.dataTransfer.files;
                for (const file of files) {
                    console.log(`File Name: ${file.name}, MIME Type: ${file.type}, Size: ${file.size}`);
                    this.handleNewAudioFile(file);
                }
            }
        }
        this.dropTarget.innerText = "MIME Types: " + mimeTypes.join(", ");
    }

    handleNewAudioFile(file) {
        const audioContext = this.source.context;
        if (!audioContext) { console.error('No audio context.'); }
        
        if (file.type.startsWith('audio/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                audioContext.decodeAudioData(e.target.result, (audioBuffer) => {
                    // Success decoding audio data
                    const bufferData = audioBuffer.getChannelData(0); // Assuming mono audio
                    
                    // Create the drag-and-drop canvas element
                    this.handleNewWaveform(bufferData);
                }, (error) => {
                    // Error decoding audio data
                    console.error('Error decoding audio data:', error);
                });
            };
            reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
        } else {
            console.warn(`File ${file.name} is not an audio file.`);
        }
    }
}
 
