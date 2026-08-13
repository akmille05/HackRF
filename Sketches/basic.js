console.log("BASIC.JS LOADED");

let fftEnabled = false;
let filterEnabled = false;
let amplifyEnabled = false;
let activeEnabled = false;

let freqSlider;

let smoothedData = null;
let peakHold = null;

let rawLiveCapture = null; 

// Which filter type is active when filterEnabled is true
let filterType = "Lowpass";
let filterTypeOptions = ["Lowpass", "Highpass", "Bandpass", "Bandstop"];

let spectrumIndex = 0;
let spectrumNames = ["Original"];

let selectedDemod = null;

let leftArrowHover = false;
let rightArrowHover = false;

let frequencyInput;
let sampleRateInput;

let saveDataEnabled =
    localStorage.getItem("saveData") === "true";

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

function basic_activate() {
    if (activeEnabled) {
        //start recording
    }
}

// Simple moving-average smoothing helper, used to build the different
// filter-type responses below.
function movingAverage(data, windowSize) {
    let smoothed = [];

    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let count = 0;

        for (let j = -windowSize; j <= windowSize; j++) {
            let idx = i + j;

            if (idx >= 0 && idx < data.length) {
                sum += data[idx];
                count++;
            }
        }

        smoothed.push(sum / count);
    }

    return smoothed;
}

// Applies the currently selected filter type as a stand-in for a real
// DSP filter, so each option visibly changes the spectrum shape.
function applyFilterType(data, type) {
    if (type === "Lowpass") {
        // Keep the slow-moving shape, smooth out the fast wiggles
        return movingAverage(data, 5);
    }

    if (type === "Highpass") {
        // Keep only what the lowpass removed (the fast wiggles)
        let low = movingAverage(data, 5);
        return data.map((v, i) => v - low[i]);
    }

    if (type === "Bandpass") {
        // Keep a middle band: narrow smoothing minus wide smoothing
        let narrow = movingAverage(data, 2);
        let wide = movingAverage(data, 10);
        return narrow.map((v, i) => v - wide[i]);
    }

    if (type === "Bandstop") {
        // Remove that same middle band, keep everything else
        let narrow = movingAverage(data, 2);
        let wide = movingAverage(data, 10);
        let band = narrow.map((v, i) => v - wide[i]);
        return data.map((v, i) => v - band[i]);
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

    // Filter: apply whichever filter type is currently selected
    if (filterEnabled) {
        result = applyFilterType(result, filterType);
    }

    // Amplify: scale the amplitude up
    if (amplifyEnabled) {
        result = result.map(v => v * 1.8);
    }

    return result;
}

testSpectrums["Live"] = new Array(numSpectrumPoints).fill(0);

function fetchLiveSpectrum() {
    fetch("hackdata.json")
        .then(res => res.json())
        .then(data => {
            if (data.spectrum && data.spectrum.length) {
                rawLiveCapture = data.spectrum;

                if (!spectrumNames.includes("Live")) {
                    spectrumNames.push("Live");
                }

                applyTuning();
            }
        })
        .catch(err => console.error("Live spectrum fetch failed:", err));
}


function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    frequencyInput = createInput("103.7");
    frequencyInput.size(80);
    frequencyInput.style('font-family', 'Orbitron');
    frequencyInput.style('background-color', 'rgb(255,140,0)');
    frequencyInput.style('color', '#232323');
    frequencyInput.style('border', '2px solid rgb(255,180,60)');
    frequencyInput.style('border-radius', '6px');
    frequencyInput.style('padding', '4px 8px');

    sampleRateInput = createInput("2.4");
    sampleRateInput.size(80);
    sampleRateInput.style('font-family', 'Orbitron');
    sampleRateInput.style('background-color', 'rgb(255,140,0)');
    sampleRateInput.style('color', '#232323');
    sampleRateInput.style('border', '2px solid rgb(255,180,60)');
    sampleRateInput.style('border-radius', '6px');
    sampleRateInput.style('padding', '4px 8px');

    freqSlider = createSlider(80, 115, 98.7, 0.1);
    freqSlider.input(applyTuning);
    freqSlider.style('accent-color', 'rgb(255,140,0)');

    updateFrequencyControl(); 

    loadHackRFData();
    generateTestSpectrums();
    setInterval(fetchLiveSpectrum, 3000);
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

function updateFrequencyControl() {
    if (selectedDemod === "FM") {
        freqSlider.attribute('min', 80);
        freqSlider.attribute('max', 115);
        freqSlider.attribute('step', 0.1);
        freqSlider.value(98.7);
        freqSlider.show();
        frequencyInput.hide();
    } else if (selectedDemod === "AM") {
        freqSlider.attribute('min', 530);
        freqSlider.attribute('max', 1710);
        freqSlider.attribute('step', 10);
        freqSlider.value(1000);
        freqSlider.show();
        frequencyInput.hide();
    } else {
        freqSlider.hide();
        frequencyInput.show();
    }

    applyTuning();
}

async function loadHackRFData() {
    try {
        const response = await fetch("hackdata.json");
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
    updateThemeColors();
    updateFontSizes();
    background(bgColor);

    drawHeader();
    drawSpectrumViewer();
    drawDemodulator();
    drawRunCaptureButton();
    drawSettingsPanel();
    drawHomeButton();
    drawSettingsButton();
}

function drawHeader() {

    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(titleSize);
    text("Basic HackRF Dashboard", width/2,45);
}

function applyTuning() {
    if (!rawLiveCapture) return;

    if (!selectedDemod) {
        testSpectrums["Live"] = rawLiveCapture.slice();
        return;
    }

    let freqValue = freqSlider.value();
    let minFreq = selectedDemod === "FM" ? 80 : 530;
    let maxFreq = selectedDemod === "FM" ? 115 : 1710;

    let frac = constrain((freqValue - minFreq) / (maxFreq - minFreq), 0, 1);
    let shift = Math.floor(frac * rawLiveCapture.length);

    testSpectrums["Live"] = rawLiveCapture.slice(shift).concat(rawLiveCapture.slice(0, shift));
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

        if (selectedDemod && spectrumNames[spectrumIndex] === "Live") {
        let freqValue = freqSlider.value();
        let minFreq = selectedDemod === "FM" ? 80 : 530;
        let maxFreq = selectedDemod === "FM" ? 115 : 1710;

        let frac = constrain((freqValue - minFreq) / (maxFreq - minFreq), 0, 1);
        let markerX = x + 55 + frac * (w - 75);

        stroke(255, 255, 255, 70);
        strokeWeight(1);
        line(markerX, y + 55, markerX, y + h - 55);
        noStroke();
    }

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
        fill(lightModeOn ? 200 : 80);
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
    text(label + (active ? "   \u25CF ON" : "   \u25CB OFF"), x + w/2, y + h/2);
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
        fill(lightModeOn ? 180 : 90);
    } else {
        fill(lightModeOn ? 160 : 60);
    }

    rect(x, y, toggleW, toggleH, toggleH/2);

    // Knob
    fill(textColor);
    let knobD = toggleH - 6;
    let knobX = checked ? x + toggleW - knobD - 3 : x + 3;
    circle(knobX + knobD/2, y + toggleH/2, knobD);

    // Label + ON/OFF state
    fill(textColor);
    textAlign(LEFT, CENTER);
    textSize(labelSize);
    text(label + (checked ? "  (ON)" : "  (OFF)"), x + toggleW + 15, y + toggleH/2);
}

function drawRunCaptureButton(){

    let x = 40;
    let y = height*0.64 + height*0.22 + 15;  // just under the demodulator panel
    let w = width*0.42;
    let h = 50;

    let hovering =
        mouseX >= x &&
        mouseX <= x + w &&
        mouseY >= y &&
        mouseY <= y + h;

    stroke(255,140,0);
    strokeWeight(3);

    if (hovering) {
        fill(255,160,30);
    } else {
        fill(255,140,0);
    }

    rect(x, y, w, h, 10);

    noStroke();
    fill(35);

    textAlign(CENTER, CENTER);
    textSize(labelSize);
    text("Run Capture", x + w/2, y + h/2);
}

// Small selectable pill button, used for the filter-type picker
function drawFilterOptionButton(x, y, w, h, label, active) {

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
        fill(lightModeOn ? 200 : 80);
    } else {
        fill(panelColor);
    }

    rect(x, y, w, h, 8);

    noStroke();
    fill(active ? 35 : textColor);
    textAlign(CENTER, CENTER);
    textSize(labelSize * 0.8);
    text(label, x + w/2, y + h/2);
}

function drawFilterTypeSelector(x, y, w) {

    let gap = 10;
    let btnW = (w - gap) / 2;
    let btnH = 32;

    for (let i = 0; i < filterTypeOptions.length; i++) {
        let col = i % 2;
        let row = Math.floor(i / 2);
        let bx = x + col * (btnW + gap);
        let by = y + row * (btnH + gap);

        drawFilterOptionButton(bx, by, btnW, btnH, filterTypeOptions[i], filterType === filterTypeOptions[i]);
    }
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

    fill(textColor);

    textSize(labelSize);

    //------------------------------------
    // Info: frequency, sample rate, active toggles
    //------------------------------------

    
    // text(
    //     "Tuned Frequency (MHz):",
    //     left,
    //     y + 90
    // );

    // let freqLabelW = textWidth("Tuned Frequency (MHz):");
    // frequencyInput.position(left + freqLabelW + 15, y + 90 - 10);

    text(
        "Sample Rate (MS/s):",
        left,
        y + 120
    );

    let srLabelW = textWidth("Sample Rate (MS/s):");
    sampleRateInput.position(left + srLabelW + 15, y + 120 - 10);


    let freqLabel = selectedDemod === "AM" ? "Tuned Frequency (kHz):" : "Tuned Frequency (MHz):";
    text(freqLabel, left, y + 90);

    let freqLabelW = textWidth(freqLabel);

    if (selectedDemod) {
        freqSlider.position(left + freqLabelW + 15, y + 90 - 10);
        freqSlider.size(140);

        let unit = selectedDemod === "AM" ? " kHz" : " MHz";
        let decimals = selectedDemod === "AM" ? 0 : 1;

        text(freqSlider.value().toFixed(decimals) + unit, left + freqLabelW + 165, y + 90);
    } else {
        frequencyInput.position(left + freqLabelW + 15, y + 90 - 10);
    }

    let activeToggles = [];
    if (fftEnabled) activeToggles.push("FFT");
    if (filterEnabled) activeToggles.push("Filter (" + filterType + ")");
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

    //------------------------------------
    // Amplify
    //------------------------------------

    drawToggleSwitch(left, y+335, amplifyEnabled, "Amplify (+5 MHz)");

    //------------------------------------
    // Filter
    //------------------------------------

    drawToggleSwitch(left, y+405, filterEnabled, "Apply Filter");

    if (filterEnabled) {
        drawFilterTypeSelector(left, y+445, w - 80);
    }

    //------------------------------------
    // Run Button
    //------------------------------------

    // fill(255,140,0);

    // rect(x+40,h+y-90,180,50,10);

    // fill(255);

    // textAlign(CENTER,CENTER);

    // textSize(labelSize);

    // text("Run Capture",x+130,h+y-65);
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

function generateMockCapture() {
    // randomize a bit each run so repeated captures don't look identical
    let peakPos = random(0.2, 0.8);
    let peakHeight = random(30, 50);
    let noiseLevel = random(4, 9);

    return generateSpectrumSignal(peakPos, peakHeight, noiseLevel);
}

// Top-right box, same styling as the Home button, links to settings.js
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

function mousePressed(){

    if(mouseX >= 20 &&
       mouseX <= 140 &&
       mouseY >= 20 &&
       mouseY <= 65){
        playButtonClick();
        window.location.href = "../ui.html";
    }

    //------------------------------------
    // Settings button (top right)
    //------------------------------------

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
    // Run Capture button
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
        console.log("Frequency:", 103700000);
        console.log("Sample Rate:", 2400000);
        console.log("Filter:", filterEnabled ? filterType : "off");
        console.log("Demod:", selectedDemod);
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
        updateFrequencyControl();   // <-- add this
        console.log(selectedDemod);
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
        updateFrequencyControl();   // <-- add this
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
    // Filter type selector buttons
    //------------------------------------

    if (filterEnabled) {
        let selX = settingsX + 40;
        let selY = settingsY + 445;
        let selW = settingsW - 80;

        let gap = 10;
        let btnW2 = (selW - gap) / 2;
        let btnH2 = 32;

        for (let i = 0; i < filterTypeOptions.length; i++) {
            let col = i % 2;
            let row = Math.floor(i / 2);
            let bx = selX + col * (btnW2 + gap);
            let by = selY + row * (btnH2 + gap);

            if (
                mouseX >= bx &&
                mouseX <= bx + btnW2 &&
                mouseY >= by &&
                mouseY <= by + btnH2
            ) {
                filterType = filterTypeOptions[i];
            }
        }
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

    //------------------------------------
    // Run Capture button (under Demodulator)
    //------------------------------------

    let captureX = 40;
    let captureY = height*0.64 + height*0.22 + 15;
    let captureW = width*0.42;
    let captureH = 50;

    if (
        mouseX >= captureX &&
        mouseX <= captureX + captureW &&
        mouseY >= captureY &&
        mouseY <= captureY + captureH
    ) {
        playButtonClick();
        let saveDataEnabled =
        localStorage.getItem("saveData") === "true";

        if (saveDataEnabled) {
            console.log("Saving capture data...");
        } else {
            console.log("Capture data will NOT be saved.");
        }

        rawLiveCapture = generateMockCapture();
        applyTuning();

        if (!spectrumNames.includes("Live")) {
            spectrumNames.push("Live");
        }

        spectrumIndex = spectrumNames.indexOf("Live");
    }
}