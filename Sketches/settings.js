function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");
}
function draw() {
    background(35);

    drawHeader();
    drawHomeButton();
}
function drawHeader() {

    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(34);
    text("Settings", width/2,45);
}
function drawHomeButton(){

    fill(55);
    stroke(255,140,0);
    strokeWeight(2);

    rect(20,20,120,45,10);

    noStroke();
    fill(255);

    textAlign(CENTER,CENTER);
    textSize(18);

    text("← Home",80,42);
}

function mousePressed(){

    if(mouseX >= 20 &&
       mouseX <= 140 &&
       mouseY >= 20 &&
       mouseY <= 65){

        window.location.href = "../ui.html";
    }

}