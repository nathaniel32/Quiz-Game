"use strict";

//let p, v, m;
document.addEventListener('DOMContentLoaded', async function () {
    let m = new Model();
    let p = new Presenter();
    let v = new View(p);
    await m.setData();
    p.setModelAndView(m, v);
    v.setHandler();
    p.setMenu();
});

// ############# Model ###########################################################################
class Model {
    constructor() {
        this.jsonData = null;
    }

    async setData(){
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/it/assets/scripts/data.json", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var data = JSON.parse(xhr.responseText);
                        this.jsonData = data;
                        resolve(data);
                    } else {
                        reject(new Error('Failed to fetch data'));
                    }
                }
            }.bind(this);
            xhr.send();
        });
    }

    getMenu() {
        //console.log(this.jsonData)
        return this.jsonData
    }
    // Holt eine Frage aus dem Array, zufällig ausgewählt oder vom Server
    getTask(typ) {
        return this.jsonData[typ];// Aufgabe + Lösungen
    }
    checkAnswer(nr, typ) {
        // TODO
        return this.jsonData[typ].data[nr].r;
    }
}

// ############ Controller ########################################################################
class Presenter {
    static maxFehler = 5;
    constructor() {
        this.anr = 0;
        this.typ = 0;
        this.rPunkt = 0;
        this.fPunkt = 0;
    }

    setModelAndView(m, v) {
        this.m = m;
        this.v = v;
    }

    mixArrayNr(lang) {
        let index = [];
      
        // Inisialisasi array indeks
        for (let i = 0; i < lang; i++) {
            index.push(i);
        }
      
        // Lakukan pengacakan dengan metode Fisher-Yates
        for (let i = index.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          let temp = index[i];
          index[i] = index[j];
          index[j] = temp;
        }

        return index;
    }

    setTaskTyp(typ){ //tidak menggunakan static karena static tidak bisa mengeset
        this.typ = typ;
        this.resetData();
    }

    resetData(){
        this.anr = 0;
        this.rPunkt = 0;
        this.fPunkt = 0;
    }

    setMenu(){
        let frag = this.m.getMenu();
        frag.forEach((data, index) => {
            //console.log(data)
            this.v.displayMenu(data.name, index); 
        });
    }

    getCurrentMenuName(){
        return this.m.getMenu()[this.typ].name;
    }

    // Holt eine neue Frage aus dem Model und setzt die View
    setTask() {
        let frag = this.m.getTask(this.typ).data[this.anr];
        if(frag && this.fPunkt < Presenter.maxFehler){
            this.v.renderText(frag.a, this.m.getTask(this.typ).type);
            const mixArray = this.mixArrayNr(4);
            mixArray.forEach((data,index)=>{
                let wert = frag.l[data];
                this.v.inscribeButtons(data, index, wert, this.m.getTask(this.typ).type);
            });
            return 1;
        }else{
            return null;
        }
    }

    getTaskLength(){
        return this.m.getMenu()[this.typ].data.length;
    }

    // Prüft die Antwort, aktualisiert Statistik und setzt die View
    checkAnswer(answer) {
        let frag = this.m.checkAnswer(this.anr, this.typ);
        if(frag == answer && this.fPunkt < Presenter.maxFehler){
            this.rPunkt++;
            this.anr++;
            return 1;
        }else if(this.fPunkt < Presenter.maxFehler){
            this.fPunkt++;
            return null;
        }
    }

    getPunkt(typ){
        if(typ){
            return this.rPunkt;
        }else{
            if(this.fPunkt < Presenter.maxFehler){
                return this.fPunkt;
            }else{
                //console.log("reset")
                return this.fPunkt;
            }
        }
    }
}

// ##################### View #####################################################################
class View {
    static main_game = document.getElementById("main_game");
    static text_message = document.getElementById("text_message");

    constructor(p) {
        this.p = p;  // Presenter
        this.AufgabeContainer = null;
        this.answer = null;
        this.rPunkt = null;
        this.fPunkt = null;
        //this.setHandler();
    }

    setHandler() {
        // use capture false -> bubbling (von unten nach oben aufsteigend)
        // this soll auf Objekt zeigen -> bind (this)

        main_game.textContent = null;
        text_message.textContent = null;
        
        const current_menu_name = this.p.getCurrentMenuName();

        const start_btn = document.createElement("button");
        start_btn.classList.add("playBtn");
        start_btn.textContent = `Start ${current_menu_name}`;

        main_game.append(start_btn);

        start_btn.addEventListener("click", this.startGame.bind(this), false);
    }

    startGame(){
        text_message.textContent = "Wähle die passende Antwort!";

        const html = `
            
            <div class="punkt_bar_container">
                <div class="punkt_bar"><div id="rPunkt">0/${this.p.getTaskLength()}</div></div>
                <div class="punkt_bar"><div id="fPunkt">0/${Presenter.maxFehler}</div></div>
            </div>

            <div id="aufgabe_control">
                <div>
                    <h3>Aufgabe</h3>
                    <div id="boo"></div>
                </div>

                <div id="answer">
                    <button>A</button>
                    <button>B</button>
                    <button>C</button>
                    <button>D</button>
                </div>
            </div>
        `;

        main_game.innerHTML = html;

        this.AufgabeContainer = document.getElementById("boo");
        this.answer = document.getElementById("answer");
        this.rPunkt = document.getElementById("rPunkt");
        this.fPunkt = document.getElementById("fPunkt");
        //this.answer.addEventListener("click", this.checkEvent.bind(this), false);

        const answerButtons = [...answer.getElementsByTagName("button")]; //vorher war HTMLCollection nicht array
        
        answerButtons.forEach((data,index) => {
            //data.setAttribute("number", index);
            data.onclick = ()=>this.checkEvent(data);
        });

        this.callTask();
    }

    callTask() {
        if(!this.p.setTask()){
            this.clearAufgabe();
            text_message.textContent = "Gewonnen!";
        }
    }

    inscribeButtons(dataNr, i, text, type) {
        if(type == 1){
            katex.render(text, document.querySelectorAll("#answer > *")[i]);
        }else{
            document.querySelectorAll("#answer > *")[i].textContent = text;
        }
        document.querySelectorAll("#answer > *")[i].setAttribute("number", dataNr);
    }

    displayMenu(data, index) {
        const navmenu = document.getElementById("navmenu");
        const menuBtn = document.createElement("button");
        menuBtn.textContent = data;
        navmenu.append(menuBtn);

        menuBtn.onclick = () => {
            this.p.setTaskTyp(index);
            this.setHandler();
        }
    }

    checkEvent(data) {
        if(this.p.checkAnswer(Number(data.getAttribute("number")))){
            this.callTask();
            const richtigPunkt = this.p.getPunkt(true);
            this.rPunkt.textContent = richtigPunkt;
            const rImProzent = richtigPunkt / this.p.getTaskLength() * 100
            this.rPunkt.style.width = `${rImProzent}%`;
        }else{
            const fehlerPunkt = this.p.getPunkt(false);
            const limit = Presenter.maxFehler;

            this.fPunkt.textContent = fehlerPunkt;
            const fImProzent = fehlerPunkt / limit * 100;
            this.fPunkt.style.width = `${fImProzent}%`

            if(limit == fehlerPunkt){
                this.clearAufgabe();
                text_message.textContent = "Game Over!";
            }
        }
    }

    clearAufgabe(){
        const aufgabe_control = document.getElementById("aufgabe_control");
        this.clearText(aufgabe_control);
        const endPunkt = document.createElement("p");
        endPunkt.classList.add("endPunkt")
        endPunkt.textContent = "Punkt: " + this.p.getPunkt(true);
        const playAgain = document.createElement("button");
        playAgain.classList.add("playBtn")
        playAgain.textContent = "nochmal abspielen";
        playAgain.onclick = () => {
            this.p.resetData();
            this.setHandler();
        }
        document.getElementById("aufgabe_control").append(endPunkt);
        document.getElementById("aufgabe_control").append(playAgain);
    }

    clearText(item){
        item.textContent = null;
    }

    drawChord(chord, container) {
        var renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
        renderer.resize(400, 200);
        var context = renderer.getContext();
        var stave = new Vex.Flow.Stave(10, 40, 300);
        stave.addClef("treble").addKeySignature("C");
        stave.setContext(context).draw();
        var notes = chord.map(note => {
          return new Vex.Flow.StaveNote({clef: "treble", keys: [note], duration: "q"});
        });
        Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
    }

    renderText(text, type) {
        this.clearText(this.AufgabeContainer);
        if(type == 1){
            let p = document.createElement("p");
            katex.render(text, p);
            this.AufgabeContainer.appendChild(p);
        }else if(type == 2){
            this.drawChord(text, this.AufgabeContainer);
        }else{
            let p = document.createElement("p");
            p.innerHTML = text;
            this.AufgabeContainer.appendChild(p);
        }
    }
}