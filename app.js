
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
	  document.body.innerHTML = `
  <div id='settings-div'></div>
  <div class="container">
    <div class="music-area">
      <div class="composition" id="composition">
        <div id=header></div>
        <div class="line" id="first-line"></div>
      </div>
    </div>
    <div class="collaboration-panel" id="collaboration-panel">
  </div>
  </div>
`;
    
    const settingsDiv = document.getElementById('settings-div');
    const store = await Store.create('zatt-store', 'zatt-db');
    const settings = new Settings(settingsDiv, store);

    const header = new LyricsPhrase(document.getElementById('header'));
    header.setContent(`bpm = ${settings.get('bpm')}`); 

    const roomsDiv = document.getElementById('collaboration-panel');
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls-div';
    document.body.appendChild(controlsDiv);

    const outputDiv = document.getElementById('first-line');

    
    new StaffPhrase(outputDiv);
    new LyricsPhrase(outputDiv);

    const source = await getAudioSourceNode();
    const recorder = new WorkletRecorder(source, controlsDiv, outputDiv);

    const midiLogger = new MidiLogger(outputDiv, source, settings.numberGetOr('bpm', 120));
    const speechLogger = new SpeechToText(outputDiv);
    setUpSpeechToText(controlsDiv, speechLogger);

    const pawn = new Pawn(settings.getOr('name', 'User'));
    const huddle = new Room('Huddle', roomsDiv, pawn, recorder);
    const studio = new Room('Studio 1', roomsDiv, pawn, recorder);
}
