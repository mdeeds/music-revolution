class Room {
    constructor(roomName, container, localPawn, recorder) {
        container.classList.add('rooms');
        this.roomName = roomName;
        this.participants = new Set();
        this.audioDataBuffers = {};
        this.roomDiv = document.createElement('div');
        this.roomDiv.classList.add('room');
        const roomNameDiv = document.createElement('div');
        roomNameDiv.classList.add('room-name');
        roomNameDiv.innerText = roomName;
        this.roomDiv.appendChild(roomNameDiv);
        
        this.seatsDiv = document.createElement('div');
        this.seatsDiv.classList.add('seats');
        this.seatsDiv.innerText = 'seats';
        this.roomDiv.appendChild(this.seatsDiv);

        this.micDiv = document.createElement('div');
        this.micDiv.innerText = 'mic';
        this.roomDiv.appendChild(this.micDiv);

        this.localPawn = localPawn;
        this.recorder = recorder;
        this.seatsDiv.addEventListener('click', this.addToRoom.bind(this, localPawn));
        this.micDiv.addEventListener('click', this.addToMic.bind(this, localPawn));
        container.appendChild(this.roomDiv);
    }

    addToRoom(pawn) {
        this.seatsDiv.appendChild(pawn.element);
        this.recorder.disableRecording();
        
    }
    addToMic(pawn) {
        this.micDiv.appendChild(pawn.element);
        this.recorder.enableRecording();
    }
}

