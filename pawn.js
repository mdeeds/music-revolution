class Pawn {
    constructor(name) {
        this.name = name;
        this.element = document.createElement('span');
        this.element.textContent = name;
        this.element.draggable = true;
        this.element.id = `Pawn${Math.random()}`;
    }
}
