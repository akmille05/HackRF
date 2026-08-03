let observationIndex = 0;
let observationNames = ["Current Observation"];

function setup() {

    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");
}

function draw() {

    background(35);

    drawHeader();
    drawSpectrumViewer();
    drawHomeButton();
}

function windowResized() {

    resizeCanvas(windowWidth, windowHeight);
}

function drawHeader() {

    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(34);
    text("Radio Astronomy Dashboard", width/2,45);
}

function drawSpectrumViewer(){

    let x = 40;
    let y = 120;

    let w = width * 0.42;
    let h = height * 0.48;

    stroke(255,140,0);
    strokeWeight(3);

    fill(55);
    rect(x,y,w,h,15);

    noStroke();
    fill(255);

    textAlign(CENTER,CENTER);
    textSize(24);

    text(
        "Hydrogen Spectrum",
        x+w/2,
        y+25
    );

    let graphX = x + 60;
    let graphY = y + 55;

    let graphW = w - 90;
    let graphH = h - 110;


    stroke(70);
    strokeWeight(1);

    // Horizontal lines

    for(let i=0;i<=5;i++){

        let yy = graphY + i*graphH/5;

        line(
            graphX,
            yy,
            graphX+graphW,
            yy
        );
    }

    // Vertical lines

    for(let i=0;i<=10;i++){

        let xx = graphX + i*graphW/10;

        line(
            xx,
            graphY,
            xx,
            graphY+graphH
        );
    }

    stroke(255);
    strokeWeight(2);

    // Y axis

    line(
        graphX,
        graphY,
        graphX,
        graphY+graphH
    );

    // X axis

    line(
        graphX,
        graphY+graphH,
        graphX+graphW,
        graphY+graphH
    );

    noStroke();
    fill(255);

    textAlign(CENTER,CENTER);
    textSize(16);

    text(
        "Frequency (MHz)",
        graphX+graphW/2,
        graphY+graphH+28
    );

    push();

    translate(
        graphX-38,
        graphY+graphH/2
    );

    rotate(-HALF_PI);

    text(
        "Magnitude (dB)",
        0,
        0
    );

    pop();

    fill(180);

    textSize(12);

    textAlign(RIGHT,CENTER);

    text("0",graphX-8,graphY);
    text("-20",graphX-8,graphY+graphH*0.25);
    text("-40",graphX-8,graphY+graphH*0.50);
    text("-60",graphX-8,graphY+graphH*0.75);
    text("-80",graphX-8,graphY+graphH);

    textAlign(CENTER,TOP);

    text(
        "1420.2",
        graphX,
        graphY+graphH+6
    );

    text(
        "1420.4",
        graphX+graphW/2,
        graphY+graphH+6
    );

    text(
        "1420.6",
        graphX+graphW,
        graphY+graphH+6
    );

    stroke(255,140,0);
    strokeWeight(2);
    noFill();

    beginShape();

    for(let i=0;i<=graphW;i+=2){

        let xx = graphX+i;

        // Small noise floor
        let yy =
            graphY+
            graphH*0.72+
            random(-2,2);

        // Hydrogen line peak
        let center = graphW*0.55;

        yy -=
            70 *
            exp(
                -sq(i-center)/
                (2*35*35)
            );

        vertex(xx,yy);
    }

    endShape();

    drawArrowButton(
        x+18,
        y+h-35,
        "left"
    );

    drawArrowButton(
        x+w-18,
        y+h-35,
        "right"
    );

    fill(255);

    textSize(18);

    textAlign(CENTER,CENTER);

    text(
        observationNames[observationIndex],
        x+w/2,
        y+h-35
    );
}

function drawArrowButton(x,y,direction){

    let hovering;

    if(direction==="left"){

        hovering=
            mouseX>=x &&
            mouseX<=x+22 &&
            mouseY>=y-15 &&
            mouseY<=y+15;
    }

    else{

        hovering=
            mouseX>=x-22 &&
            mouseX<=x &&
            mouseY>=y-15 &&
            mouseY<=y+15;
    }

    noStroke();

    if(hovering){

        fill(255,140,0);

    }

    else{

        fill(120);

    }

    if(direction==="left"){

        triangle(
            x,y,
            x+20,y-15,
            x+20,y+15
        );

    }

    else{

        triangle(
            x,y,
            x-20,y-15,
            x-20,y+15
        );

    }

}

function drawHomeButton(){

    fill(55);

    stroke(255,140,0);
    strokeWeight(2);

    rect(
        20,
        20,
        120,
        45,
        10
    );

    noStroke();

    fill(255);

    textAlign(CENTER,CENTER);

    textSize(18);

    text(
        "← Home",
        80,
        42
    );

}

function mousePressed(){

    if(
        mouseX>=20 &&
        mouseX<=140 &&
        mouseY>=20 &&
        mouseY<=65
    ){

        window.location.href="../ui.html";

    }

}

