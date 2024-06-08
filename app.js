async function init() {
	  document.body.innerHTML = "";
    const settingsDiv = document.createElement('div');
    settingsDiv.id = 'settings-div';
    document.body.appendChild(settingsDiv);
    
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
}
