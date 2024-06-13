class Room {
    // .---------------------------.
    // | room                      |
    // | .-----------------------. |
    // | | room-name             | |
    // | .-----------------------. |
    // | .-----------------------. |
    // | | seat-area             | |
    // | | .-------------------. | |
    // | | | recording-area    | | |
    // | | | .---..----..----. | | |
    // | | | |rec||play||seat| | | |
    // | | | .---..----..----. | | |
    // | | .-------------------. | |
    // | | .-------------------. | |
    // | | | visitor-area      | | |
    // | | | .----..----.      | | |
    // | | | |seat||seat|      | | |
    // | | | .----..----.      | | |
    // | | | .----..----.      | | |
    // | | | |seat||seat|      | | |
    // | | | .----..----.      | | |
    // | | .-------------------. | |
    // | .-----------------------. |
    // .---------------------------.
    constructor(roomName, container, localPawn, recorder) {
        container.classList.add('rooms');
        this.roomName = roomName;
        this.participants = new Set();
        this.audioDataBuffers = {};
        this.localPawn = localPawn;
        this.recorder = recorder;
        this.roomDiv = this._makeRoom();
        container.appendChild(this.roomDiv);

        this.seatsDiv.addEventListener('click', this.addToRoom.bind(this, localPawn));
        this.micSeatDiv.addEventListener('click', this.addToMic.bind(this, localPawn));
    }

    _makeRoom() {
        const roomDiv = document.createElement('div');
        roomDiv.classList.add('room');
        roomDiv.appendChild(this._makeRoomName());
        roomDiv.appendChild(this._makeSeatArea());
        return roomDiv;
    }

    _makeRoomName() {
        const roomNameDiv = document.createElement('div');
        roomNameDiv.classList.add('room-name');
        roomNameDiv.innerText = this.roomName;
        return roomNameDiv
    }

    _makeSeatArea() {
        const seatAreaDiv = document.createElement('div');
        seatAreaDiv.classList.add('seat-area');

        seatAreaDiv.appendChild(this._makeRecordingArea());
        seatAreaDiv.appendChild(this._makeVisitorArea());
        return seatAreaDiv;
    }

    _makeVisitorArea() {
        const visitorArea = document.createElement('div');
        visitorArea.classList.add('visitor-area');
        for (let i = 0; i < 4; ++i) {
            const seat = this._makeSeat();
            visitorArea.appendChild(seat);
            this.seatsDiv = seat;
        }
        return visitorArea;
    }

    _makeRecordingArea() {
        const recordingAreaDiv = document.createElement('div');
        recordingAreaDiv.classList.add('recording-area');
        const recButton = document.createElement('button');
        recButton.innerText = 'rec';
        recButton.classList.add('rec');
        recordingAreaDiv.appendChild(recButton);
        const playButton = document.createElement('button');
        playButton.innerText = 'play';
        playButton.classList.add('play');
        recordingAreaDiv.appendChild(playButton);
        this.micSeatDiv = this._makeSeat();
        recordingAreaDiv.appendChild(this.micSeatDiv);
        return recordingAreaDiv;
    }

    _makeSeat() {
        const seatDiv = document.createElement('div');
        seatDiv.classList.add('seat');
        return seatDiv;
    }

    addToRoom(pawn) {
        this.seatsDiv.appendChild(pawn.element);
        this.recorder.disableRecording();
        
    }
    addToMic(pawn) {
        this.micSeatDiv.appendChild(pawn.element);
        this.recorder.enableRecording();
    }
}

