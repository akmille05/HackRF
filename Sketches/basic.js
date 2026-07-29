let fftEnabled = false;
let filterEnabled = false;
let amplifyEnabled = false;

let frequency = "";
let duration = "";
let sampleRate = "";
let cutoff = "";

let spectrumIndex = 0;
let spectrumNames = ["Original"];

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
    drawDemodulator();
    drawSettingsPanel();
    drawHomeButton();
}

function drawHeader() {

    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(34);
    text("Basic HackRF Dashboard", width/2,45);
}

function drawSpectrumViewer(){

    let x = 40;
    let y = 120;
    let w = width*0.42;
    let h = height*0.48;

    stroke(255,140,0);
    strokeWeight(3);
    fill(55);
    rect(x,y,w,h,15);

    fill(255);
    noStroke();
    textSize(24);
    text("Spectrum Viewer",x+w/2,y+25);

    //---------------------------------------
    // Placeholder spectrum
    //---------------------------------------

    stroke(255,140,0);
    noFill();

    beginShape();

    for(let i=0;i<w-40;i+=5){

        let yy = y+h/2 + sin(i*0.04)*40 + random(-8,8);

        vertex(x+20+i,yy);
    }

    endShape();

    //---------------------------------------
    // Left Arrow
    //---------------------------------------

    fill(255,140,0);
    noStroke();

    triangle(
        x+15,y+h-35,
        x+35,y+h-50,
        x+35,y+h-20
    );

    //---------------------------------------
    // Right Arrow
    //---------------------------------------

    triangle(
        x+w-15,y+h-35,
        x+w-35,y+h-50,
        x+w-35,y+h-20
    );

    fill(255);
    textSize(18);
    text(
        spectrumNames[spectrumIndex],
        x+w/2,
        y+h-35
    );
}

function drawDemodulator(){

    let x = 40;
    let y = height*0.64;
    let w = width*0.42;
    let h = height*0.22;

    stroke(255,140,0);
    strokeWeight(3);

    fill(55);
    rect(x,y,w,h,15);

    noStroke();
    fill(255);
    textSize(24);
    text("Demodulator",x+w/2,y+25);

    textSize(20);

    text("○ FM",x+100,y+80);
    text("○ AM",x+100,y+120);
}

function drawSettingsPanel(){

    let x = width*0.50;
    let y = 120;
    let w = width*0.46;
    let h = height*0.74;

    stroke(255,140,0);
    strokeWeight(3);

    fill(55);
    rect(x,y,w,h,15);

    noStroke();

    fill(255);
    textSize(30);
    text("Settings",x+w/2,y+30);

    textAlign(LEFT,CENTER);

    let left = x+40;
    let inputX = x+230;

    fill(255);

    textSize(18);

    //------------------------------------
    // Frequency
    //------------------------------------

    text("Frequency (Hz)",left,y+90);

    drawInput(inputX,y+75,220,35,frequency);

    //------------------------------------
    // Duration
    //------------------------------------

    text("Duration",left,y+150);

    drawInput(inputX,y+135,220,35,duration);

    //------------------------------------
    // FFT
    //------------------------------------

    drawCheckbox(left,y+210,fftEnabled);

    text("Apply FFT",left+40,y+220);

    if(fftEnabled){

        text("Sample Rate",left,y+280);

        drawInput(inputX,y+265,220,35,sampleRate);

    }

    //------------------------------------
    // Amplify
    //------------------------------------

    drawCheckbox(left,y+340,amplifyEnabled);

    text("Amplify (+5 MHz)",left+40,y+350);

    //------------------------------------
    // Filter
    //------------------------------------

    drawCheckbox(left,y+410,filterEnabled);

    text("Apply Filter",left+40,y+420);

    if(filterEnabled){

        text("Cutoff",left,y+490);

        drawInput(inputX,y+475,220,35,cutoff);

    }

    //------------------------------------
    // Run Button
    //------------------------------------

    fill(255,140,0);

    rect(x+40,h+y-90,180,50,10);

    fill(255);

    textAlign(CENTER,CENTER);

    textSize(20);

    text("Run Capture",x+130,h+y-65);
}

function drawInput(x,y,w,h,value){

    stroke(255,140,0);
    strokeWeight(2);

    fill(35);

    rect(x,y,w,h,8);

    noStroke();

    fill(200);

    textAlign(LEFT,CENTER);

    text(value,x+10,y+h/2);
}

function drawCheckbox(x,y,checked){

    stroke(255,140,0);
    strokeWeight(2);

    fill(35);

    rect(x,y,22,22);

    if(checked){

        stroke(255,140,0);

        line(x+4,y+11,x+9,y+18);

        line(x+9,y+18,x+18,y+4);

    }
}

function windowResized(){

    resizeCanvas(windowWidth,windowHeight);

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
