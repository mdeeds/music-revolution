class Collaboration {
    constructor(name, myColor, colors) {
        this.name = name;
        this.myColor = myColor;
        this.colors = colors;
    }

    initLayout() {
        document.body.innerHTML = `<div class='music'>=&=4=A=B=C=D=E=F=G=H!=I=J=K=L=M=N=P=!</div>`;
        const appContainer = document.createElement('div');
        appContainer.id = 'app-container';
        document.body.appendChild(appContainer);
        
        // Chat Area
        const chatArea = document.createElement('div');
        chatArea.id = 'chat-area';
        chatArea.classList.add('area');
        appContainer.appendChild(chatArea);
        
        // Work Areas
        const workAreasContainer = document.createElement('div');
        workAreasContainer.id = 'work-areas';
        appContainer.appendChild(workAreasContainer);
        
        // Create work areas for each color
        for (const color of this.colors) {
            const workArea = document.createElement('div');
            workArea.id = `work-area-${color}`;
            workArea.classList.add('area', `color-${color}`);
            workAreasContainer.appendChild(workArea);
        }
    }
    
    createPawn(name, color) {
        const pawn = document.createElement('span');
        pawn.textContent = name;
        // pawn.classList.add('pawn', `color-${color}`);
        pawn.style.color = color;
        
        // Drag and Drop functionality
        pawn.draggable = true;
        pawn.id = `Pawn${Math.random()}`;
        pawn.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', pawn.id); // Set data for drag and drop
        });

        return pawn;
    }
    
    setupAreaListeners() {
        const areas = document.querySelectorAll('.area');
        areas.forEach(area => {
            area.addEventListener('dragover', (event) => {
                event.preventDefault(); // Necessary to allow dropping
            });
            
            area.addEventListener('drop', (event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData('text/plain');
                const pawn = document.getElementById(id);
                
                // Move the pawn visually
                area.appendChild(pawn); 
                
                // Handle logic based on the area
                const areaId = area.id;
                if (areaId === 'chat-area') {
                    this.handlePawnInChat(name);
                } else if (areaId.startsWith('work-area-')) {
                    const color = areaId.split('-')[2];
                    this.handlePawnInWorkArea(name, color);
                }
            });
        });
    }
    
    start() {
        this.initLayout();
        const myPawn = this.createPawn(this.name, this.myColor);
        // Initially place the pawn in the chat area
        document.getElementById('chat-area').appendChild(myPawn); 
        this.setupAreaListeners(); 
    }
}
