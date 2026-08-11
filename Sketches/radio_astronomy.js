console.log("RADIO_ASTRONOMY.JS LOADED");

let fftEnabled = false;
let filterEnabled = false;
let amplifyEnabled = false;

let smoothedData = null;
let peakHold = null;

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

// function preload() {
//     clickSound = loadSound(
//         "../Sounds/click.wav",
//         () => console.log("Click sound loaded"),
//         error => console.error("Click sound failed:", error)
//     );
// }

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
    testSpectrums["Raw Observation"] =
    generateSpectrumSignal(0.7, 15, 30);

    testSpectrums["Calibrated Spectrum"] =
        generateSpectrumSignal(0.5, 35, 12);

    testSpectrums["Baseline Removed"] =
        generateSpectrumSignal(0.45, 40, 5);

    testSpectrums["Smoothed Hydrogen Line"] =
        generateSpectrumSignal(0.35, 70, 3);

    testSpectrums["Velocity Shift"] =
        generateSpectrumSignal(0.4, 55, 8);

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

testSpectrums["Live"] = new Array(numSpectrumPoints).fill(0);

function fetchLiveSpectrum() {
    fetch("hackrf_data.json")
        .then(res => res.json())
        .then(data => {
            if (data.spectrum && data.spectrum.length) {
                testSpectrums["Live"] = data.spectrum;
                if (!spectrumNames.includes("Live")) {
                    spectrumNames.push("Live");
                }
            }
        })
        .catch(err => console.error("Live spectrum fetch failed:", err));
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
    setInterval(fetchLiveSpectrum, 3000);

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

function loadLiveSnippet() {
    // cache-bust so the browser doesn't just re-serve the old file
    loadSound("radio_snippet.wav?t=" + Date.now(), sound => {
        if (liveSound) liveSound.disconnect();
        liveSound = sound;
        liveSound.setVolume(0);   // mute playback, we just want the analysis
        liveSound.play();
        fftAnalyzer.setInput(liveSound);
    });
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

function updateInputTheme() {
    let inputs = [
        frequencyInput,
        durationInput,
        sampleRateInput,
        cutoffInput
    ];

    for (let input of inputs) {
        if (lightModeOn) {
            input.style("background", "#eeeeee");
            input.style("color", "black");
        } else {
            input.style("background", "#232323");
            input.style("color", "white");
        }

        input.style("border", "2px solid orange");
        input.style("border-radius", "8px");
        input.style("padding", "6px");
        input.style("font-size", "16px");
        input.style("font-family", "Orbitron");
    }
}

function draw() {
    updateThemeColors();
    updateInputTheme();
    updateFontSizes();
    background(bgColor);

    drawHeader();
    drawSpectrumViewer();
    drawDemodulator();
    drawSettingsPanel();
    drawHomeButton();
    drawSettingsButton();
    drawSpectrumGrid();
}

function drawSpectrumGrid(x, y, w, h) {
    stroke(lightModeOn ? 210 : 55);
    strokeWeight(1);

    let rows = 6;
    for (let i = 0; i <= rows; i++) {
        let gy = y + 55 + (i / rows) * (h - 100);
        line(x + 55, gy, x + w - 20, gy);
    }

    let cols = 8;
    for (let i = 0; i <= cols; i++) {
        let gx = x + 55 + (i / cols) * (w - 75);
        line(gx, y + 55, gx, y + h - 55);
    }

    // -------------------------------
    // Axis labels
    // -------------------------------

    noStroke();
    fill(textColor);
    textSize(labelSize * 0.8);

    // X-axis label
    textAlign(CENTER, CENTER);

    let xAxisLabel = fftEnabled ? "Frequency" : "Time";

    text(
        xAxisLabel,
        x + w / 2,
        y + h - 15
    );

    // Y-axis label
    push();

    translate(
        x + 15,
        y + h / 2
    );

    rotate(-HALF_PI);

    text(
        "Amplitude",
        0,
        0
    );

    pop();

    noStroke();
}

function updatePeakHold(data) {
    if (!peakHold || peakHold.length !== data.length) {
        peakHold = data.slice();
        return;
    }
    for (let i = 0; i < data.length; i++) {
        peakHold[i] = data[i] > peakHold[i] ? data[i] : peakHold[i] - 0.15;
    }
}

function drawHeader() {

    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(titleSize);
    text("Radio Astronomy Dashboard", width/2,45);
}

function drawSpectrumViewer(){

    let x = 40;
    let y = 120;
    let w = width*0.42;
    let h = height*0.48;

    stroke(255,140,0);
    strokeWeight(3);
    fill(panelColor);
    rect(x,y,w,h,15);

    fill(textColor);
    noStroke();
    textSize(headingSize);
    text("Spectrum Viewer",x+w/2,y+25);

    //---------------------------------------
    // Grid
    //---------------------------------------

    drawSpectrumGrid(x, y, w, h);

    //---------------------------------------
    // Data prep: process, smooth, peak-hold
    //---------------------------------------

    let rawData = testSpectrums[spectrumNames[spectrumIndex]];
    let data = applyProcessing(rawData);

    if (!smoothedData || smoothedData.length !== data.length) {
        smoothedData = data.slice();
    } else {
        for (let i = 0; i < data.length; i++) {
            smoothedData[i] = lerp(smoothedData[i], data[i], 0.35);
        }
    }

    updatePeakHold(smoothedData);

    //---------------------------------------
    // Filled area under the curve
    //---------------------------------------

    noStroke();
    fill(255,140,0,40);
    beginShape();
    vertex(x + 55, y + h/2);
    for (let i = 0; i < smoothedData.length; i++) {
        let px = x + 55 + (i / (smoothedData.length - 1)) * (w - 75);
        let py = y + h/2 - smoothedData[i] * 2.2;
        vertex(px, py);
    }
    vertex(x + w - 20, y + h/2);
    endShape(CLOSE);

    //---------------------------------------
    // Main glowing trace
    //---------------------------------------

    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = "rgba(255,140,0,0.8)";
    stroke(255,180,60);
    strokeWeight(2);
    noFill();

    beginShape();
    for (let i = 0; i < smoothedData.length; i++) {
        let px = x + 55 + (i / (smoothedData.length - 1)) * (w - 75);
        let py = y + h/2 - smoothedData[i] * 2.2;
        vertex(px, py);
    }
    endShape();

    drawingContext.shadowBlur = 0;

    //---------------------------------------
    // Filter type label (only while Apply Filter is on)
    //---------------------------------------

    if (filterEnabled) {
        noStroke();
        fill(255,140,0);
        textSize(labelSize * 0.85);
        text("Filter: " + filterType, x + w/2, y + 45);
    }

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
    textSize(labelSize);
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
        fill(panelColor);
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
        fill(255, 140, 0);
    } else if (hovering) {
        if (lightModeOn) {
            fill(200);
        } else {
            fill(80);
        }
    } else {
        fill(panelColor);
    }

    rect(x, y, w, h, 10);

    noStroke();
    if (active) {
        fill(35);
    } else {
        fill(textColor);
    }

    textAlign(CENTER, CENTER);
    textSize(labelSize);

    text(
        label + (active ? "   ● ON" : "   ○ OFF"),
        x + w / 2,
        y + h / 2
    );
}

async function setDemodulator(mode) {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/set_demodulator",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    mode: mode
                })
            }
        );

        const result = await response.json();

        console.log(result.message);

    }
    catch(err) {

        console.error(err);

    }

}

function drawDemodulator(){

    let x = 40;
    let y = height*0.64;
    let w = width*0.42;
    let h = height*0.22;

    stroke(255,140,0);
    strokeWeight(3);

    fill(panelColor);
    rect(x,y,w,h,15);

    noStroke();
    fill(textColor);
    textSize(headingSize);
    text("Demodulator",x+w/2,y+25);

    textSize(labelSize);

    let btnW = w - 80;
    let btnH = 45;

    drawDemodToggle(x + 40, y + 65, btnW, btnH, "FM", selectedDemod === "FM");
    drawDemodToggle(x + 40, y + 125, btnW, btnH, "AM", selectedDemod === "AM");
}

function drawSettingsButton(){

    let w = 120;
    let h = 45;
    let x = width - w - 20;
    let y = 20;

    fill(panelColor);
    stroke(255,140,0);
    strokeWeight(2);

    rect(x,y,w,h,10);

    noStroke();
    fill(textColor);

    textAlign(CENTER,CENTER);
    textSize(labelSize);

    text("Settings", x + w/2, y + h/2);
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
    fill(textColor);
    textAlign(LEFT, CENTER);
    textSize(labelSize);
    text(label + (checked ? "  (ON)" : "  (OFF)"), x + toggleW + 15, y + toggleH/2);
}

function drawSettingsPanel(){

    let x = width*0.50;
    let y = 120;
    let w = width*0.46;
    let h = height*0.74;

    stroke(255,140,0);
    strokeWeight(3);

    fill(panelColor);
    rect(x,y,w,h,15);

    noStroke();

    fill(textColor);
    textSize(headingSize);
    text("Settings",x+w/2,y+40);

    textAlign(LEFT,CENTER);

    let left = x+40;
    let inputX = x+230;

    fill(textColor);

    textSize(labelSize);

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

    // if (fftEnabled) {
    //     sampleRateInput.show();
    //     sampleRateInput.position(inputX, y + 265);
    //     sampleRateInput.size(220, 35);
    // } else {
    //     sampleRateInput.hide();
    // }

    //------------------------------------
    // Amplify
    //------------------------------------

    drawToggleSwitch(left, y+335, amplifyEnabled, "Amplify (+5 MHz)");

    //------------------------------------
    // Filter
    //------------------------------------

    drawToggleSwitch(left, y+405, filterEnabled, "Apply Filter");

    // if (filterEnabled) {
    //     cutoffInput.show();
    //     cutoffInput.position(inputX, y + 475);
    //     cutoffInput.size(220, 35);
    // } else {
    //     cutoffInput.hide();
    // }

    //------------------------------------
    // Run Button
    //------------------------------------

    fill(255,140,0);

    rect(x+40,h+y-90,180,50,10);

    fill(255);

    textAlign(CENTER,CENTER);

    textSize(labelSize);

    text("Run Capture",x+130,h+y-65);
}

function windowResized(){

    resizeCanvas(windowWidth,windowHeight);

}

function drawHomeButton(){

    fill(panelColor);
    stroke(255,140,0);
    strokeWeight(2);

    rect(20,20,120,45,10);

    noStroke();
    fill(textColor);

    textAlign(CENTER,CENTER);
    textSize(labelSize);

    text("← Home",80,42);
}

function mousePressed(){

    if(mouseX >= 20 &&
       mouseX <= 140 &&
       mouseY >= 20 &&
       mouseY <= 65){
        playButtonClick();
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
        playButtonClick();
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
        playButtonClick();
        selectedDemod = (selectedDemod === "FM") ? null : "FM";
        //console.log(selectedDemod);
        if(selectedDemod){
            setDemodulator(selectedDemod);
        }
    }

    // AM
    if (
        mouseX >= demodX + 40 &&
        mouseX <= demodX + 40 + btnW &&
        mouseY >= amY &&
        mouseY <= amY + btnH
    ) {
        playButtonClick();
        selectedDemod = (selectedDemod === "AM") ? null : "AM";
        //console.log(selectedDemod);
        if(selectedDemod){
            setDemodulator(selectedDemod);
        }
    }

    let settingsBtnW = 120;
    let settingsBtnH = 45;
    let settingsBtnX = width - settingsBtnW - 20;
    let settingsBtnY = 20;

    if (
        mouseX >= settingsBtnX &&
        mouseX <= settingsBtnX + settingsBtnW &&
        mouseY >= settingsBtnY &&
        mouseY <= settingsBtnY + settingsBtnH
    ) {
        window.location.href = "settings.html";
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
        playButtonClick();
        fftEnabled = !fftEnabled;
    }

    // Amplify toggle
    if (
        mouseX >= toggleX &&
        mouseX <= toggleX + toggleW &&
        mouseY >= settingsY + 335 &&
        mouseY <= settingsY + 335 + toggleH
    ) {
        playButtonClick();
        amplifyEnabled = !amplifyEnabled;
    }

    // Filter toggle
    if (
        mouseX >= toggleX &&
        mouseX <= toggleX + toggleW &&
        mouseY >= settingsY + 405 &&
        mouseY <= settingsY + 405 + toggleH
    ) {
        playButtonClick();
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
        playButtonClick();
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
        playButtonClick();
        spectrumIndex++;

        if(spectrumIndex >= spectrumNames.length){
            spectrumIndex = 0;
        }

    }

}

