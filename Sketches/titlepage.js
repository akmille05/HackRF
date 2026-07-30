

let projects = [];

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
}

function draw() {

    background(35);

    noStroke();
    fill(255,140,0);
    rect(width/2,60,width,120);

    fill(255);
    textSize(42);
    text("HackRF Capability Dashboard", width/2,60);

    for(let p of projects){
        p.show();
    }

    drawSettings();
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

        stroke(255,140,0);
        strokeWeight(3);

        if(this.hovered()){
            fill(80);
        }else{
            fill(55);
        }

        rect(this.x,this.y,this.w,this.h,20);

        noStroke();
        fill(255,140,0);
        textSize(24);
        text(this.label,this.x,this.y);
    }
}

function drawSettings(){

    let x = width/2;
    let y = height/2 + 210;
    let w = 220;
    let h = 60;

    stroke(255,140,0);
    strokeWeight(3);

    if(mouseX>x-w/2 &&
       mouseX<x+w/2 &&
       mouseY>y-h/2 &&
       mouseY<y+h/2){
        fill(80);
    }
    else{
        fill(55);
    }

    rect(x,y,w,h,15);

    noStroke();
    fill(255);
    textSize(22);
    text("Settings",x,y);
}

function mousePressed(){

    if(projects[0].hovered()){
        window.location.href = "Sketches/basic.html";

    }

    if(projects[1].hovered()){
        console.log("TPMS selected");
        window.location.href = "Sketches/automotive_tpms.html";
    }

    if(projects[2].hovered()){
        console.log("Radio Astronomy selected");
    }
}

function windowResized(){
    resizeCanvas(windowWidth,windowHeight);
}