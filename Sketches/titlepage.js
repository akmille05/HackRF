

let projects = [];

function preload() {
    clickSound = loadSound(
        "Sounds/click.wav",
        () => console.log("Click sound loaded"),
        error => console.error("Click sound failed:", error)
    );
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    let w = 250;
    let h = 220;
    let spacing = 330;

    let startX = width/2 - spacing;
    let y = height/2;

    projects.push(new ProjectBox(startX, y, w, h, "Basic"));
    projects.push(new ProjectBox(width/2, y, w, h, "Automotive\nTPMS"));
    projects.push(new ProjectBox(startX + spacing*2, y, w, h, "Radio\nAstronomy"));
    projects.push(new ProjectBox(width / 2, height / 2 + 210, 220, 60, "Settings"));
}

function draw() {

    updateThemeColors();
    updateFontSizes();
    background(bgColor);

    noStroke();
    fill(255,140,0);
    rect(width/2,60,width,120);

    fill(255);
    textSize(42);
    text("HackRF Capability Dashboard", width/2,60);

    for(let p of projects){
        p.show();
    }

}

class ProjectBox{

    constructor(x,y,w,h,label){
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.label=label;
    }

    hovered(){
        return mouseX>this.x-this.w/2 &&
               mouseX<this.x+this.w/2 &&
               mouseY>this.y-this.h/2 &&
               mouseY<this.y+this.h/2;
    }

    show(){
stroke(255, 140, 0);
    strokeWeight(3);

    if (this.hovered()) {
        if (lightModeOn) {
            fill(200);
        } else {
            fill(80);
        }
    } else {
        fill(panelColor);
    }

    rect(this.x, this.y, this.w, this.h, 20);

    noStroke();

    // Keep project labels orange
    fill(255, 140, 0);

    if (this.h < 100) {
        textSize(22);
    } else {
        textSize(24);
    }

    textAlign(CENTER, CENTER);
    text(this.label, this.x, this.y);
}
}


function mousePressed(){

    if(projects[0].hovered()){
        playButtonClick();
        window.location.href = "Sketches/basic.html";

    }

    if(projects[1].hovered()){
        playButtonClick();
        console.log("TPMS selected");
        window.location.href = "Sketches/automotive_tpms.html";
    }

    if(projects[2].hovered()){
        playButtonClick();
        console.log("Radio Astronomy selected");
        window.location.href = "Sketches/radio_astronomy.html";
    }

    if(projects[3].hovered()){
        playButtonClick();
        console.log("Settings selected");
        window.location.href = "Sketches/settings.html";
    }
}

function windowResized(){
    resizeCanvas(windowWidth,windowHeight);
}