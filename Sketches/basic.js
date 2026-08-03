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

let hackrfData = {
    frequency: "",
    sample_rate: ""
};

//---------------------------------------
// Test spectrum data
//---------------------------------------

let testSpectrums = {};
let numSpectrumPoints = 160;

function generateTestSpectrums() {
    testSpectrums["Original"] = generateSpectrumSignal(0.5, 35, 8);
    testSpectrums["Strong Signal"] = generateSpectrumSignal(0.3, 55, 5);
    testSpectrums["Noisy Band"] = generateSpectrumSignal(0.65, 18, 22);

    spectrumNames = Object.keys(testSpectrums);
}

// Generates a fake "spectrum" as a peak (at peakPos, 0-1 across the width)
// plus random noise, so toggling FFT/Filter/Amplify visibly changes the shape.
function generateSpectrumSignal(peakPos, peakHeight, noiseLevel) {
    let data = [];

    for (let i = 0; i < numSpectrumPoints; i++) {
        let t = i / numSpectrumPoints;
        let d = t - peakPos;
        let peak = peakHeight * Math.exp(-(d * d) / 0.01);
        let noise = random(-noiseLevel, noiseLevel);

        data.push(peak + noise);
    }

    return data;
}

// Applies the current toggle states to a spectrum array for display.
function applyProcessing(data) {
    let result = data.slice();

    // FFT: rectify (simple stand-in for a magnitude spectrum)
    if (fftEnabled) {
        result = result.map(v => Math.abs(v));
    }

    // Filter: moving-average smoothing (simple stand-in for a low-pass filter)
    if (filterEnabled) {
        let windowSize = 5;
        let smoothed = [];

        for (let i = 0; i < result.length; i++) {
            let sum = 0;
            let count = 0;

            for (let j = -windowSize; j <= windowSize; j++) {
                let idx = i + j;

                if (idx >= 0 && idx < result.length) {
                    sum += result[idx];
                    count++;
                }
            }

            smoothed.push(sum / count);
        }

        result = smoothed;
    }

    // Amplify: scale the amplitude up
    if (amplifyEnabled) {
        result = result.map(v => v * 1.8);
    }

    return result;
}


function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    frequencyInput = createInput("");
    durationInput = createInput("");
    sampleRateInput = createInput("");
    cutoffInput = createInput("");

    loadHackRFData();
    generateTestSpectrums();

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

async function loadHackRFData() {
    try {
        const response = await fetch("hackrf_data.json");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        hackrfData = await response.json();
        console.log("Loaded:", hackrfData);
    } catch (err) {
        console.error("Failed to load hackrf_data.json:", err);
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
    // Test spectrum (reacts to toggles)
    //---------------------------------------

    stroke(255,140,0);
    strokeWeight(2);
    noFill();

    let rawData = testSpectrums[spectrumNames[spectrumIndex]];
    let data = applyProcessing(rawData);

    beginShape();

    for (let i = 0; i < data.length; i++) {
        let px = x + 20 + (i / (data.length - 1)) * (w - 40);
        let py = y + h/2 - data[i] * 2.2;

        vertex(px, py);
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

// Toggle-style button for the demodulator (FM / AM)
function drawDemodToggle(x, y, w, h, label, active) {

    let hovering =
        mouseX >= x &&
        mouseX <= x + w &&
        mouseY >= y &&
        mouseY <= y + h;

    stroke(255,140,0);
    strokeWeight(2);

    if (active) {
        fill(255,140,0);
    } else if (hovering) {
        fill(80);
    } else {
        fill(50);
    }

    rect(x, y, w, h, 10);

    noStroke();
    fill(active ? 35 : 255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(label + (active ? "   \u25CF ON" : "   \u25CB OFF"), x + w/2, y + h/2);
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

    let btnW = w - 80;
    let btnH = 45;

    drawDemodToggle(x + 40, y + 65, btnW, btnH, "FM", selectedDemod === "FM");
    drawDemodToggle(x + 40, y + 125, btnW, btnH, "AM", selectedDemod === "AM");
}

// Toggle switch for the settings panel (FFT / Filter / Amplify)
function drawToggleSwitch(x, y, checked, label) {

    let toggleW = 46;
    let toggleH = 24;

    let hovering =
        mouseX >= x &&
        mouseX <= x + toggleW &&
        mouseY >= y &&
        mouseY <= y + toggleH;

    noStroke();

    if (checked) {
        fill(255,140,0);
    } else if (hovering) {
        fill(90);
    } else {
        fill(60);
    }

    rect(x, y, toggleW, toggleH, toggleH/2);

    // Knob
    fill(255);
    let knobD = toggleH - 6;
    let knobX = checked ? x + toggleW - knobD - 3 : x + 3;
    circle(knobX + knobD/2, y + toggleH/2, knobD);

    // Label + ON/OFF state
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(18);
    text(label + (checked ? "  (ON)" : "  (OFF)"), x + toggleW + 15, y + toggleH/2);
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
    text("Settings",x+w/2,y+40);

    textAlign(LEFT,CENTER);

    let left = x+40;
    let inputX = x+230;

    fill(255);

    textSize(18);

    //------------------------------------
    // Info: frequency, sample rate, active toggles
    //------------------------------------

    text(
        "Frequency: " + (103700000 / 1e6).toFixed(1) + " MHz",
        left,
        y + 90
    );

    text(
        "Sample Rate: " + (2400000 / 1e6).toFixed(1) + " MS/s",
        left,
        y + 120
    );

    let activeToggles = [];
    if (fftEnabled) activeToggles.push("FFT");
    if (filterEnabled) activeToggles.push("Filter");
    if (amplifyEnabled) activeToggles.push("Amplify");

    text(
        "Active: " + (activeToggles.length ? activeToggles.join(", ") : "None"),
        left,
        y + 150
    );

    //------------------------------------
    // FFT
    //------------------------------------

    drawToggleSwitch(left, y+205, fftEnabled, "Apply FFT");

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

    drawToggleSwitch(left, y+335, amplifyEnabled, "Amplify (+5 MHz)");

    //------------------------------------
    // Filter
    //------------------------------------

    drawToggleSwitch(left, y+405, filterEnabled, "Apply Filter");

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

    //------------------------------------
    // Run Capture button (fixed: was
    // referencing undefined x/y/h, which
    // threw an error and blocked every
    // click handler below it)
    //------------------------------------

    let settingsX = width * 0.50;
    let settingsY = 120;
    let settingsW = width * 0.46;
    let settingsH = height * 0.74;

    if (
        mouseX >= settingsX + 40 &&
        mouseX <= settingsX + 220 &&
        mouseY >= settingsH + settingsY - 90 &&
        mouseY <= settingsH + settingsY - 40
    ) {
        console.log("Frequency:", frequencyInput.value());
        console.log("Duration:", durationInput.value());
    }

    //------------------------------------
    // Demodulator toggle buttons
    //------------------------------------

    let demodX = 40;
    let demodY = height * 0.64;
    let demodW = width * 0.42;

    let btnW = demodW - 80;
    let btnH = 45;
    let fmY = demodY + 65;
    let amY = demodY + 125;

    // FM
    if (
        mouseX >= demodX + 40 &&
        mouseX <= demodX + 40 + btnW &&
        mouseY >= fmY &&
        mouseY <= fmY + btnH
    ) {
        selectedDemod = (selectedDemod === "FM") ? null : "FM";
        console.log(selectedDemod);
    }

    // AM
    if (
        mouseX >= demodX + 40 &&
        mouseX <= demodX + 40 + btnW &&
        mouseY >= amY &&
        mouseY <= amY + btnH
    ) {
        selectedDemod = (selectedDemod === "AM") ? null : "AM";
        console.log(selectedDemod);
    }

    //------------------------------------
    // Settings toggle switches
    //------------------------------------

    let toggleX = settingsX + 40;
    let toggleW = 46;
    let toggleH = 24;

    // FFT toggle
    if (
        mouseX >= toggleX &&
        mouseX <= toggleX + toggleW &&
        mouseY >= settingsY + 205 &&
        mouseY <= settingsY + 205 + toggleH
    ) {
        fftEnabled = !fftEnabled;
    }

    // Amplify toggle
    if (
        mouseX >= toggleX &&
        mouseX <= toggleX + toggleW &&
        mouseY >= settingsY + 335 &&
        mouseY <= settingsY + 335 + toggleH
    ) {
        amplifyEnabled = !amplifyEnabled;
    }

    // Filter toggle
    if (
        mouseX >= toggleX &&
        mouseX <= toggleX + toggleW &&
        mouseY >= settingsY + 405 &&
        mouseY <= settingsY + 405 + toggleH
    ) {
        filterEnabled = !filterEnabled;
    }

    //------------------------------------
    // Spectrum arrows
    //------------------------------------

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
