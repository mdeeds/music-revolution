
function setUpSpeechToText(controlsDiv, speechLogger) {
  const startSttButton = document.createElement('button');
  startSttButton.textContent = 'Start Speech Capture';
  controlsDiv.appendChild(startSttButton);
  startSttButton.addEventListener('click', speechLogger.start.bind(speechLogger));

  const stopSttButton = document.createElement('button');
  stopSttButton.textContent = 'Stop Speech Capture';
  controlsDiv.appendChild(stopSttButton);
  stopSttButton.addEventListener('click', speechLogger.stop.bind(speechLogger));
}

async function init() {
	  document.body.innerHTML = "";
    const settingsDiv = document.createElement('div');
    settingsDiv.id = 'settings-div';
    document.body.appendChild(settingsDiv);

    const roomsDiv = document.createElement('div');
    document.body.appendChild(roomsDiv);
    
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls-div';
    document.body.appendChild(controlsDiv);

    const outputDiv = document.createElement('div');
    outputDiv.id = 'output-div';
    document.body.appendChild(outputDiv);
    const source = await getAudioSourceNode();
    const recorder = new WorkletRecorder(source, controlsDiv, outputDiv);

    const settings = new Settings(settingsDiv);
    const midiLogger = new MidiLogger(outputDiv, source, settings.numberGetOr('bpm', 120));
    const speechLogger = new SpeechToText(outputDiv);
    setUpSpeechToText(controlsDiv, speechLogger);

    const pawn = new Pawn(settings.getOr('name', 'User'));
    const huddle = new Room('Huddle', roomsDiv, pawn, recorder);
    const studio = new Room('Studio 1', roomsDiv, pawn, recorder);
}
