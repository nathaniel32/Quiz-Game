"use strict";

//let p, v, m;
document.addEventListener('DOMContentLoaded', async function () {
    let m = new Model();
    let p = new Presenter();
    let v = new View(p);
    await m.setDataIntern();
    p.setModelAndView(m, v);
    v.setHandler(true);
    p.setMenu();
});

// ############# Model ###########################################################################
class Model {
    constructor() {
        this.jsonDataIntern = null; //Data von .json
        this.jsonDataExtern = null; //Data von dem extra Server
        this.jsonDataExternHTW = null; //Data von HTW-Server
    }

    async setDataIntern(){ //um Daten von .json zu erhalten
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "assets/scripts/data.json", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var data = JSON.parse(xhr.responseText);
                        this.jsonDataIntern = data;
                        resolve(data);
                    } else {
                        reject(new Error('Failed to fetch data'));
                    }
                }
            }.bind(this);
            xhr.send();
        });
    }

    async setDataExtern(ip, port){ //extra Server
        const id = this.randomInt(1, 11);
        return await fetch(
            `http://${ip}:${port}/data?id=` + id
        )
        .then(response => {
            if (!response.ok) {
                throw new Error('Error');
            }
            return response.json();
        })
        .then(data => {
            this.jsonDataExtern = data;
            return true;
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
    }

    getDataIntern() {
        return this.jsonDataIntern;
    }
    getDataExtern(){
        return this.jsonDataExtern;
    }
    
    randomInt(min, max){ //random int
        const bucketSize = max;
        const bucketIndex = Math.floor(Math.random() * bucketSize);
        return bucketIndex + min;
    }

    async setDataExternHTW(){ //Datei aufrufen

        const id = this.randomInt(0, 124);

        const url = "https://idefix.informatik.htw-dresden.de:8888/api/quizzes/?page=" + id;

        return await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("test@gmail.com:secret"),
            },
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        })
        .then(results => {
            this.jsonDataExternHTW = results;
            return true;
        })
        .catch((error) => {
            console.error('Error:', error);
            return false;
        })
    }
    
    getDataExternHTW(){
        return this.jsonDataExternHTW;
    }

    async checkAnswerExternHTW(id, index){
        const url = "https://idefix.informatik.htw-dresden.de:8888/api/quizzes/" + id + "/solve";
        let answer = [];
        answer.push(index);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + btoa("test@gmail.com:secret")
            },
            body: JSON.stringify(answer)
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        })
        .then(results => {
            View.setMessage(results.feedback);
            if(results.success){
                return 1;
            }else{
                return null;
            }
        })
        .catch((error) => {
            View.setMessage("Error: " + error);
            console.error('Error:', error);
            return null;
        });

        return res;
    }
}

// ############ Controller ########################################################################
class Presenter {
    static maxFehler = 5;
    constructor() {
        this.anr = 0; //die aktuelle Array-Nummer für die Aufgaben
        this.typ = 0; //die aktuelle Array-Nummer für das Thema
        this.rPunkt = 0; //richtige Punkte
        this.fPunkt = 0; //falsche Punkte
        this.dataType = null; //data type 1 für Katex, 2 für Noten, 3 für Daten vom HTW-Server, 4 für Daten vom extra Server
        this.dataHTWID = null; //ID-Daten vom HTW-Server
        this.aufgabeTimerID = null; //id intervall
        this.remTime = 0; //verbleibende Zeit
    }

    setModelAndView(m, v) {
        this.m = m;
        this.v = v;
    }

    addSpielTime(time){
        this.remTime += time;
    }

    setSpielTimer(){
        this.addSpielTime(this.getTaskLength() * 3);
        View.setTimeDisplay(this.remTime);
        this.aufgabeTimer = setInterval(() => {
            this.remTime--;
            View.setTimeDisplay(this.remTime);
            if(this.remTime == 0){
                this.v.gameOver("Die Zeit ist abgelaufen!");
                clearInterval(this.aufgabeTimer);
            }
        }, 1000);
    }

    mixArrayNr(lang) { //um Tasten zu mischen 
        let index = [];

        for (let i = 0; i < lang; i++) {
            index.push(i);
        }
      
        //Fisher-Yates
        for (let i = index.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          let temp = index[i];
          index[i] = index[j];
          index[j] = temp;
        }

        return index;
    }

    getDataController(){
        if(this.dataType == 4){
            return this.m.getDataExtern();
        }else if(this.dataType == 3){
            return this.m.getDataExternHTW();
        }else{
            return this.m.getDataIntern()[this.typ];
        }
    }

    setTaskTyp(typ){ //Dateien, die ausgewählte Menu, wird auf dem Server aufgerufen
        this.typ = typ;
        this.resetData();
        this.dataType = this.m.getDataIntern()[this.typ].type;
    }

    async fetchJSONData(ip, port){
        View.setMessage("Loading...");
        if(this.dataType == 3){
            return await this.m.setDataExternHTW();
        }else if(this.dataType == 4){
            return await this.m.setDataExtern(ip, port);
        }else{
            return true;
        }
    }

    resetData(){
        this.anr = 0;
        this.rPunkt = 0;
        this.fPunkt = 0;
        this.remTime = 0;
        clearInterval(this.aufgabeTimer);
    }

    setMenu(){
        let frag = this.m.getDataIntern();
        frag.forEach((data, index) => {
            this.v.displayMenu(data.name, index); 
        });
    }

    getCurrentMenuName(){
        return this.m.getDataIntern()[this.typ].name;
    }

    getCurrentAufgabeName(){
        if(this.dataType != 3){
            return this.getDataController().name;
        }else{
            return null;
        }
    }

    // Holt eine neue Frage aus dem Model und setzt die View
    setTask() {
        if(this.dataType == 3){
            let frag = this.getDataController().content[this.anr];

            if(frag && this.fPunkt < this.getTaskLength()){
                this.dataHTWID = frag.id;
                View.setAufgabeTitle(frag.title);
                this.v.renderText(frag.text, null);
                const mixArray = this.mixArrayNr(4);
                mixArray.forEach((data,index)=>{
                    let wert = frag.options[data];
                    this.v.inscribeButtons(data, index, wert, null);
                });
                return 1;
            }else{
                return null;
            }
        }else{
            let frag = this.getDataController().data[this.anr];
            if(frag && this.fPunkt < this.getTaskLength()){ //Presenter.maxFehler
                this.v.renderText(frag.a, this.getDataController().type);
                const mixArray = this.mixArrayNr(4);
                mixArray.forEach((data,index)=>{
                    let wert = frag.l[data];
                    this.v.inscribeButtons(data, index, wert, this.getDataController().type);
                });
                return 1;
            }else{
                return null; //keine Aufgabe mehr
            }
        }
    }

    getTaskLength(){
        if(this.dataType == 3){
            return this.getDataController().content.length;
        }else{
            return this.getDataController().data.length;
        }
    }

    // Prüft die Antwort, aktualisiert Statistik und setzt die View
    async checkAnswer(answer) {
        if(this.dataType == 3){
            if(await this.m.checkAnswerExternHTW(this.dataHTWID, answer)){
                this.rPunkt++;
                this.anr++;
                this.addSpielTime(5);
                return 1;
            }else{
                this.fPunkt++;
                return null;
            }
        }else{
            let frag = this.getDataController().data[this.anr].r;
            if(frag == answer){ //Presenter.maxFehler
                this.rPunkt++;
                this.anr++;
                this.addSpielTime(5);
                return 1;
            }else{ //Presenter.maxFehler
                this.fPunkt++;
                return null;
            }
        }
    }

    getPunkt(typ){ //return Anzahl von richtiger Punkten / falscher Punkten
        if(typ){
            return this.rPunkt;
        }else{
            if(this.fPunkt < this.getTaskLength()){ //Presenter.maxFehler
                return this.fPunkt;
            }else{
                return this.fPunkt;
            }
        }
    }
}

// ##################### View #####################################################################
class View {
    static maingame = document.getElementById("main_game");
    static textmessage = document.getElementById("text_message");

    constructor(p) {
        this.p = p;  // Presenter
        this.AufgabeContainer = null;
        this.answer = null;
        this.rPunkt = null;
        this.fPunkt = null;
    }

    setHandler(fetchResult) { //home anzuzeigen
        // use capture false -> bubbling (von unten nach oben aufsteigend)
        // this soll auf Objekt zeigen -> bind (this)
        
        if(fetchResult){
            View.setMessage(null);
            View.maingame.textContent = null;
            
            const current_menu_name = this.p.getCurrentMenuName();
    
            const start_btn_container = document.createElement("div");
            start_btn_container.classList.add("playBtn_container")
    
            const start_btn = document.createElement("button");
            start_btn.classList.add("playBtn");
            start_btn.textContent = `${current_menu_name} starten`;
    
            start_btn_container.append(start_btn);
            View.maingame.append(start_btn_container);
    
            start_btn.addEventListener("click", this.startGame.bind(this), false);
        }else{
            View.setMessage("Failed to fetch!");
        }
    }

    startGame(){ //ein Spiel zu starten
        const html = `
            
            <div class="punkt_bar_container">
                <div class="punkt_bar"><div id="rPunkt">0/${this.p.getTaskLength()}</div></div>
                <div class="punkt_bar"><div id="fPunkt">0/${this.p.getTaskLength()}</div></div>
            </div>

            <div id="aufgabe_control">
                <div>
                    <div class="aufgabe_header">
                        <div>
                            <h3 class="aufgabe_h3"><span id="aufgabe_title"></span> <span>Aufgabe</span></h3>
                        </div>
                        <div class="timer_container">
                            <span>Zeit:</span>
                            <span id="gameTimer"></span>
                        </div>
                    </div>
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

        View.maingame.innerHTML = html;

        this.AufgabeContainer = document.getElementById("boo");
        this.answer = document.getElementById("answer");
        this.rPunkt = document.getElementById("rPunkt");
        this.fPunkt = document.getElementById("fPunkt");

        View.setAufgabeTitle(this.p.getCurrentAufgabeName());

        const answerButtons = [...answer.getElementsByTagName("button")]; //HTMLCollection in Array wechseln
        
        answerButtons.forEach(data => {
            data.onclick = ()=>this.checkEvent(data); //lisener für alle Tasten
        });

        this.callTask();
        this.p.setSpielTimer();
    }

    callTask() { //nächste Aufgabe aufrufen
        if(!this.p.setTask()){ //wenn es kein mehr Augabe übrig gibt
            this.gameOver("Gewonnen!");
        }else{
            View.setMessage("Wähle die passende Antwort!");
        }
    }

    inscribeButtons(dataNr, i, text, type) { //Um Text auf die Schaltfläche zu schreiben
        const thisButton = document.querySelectorAll("#answer > *")[i];
        if(type == 1){ //type 1 (json data) für katex
            katex.render(text, thisButton);
        }else{
            thisButton.textContent = text;
        }
        thisButton.setAttribute("number", dataNr);
    }

    displayMenu(data, index) { //um das Menu anzuzeigen
        const navmenu = document.getElementById("navmenu");
        const menuBtn = document.createElement("button");
        menuBtn.textContent = data;
        navmenu.append(menuBtn);

        menuBtn.onclick = async () => { //wenn das Thema ausgewählt wird
            View.maingame.textContent = null;
            View.setMessage(null);
            this.p.setTaskTyp(index);
            if(this.p.dataType == 4){
                this.displayInputIP();
            }else{
                this.setHandler(await this.p.fetchJSONData(null, null));
            }
        }
    }

    displayInputIP(){ //form anzeigen
        View.setMessage("Geben Sie die Serveradresse ein");

        const server_address_form_container = document.createElement("div");
        server_address_form_container.classList.add("server_address_form_container");

        const server_address_title = document.createElement("h3");
        server_address_title.classList.add("server_address_title");
        server_address_title.textContent = this.p.getCurrentMenuName();

        const server_address_form = document.createElement("form");
        server_address_form.classList.add("server_address_form");

        const input_ip = document.createElement("input");
        input_ip.classList.add("input_ip");
        input_ip.type = "text";
        input_ip.placeholder = "IP";
        
        const input_port = document.createElement("input");
        input_port.classList.add("input_port");
        input_port.type = "number";
        input_port.placeholder = "Port";

        const ip_submit_btn = document.createElement("button");
        ip_submit_btn.classList.add("ip_submit_btn");
        ip_submit_btn.textContent = "Input";

        const serverData = JSON.parse(localStorage.getItem('serverData'));
        if (serverData) {
            input_ip.value = serverData.ip;
            input_port.value = serverData.port;
        }

        server_address_form.append(input_ip);
        server_address_form.append(input_port);
        server_address_form.append(ip_submit_btn);
        server_address_form_container.append(server_address_title);
        server_address_form_container.append(server_address_form);
        View.maingame.append(server_address_form_container);

        server_address_form.onsubmit = async (e) => {
            e.preventDefault();
            const ip = input_ip.value.trim();
            const port = input_port.value.trim();
            if(ip && port){
                const serverData = {
                    ip: ip,
                    port: port
                };
                localStorage.setItem('serverData', JSON.stringify(serverData));
                
                this.setHandler(await this.p.fetchJSONData(ip, port));
            }else{
                View.setMessage("IP und Port dürfen nicht leer sein");
            }
        };
    }

    async checkEvent(data) {
        if(await this.p.checkAnswer(Number(data.getAttribute("number")))){ //check die Antwort. wenn die Antwort richtig ist
            this.callTask();
            const richtigPunkt = this.p.getPunkt(true); //Anzahl der richtigen Punkte
            this.rPunkt.textContent = richtigPunkt;
            const rImProzent = richtigPunkt / this.p.getTaskLength() * 100
            this.rPunkt.style.width = `${rImProzent}%`;
        }else{
            const fehlerPunkt = this.p.getPunkt(false); //Anzahl der falschen Punkte
            const limit = this.p.getTaskLength();

            this.fPunkt.textContent = fehlerPunkt;
            const fImProzent = fehlerPunkt / limit * 100;
            this.fPunkt.style.width = `${fImProzent}%`

            if(limit == fehlerPunkt){ //wenn fehler == fehler limit
                this.gameOver("Game Over!");
            }
        }
    }

    gameOver(text){
        this.clearAufgabe();
        View.setMessage(text);
    }

    clearAufgabe(){
        const aufgabe_control = document.getElementById("aufgabe_control");
        this.clearText(aufgabe_control);
        const endPunkt = document.createElement("p");
        endPunkt.classList.add("endPunkt");
        endPunkt.textContent = "Punkt: " + this.p.getPunkt(true);
        const playagain_btn_container = document.createElement("div");
        playagain_btn_container.classList.add("playBtn_container")
        const playAgain = document.createElement("button");
        playAgain.classList.add("playBtn");
        playAgain.textContent = "nochmal abspielen";
        playAgain.onclick = () => {
            this.p.resetData();
            //this.setHandler();
            this.startGame();
        }
        document.getElementById("aufgabe_control").append(endPunkt); //Endpunkte anzuzeigen
        playagain_btn_container.append(playAgain);
        document.getElementById("aufgabe_control").append(playagain_btn_container); //Play again button anzuzeigen
    }

    clearText(item){
        item.textContent = null;
    }

    drawChord(chord, container) { //Noten zu erstellen
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
        if(type == 1){ //type = 1 für Mathe
            let p = document.createElement("p");
            katex.render(text, p);
            this.AufgabeContainer.appendChild(p);
        }else if(type == 2){ //type = 2 für Noten
            this.drawChord(text, this.AufgabeContainer);
        }else{ //normale Textfrage
            let p = document.createElement("p");
            p.innerHTML = text;
            this.AufgabeContainer.appendChild(p);
        }
    }

    static setMessage(text){
        View.textmessage.textContent = text;
    }

    static setAufgabeTitle(text){
        const aufgabeTitle = document.getElementById("aufgabe_title");
        aufgabeTitle.textContent = text;
    }

    static setTimeDisplay(time){
        const gameTimer = document.getElementById("gameTimer");

        if(gameTimer){
            gameTimer.textContent = String(time).padStart(2, '0');

            if(time <= 5){
                gameTimer.style.color = "red";
            }else{
                gameTimer.style.color = null;
            }
        }
    }
}