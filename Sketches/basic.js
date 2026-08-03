let fftEnabled = false;
let filterEnabled = false;
let amplifyEnabled = false;

let frequency = "";
let duration = "";
let sampleRate = "";
let cutoff = "";

let spectrumIndex = 0;
let spectrumNames = ["Original"];

let frequencyInput;
let durationInput;
let sampleRateInput;
let cutoffInput;

let selectedDemod = null;

let leftArrowHover = false;
let rightArrowHover = false;

function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    frequencyInput = createInput("");
    durationInput = createInput("");
    sampleRateInput = createInput("");
    cutoffInput = createInput("");

    // Optional placeholders
    frequencyInput.attribute("placeholder", "e.g. 100000000");
    durationInput.attribute("placeholder", "Seconds");
    sampleRateInput.attribute("placeholder", "e.g. 10000000");
    cutoffInput.attribute("placeholder", "Hz");

    // Style them to match your theme
    let inputs = [
        frequencyInput,
        durationInput,
        sampleRateInput,
        cutoffInput
    ];

    for (let input of inputs) {
        input.style("background", "#232323");
        input.style("color", "white");
        input.style("border", "2px solid orange");
        input.style("border-radius", "8px");
        input.style("padding", "6px");
        input.style("font-size", "16px");
    }
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

    drawArrowButton(
        x+15,
        y+h-35,
        "left"
    );

    drawArrowButton(
        x+w-15,
        y+h-35,
        "right"
    );

    fill(255);
    textSize(18);
    text(
        spectrumNames[spectrumIndex],
        x+w/2,
        y+h-35
    );
}

function drawArrowButton(x, y, direction) {

    let hovering;

    // Check if mouse is near arrow
    if (direction === "left") {
        hovering = 
            mouseX >= x &&
            mouseX <= x + 25 &&
            mouseY >= y - 15 &&
            mouseY <= y + 15;
    }
    else {
        hovering =
            mouseX >= x - 25 &&
            mouseX <= x &&
            mouseY >= y - 15 &&
            mouseY <= y + 15;
    }


    // Orange when hovering
    if (hovering) {
        fill(255,140,0);
    }
    else {
        fill(120);
    }


    noStroke();

    if(direction === "left") {

        triangle(
            x, y,
            x+20, y-15,
            x+20, y+15
        );

    } 
    else {

        triangle(
            x, y,
            x-20, y-15,
            x-20, y+15
        );
    }
}

function drawRadioButton(x, y, label) {

    // Is the mouse hovering over this button?
    let hovering = dist(mouseX, mouseY, x, y) < 9;

    // Outer circle
    stroke(255, 140, 0);
    strokeWeight(2);
    fill(35);
    circle(x, y, 18);

    // Fill orange if hovering OR selected
    if (hovering || selectedDemod === label) {
        noStroke();
        fill(255, 140, 0);
        circle(x, y, 10);
    }

    // Label
    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(20);
    text(label, x + 20, y);
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

    drawRadioButton(x + 60, y + 80, "FM");
    drawRadioButton(x + 60, y + 120, "AM");
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

    frequencyInput.position(inputX, y + 75);
    frequencyInput.size(220, 35);

    //------------------------------------
    // Duration
    //------------------------------------

    text("Duration",left,y+150);

    durationInput.position(inputX, y + 135);
    durationInput.size(220, 35);

    //------------------------------------
    // FFT
    //------------------------------------

    drawCheckbox(left,y+210,fftEnabled);

    text("Apply FFT",left+40,y+220);

    if (fftEnabled) {
    sampleRateInput.show();
    sampleRateInput.position(inputX, y + 265);
    sampleRateInput.size(220, 35);
    } else {
        sampleRateInput.hide();
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

    if (filterEnabled) {
    cutoffInput.show();
    cutoffInput.position(inputX, y + 475);
    cutoffInput.size(220, 35);
    } else {
        cutoffInput.hide();
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

// function drawInput(x,y,w,h,value){

//     stroke(255,140,0);
//     strokeWeight(2);

//     fill(35);

//     rect(x,y,w,h,8);

//     noStroke();

//     fill(200);

//     textAlign(LEFT,CENTER);

//     text(value,x+10,y+h/2);
// }

function drawCheckbox(x,y,checked){


    let hovering = 
        mouseX >= x &&
        mouseX <= x + 22 &&
        mouseY >= y &&
        mouseY <= y + 22;

    stroke(255,140,0);
    strokeWeight(2);

    // Fill orange if enabled OR hovering
    if (checked || hovering) {
        fill(255,140,0);
    } 
    else {
        fill(35);
    }

    rect(x,y,22,22,4);

    // Draw checkmark
    if (checked) {

        stroke(35); // dark checkmark on orange background
        strokeWeight(3);

        line(x+4,y+11,x+9,y+17);
        line(x+9,y+17,x+18,y+4);
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

    if (
        mouseX >= x + 40 &&
        mouseX <= x + 220 &&
        mouseY >= y + h - 90 &&
        mouseY <= y + h - 40
    ) {
        console.log("Frequency:", frequencyInput.value());
        console.log("Duration:", durationInput.value());
    }

    let demodX = 40;
    let demodY = height * 0.64;

    // if (dist(mouseX, mouseY, demodX + 60, demodY + 80) < 9) {
    //     selectedDemod = "FM";
    // }

    // if (dist(mouseX, mouseY, demodX + 60, demodY + 120) < 9) {
    //     selectedDemod = "AM";
    // }

        // FM
    if (dist(mouseX, mouseY, demodX + 60, demodY + 80) < 9) {

        if (selectedDemod === "FM") {
            selectedDemod = null;      // Turn it off
        } else {
            selectedDemod = "FM";      // Turn it on
        }

        console.log(selectedDemod);
    }

    // AM
    if (dist(mouseX, mouseY, demodX + 60, demodY + 120) < 9) {

        if (selectedDemod === "AM") {
            selectedDemod = null;
        } else {
            selectedDemod = "AM";
        }

        console.log(selectedDemod);
    }

    let settingsX = width * 0.50;
    let settingsY = 120;

    let checkboxX = settingsX + 40;


    // FFT checkbox
    if (
        mouseX >= checkboxX &&
        mouseX <= checkboxX + 22 &&
        mouseY >= settingsY + 210 &&
        mouseY <= settingsY + 232
    ) {
        fftEnabled = !fftEnabled;
    }


    // Amplify checkbox
    if (
        mouseX >= checkboxX &&
        mouseX <= checkboxX + 22 &&
        mouseY >= settingsY + 340 &&
        mouseY <= settingsY + 362
    ) {
        amplifyEnabled = !amplifyEnabled;
    }


    // Filter checkbox
    if (
        mouseX >= checkboxX &&
        mouseX <= checkboxX + 22 &&
        mouseY >= settingsY + 410 &&
        mouseY <= settingsY + 432
    ) {
        filterEnabled = !filterEnabled;
    }

    let spectrumX = 40;
    let spectrumY = 120;
    let spectrumW = width * 0.42;
    let spectrumH = height * 0.48;


    // Left arrow
    if (
        mouseX >= spectrumX &&
        mouseX <= spectrumX + 35 &&
        mouseY >= spectrumY + spectrumH - 60 &&
        mouseY <= spectrumY + spectrumH
    ) {

        spectrumIndex--;

        if(spectrumIndex < 0){
            spectrumIndex = spectrumNames.length - 1;
        }

    }


    // Right arrow
    if (
        mouseX >= spectrumX + spectrumW - 35 &&
        mouseX <= spectrumX + spectrumW &&
        mouseY >= spectrumY + spectrumH - 60 &&
        mouseY <= spectrumY + spectrumH
    ) {

        spectrumIndex++;

        if(spectrumIndex >= spectrumNames.length){
            spectrumIndex = 0;
        }

    }

}
