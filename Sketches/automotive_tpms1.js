
console.log("TPMS.JS LOADED");

// ============================================================
// Automotive TPMS Dashboard
// ============================================================

// Common North American TPMS frequency
const TPMS_FREQUENCY = 315.000; // MHz

let fftEnabled = false;
let smoothingEnabled = false;
let baselineEnabled = false;
let noiseEnabled = false;
let packetDetectionEnabled = false;

let activeEnabled = false;

let freqSlider;

let smoothedData = null;
let peakHold = null;

let rawLiveCapture = null;

// Spectrum navigation
let spectrumIndex = 0;
let spectrumNames = ["Original"];

// Inputs
let frequencyInput;
let sampleRateInput;
let thresholdInput;

// TPMS settings
let operatingFrequency = TPMS_FREQUENCY;
let sampleRate = 2.0;
let packetThreshold = 0.18;

// TPMS packet information
let packetDetected = false;
let packetCount = 0;
let signalStrength = 0;
let estimatedNoise = 0;


// ============================================================
// Test spectrum data
// ============================================================

let testSpectrums = {};
let numSpectrumPoints = 160;


// ------------------------------------------------------------
// Generate test TPMS spectra
// ------------------------------------------------------------

function generateTestSpectrums() {

    testSpectrums["Original"] =
        generateTPMSSpectrum(
            0.50,
            42,
            5,
            10
        );

    testSpectrums["Strong TPMS Signal"] =
        generateTPMSSpectrum(
            0.50,
            65,
            4,
            7
        );

    testSpectrums["Weak TPMS Signal"] =
        generateTPMSSpectrum(
            0.50,
            25,
            8,
            13
        );

    testSpectrums["Noisy TPMS Signal"] =
        generateTPMSSpectrum(
            0.50,
            32,
            15,
            11
        );

    spectrumNames =
        Object.keys(testSpectrums);
}


// ============================================================
// Generate simulated TPMS spectrum
// ============================================================

function generateTPMSSpectrum(
    peakPos,
    peakHeight,
    noiseLevel,
    width
) {

    let data = [];

    for (
        let i = 0;
        i < numSpectrumPoints;
        i++
    ) {

        let t =
            i /
            (numSpectrumPoints - 1);

        let distance =
            t - peakPos;


        // TPMS carrier peak

        let carrier =
            peakHeight *
            Math.exp(
                -(distance * distance) /
                (width / 1000)
            );


        // Noise

        let noise =
            random(
                -noiseLevel,
                noiseLevel
            );


        // Background variation

        let background =
            2 *
            Math.sin(
                t * PI * 3
            );


        data.push(
            carrier +
            noise +
            background
        );
    }

    return data;
}


// ============================================================
// Moving average
// ============================================================

function movingAverage(
    data,
    windowSize
) {

    let result = [];

    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        let sum = 0;
        let count = 0;


        for (
            let j = -windowSize;
            j <= windowSize;
            j++
        ) {

            let index =
                i + j;


            if (
                index >= 0 &&
                index < data.length
            ) {

                sum +=
                    data[index];

                count++;
            }
        }


        result.push(
            sum / count
        );
    }

    return result;
}


// ============================================================
// Baseline removal
// ============================================================

function removeBaseline(
    data
) {

    let average =
        data.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        data.length;


    return data.map(
        value =>
            value - average
    );
}


// ============================================================
// Estimate noise
// ============================================================

function estimateNoise(
    data
) {

    let mean =
        data.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        data.length;


    let variance =
        data.reduce(
            (sum, value) =>
                sum +
                Math.pow(
                    value - mean,
                    2
                ),
            0
        ) /
        data.length;


    return Math.sqrt(
        variance
    );
}


// ============================================================
// Signal strength
// ============================================================

function calculateSignalStrength(
    data
) {

    return Math.max(
        ...data
    );
}


// ============================================================
// SNR
// ============================================================

function calculateSNR(
    data
) {

    let noise =
        estimateNoise(
            data
        );


    if (
        noise === 0
    ) {

        return 0;
    }


    let signal =
        Math.max(
            ...data
        );


    return (
        signal /
        noise
    );
}


// ============================================================
// Packet detection
// ============================================================

function detectTPMSPacket(
    data
) {

    let threshold =
        parseFloat(
            thresholdInput.value()
        );


    if (
        isNaN(threshold)
    ) {

        threshold =
            packetThreshold;
    }


    let maximum =
        Math.max(
            ...data
        );


    return (
        maximum >
        threshold * 100
    );
}


// ============================================================
// Processing
// ============================================================

function applyProcessing(
    data
) {

    let result =
        data.slice();


    // FFT stand-in

    if (fftEnabled) {

        result =
            result.map(
                value =>
                    Math.abs(value)
            );
    }


    // Baseline removal

    if (baselineEnabled) {

        result =
            removeBaseline(
                result
            );
    }


    // Smoothing

    if (smoothingEnabled) {

        result =
            movingAverage(
                result,
                3
            );
    }


    return result;
}


// ============================================================
// Process TPMS capture
// ============================================================

function processTPMSCapture(
    data
) {

    signalStrength =
        calculateSignalStrength(
            data
        );


    estimatedNoise =
        estimateNoise(
            data
        );


    packetDetected =
        detectTPMSPacket(
            data
        );


    if (
        packetDetected
    ) {

        packetCount++;
    }


    console.log(
        "TPMS signal strength:",
        signalStrength
    );

    console.log(
        "Estimated noise:",
        estimatedNoise
    );

    console.log(
        "SNR:",
        calculateSNR(data)
    );

    console.log(
        "Packet detected:",
        packetDetected
    );
}


// ============================================================
// Live JSON spectrum
// ============================================================

function fetchLiveSpectrum() {

    fetch(
        "tpmsdata.json"
    )

        .then(
            response => {

                if (
                    !response.ok
                ) {

                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }

                return response.json();
            }
        )

        .then(
            data => {

                if (
                    data.spectrum &&
                    data.spectrum.length
                ) {

                    rawLiveCapture =
                        data.spectrum;


                    if (
                        !spectrumNames.includes(
                            "Live"
                        )
                    ) {

                        spectrumNames.push(
                            "Live"
                        );
                    }


                    processTPMSCapture(
                        rawLiveCapture
                    );


                    applyTuning();
                }
            }
        )

        .catch(
            error => {

                console.error(
                    "TPMS spectrum fetch failed:",
                    error
                );
            }
        );
}


// ============================================================
// Load TPMS JSON
// ============================================================

async function loadTPMSData() {

    try {

        const response =
            await fetch(
                "tpmsdata.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Loaded TPMS data:",
            data
        );


        if (
            data.frequency
        ) {

            operatingFrequency =
                data.frequency;
        }


        if (
            data.sample_rate
        ) {

            sampleRate =
                data.sample_rate;
        }
    }

    catch (
        error
    ) {

        console.error(
            "Failed to load TPMS data:",
            error
        );
    }
}


// ============================================================
// Setup
// ============================================================

function setup() {

    createCanvas(
        windowWidth,
        windowHeight
    );


    rectMode(
        CORNER
    );


    textAlign(
        CENTER,
        CENTER
    );


    textFont(
        "Orbitron"
    );


    // --------------------------------------------------------
    // Frequency input
    // --------------------------------------------------------

    frequencyInput =
        createInput(
            "315.000"
        );


    frequencyInput.size(
        90
    );


    frequencyInput.style(
        'font-family',
        'Orbitron'
    );


    frequencyInput.style(
        'background-color',
        'rgb(255,140,0)'
    );


    frequencyInput.style(
        'color',
        '#232323'
    );


    frequencyInput.style(
        'border',
        '2px solid rgb(255,180,60)'
    );


    frequencyInput.style(
        'border-radius',
        '6px'
    );


    frequencyInput.style(
        'padding',
        '4px 8px'
    );


    // --------------------------------------------------------
    // Sample rate
    // --------------------------------------------------------

    sampleRateInput =
        createInput(
            "2.0"
        );


    sampleRateInput.size(
        80
    );


    sampleRateInput.style(
        'font-family',
        'Orbitron'
    );


    sampleRateInput.style(
        'background-color',
        'rgb(255,140,0)'
    );


    sampleRateInput.style(
        'color',
        '#232323'
    );


    sampleRateInput.style(
        'border',
        '2px solid rgb(255,180,60)'
    );


    sampleRateInput.style(
        'border-radius',
        '6px'
    );


    sampleRateInput.style(
        'padding',
        '4px 8px'
    );


    // --------------------------------------------------------
    // Packet threshold
    // --------------------------------------------------------

    thresholdInput =
        createInput(
            "0.18"
        );


    thresholdInput.size(
        80
    );


    thresholdInput.style(
        'font-family',
        'Orbitron'
    );


    thresholdInput.style(
        'background-color',
        'rgb(255,140,0)'
    );


    thresholdInput.style(
        'color',
        '#232323'
    );


    thresholdInput.style(
        'border',
        '2px solid rgb(255,180,60)'
    );


    thresholdInput.style(
        'border-radius',
        '6px'
    );


    thresholdInput.style(
        'padding',
        '4px 8px'
    );


    // --------------------------------------------------------
    // Frequency slider
    // --------------------------------------------------------

    freqSlider =
        createSlider(
            314.5,
            315.5,
            315.0,
            0.001
        );


    freqSlider.input(
        applyTuning
    );


    freqSlider.style(
        'accent-color',
        'rgb(255,140,0)'
    );


    loadTPMSData();

    generateTestSpectrums();


    setInterval(
        fetchLiveSpectrum,
        3000
    );


    updateFrequencyControl();
}


// ============================================================
// Frequency control
// ============================================================

function updateFrequencyControl() {

    freqSlider.attribute(
        'min',
        314.5
    );


    freqSlider.attribute(
        'max',
        315.5
    );


    freqSlider.attribute(
        'step',
        0.001
    );


    freqSlider.value(
        315.000
    );


    freqSlider.show();


    frequencyInput.hide();


    applyTuning();
}


// ============================================================
// Tune TPMS spectrum
// ============================================================

function applyTuning() {

    if (
        !rawLiveCapture
    ) {

        return;
    }


    let freqValue =
        freqSlider.value();


    let minFreq =
        314.5;


    let maxFreq =
        315.5;


    let fraction =
        constrain(
            (
                freqValue -
                minFreq
            ) /
            (
                maxFreq -
                minFreq
            ),
            0,
            1
        );


    let shift =
        Math.floor(
            fraction *
            rawLiveCapture.length
        );


    testSpectrums["Live"] =
        rawLiveCapture
            .slice(shift)
            .concat(
                rawLiveCapture.slice(
                    0,
                    shift
                )
            );
}


// ============================================================
// Draw
// ============================================================

function draw() {

    updateThemeColors();

    updateFontSizes();

    background(
        bgColor
    );


    drawHeader();

    drawSpectrumViewer();

    drawTPMSPanel();

    drawRunCaptureButton();

    drawSettingsPanel();

    drawHomeButton();

    drawSettingsButton();
}


// ============================================================
// Header
// ============================================================

function drawHeader() {

    noStroke();

    fill(
        255,
        140,
        0
    );


    rect(
        0,
        0,
        width,
        90
    );


    fill(255);

    textSize(
        titleSize
    );


    text(
        "Automotive TPMS Dashboard",
        width / 2,
        45
    );
}


// ============================================================
// Spectrum grid
// ============================================================

function drawSpectrumGrid(
    x,
    y,
    w,
    h
) {

    stroke(
        lightModeOn
            ? 210
            : 55
    );


    strokeWeight(
        1
    );


    let rows = 6;


    for (
        let i = 0;
        i <= rows;
        i++
    ) {

        let gy =
            y +
            55 +
            (
                i /
                rows
            ) *
            (
                h - 100
            );


        line(
            x + 55,
            gy,
            x + w - 20,
            gy
        );
    }


    let cols = 8;


    for (
        let i = 0;
        i <= cols;
        i++
    ) {

        let gx =
            x +
            55 +
            (
                i /
                cols
            ) *
            (
                w - 75
            );


        line(
            gx,
            y + 55,
            gx,
            y + h - 55
        );
    }


    noStroke();

    fill(
        textColor
    );


    textSize(
        labelSize * 0.8
    );


    textAlign(
        CENTER,
        CENTER
    );


    text(
        fftEnabled
            ? "Frequency (MHz)"
            : "Frequency Offset",
        x + w / 2,
        y + h - 15
    );


    push();


    translate(
        x + 15,
        y + h / 2
    );


    rotate(
        -HALF_PI
    );


    text(
        "Amplitude",
        0,
        0
    );


    pop();


    noStroke();
}


// ============================================================
// Peak hold
// ============================================================

function updatePeakHold(
    data
) {

    if (
        !peakHold ||
        peakHold.length !==
        data.length
    ) {

        peakHold =
            data.slice();

        return;
    }


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        if (
            data[i] >
            peakHold[i]
        ) {

            peakHold[i] =
                data[i];

        }
        else {

            peakHold[i] -=
                0.15;
        }
    }
}


// ============================================================
// Spectrum viewer
// ============================================================

function drawSpectrumViewer() {

    let x = 40;

    let y = 120;

    let w =
        width * 0.42;

    let h =
        height * 0.48;


    stroke(
        255,
        140,
        0
    );


    strokeWeight(
        3
    );


    fill(
        panelColor
    );


    rect(
        x,
        y,
        w,
        h,
        15
    );


    fill(
        textColor
    );


    noStroke();


    textSize(
        headingSize
    );


    text(
        "TPMS Spectrum",
        x + w / 2,
        y + 25
    );


    drawSpectrumGrid(
        x,
        y,
        w,
        h
    );


    let rawData =
        testSpectrums[
            spectrumNames[
                spectrumIndex
            ]
        ];


    if (
        !rawData
    ) {

        return;
    }


    let data =
        applyProcessing(
            rawData
        );


    // --------------------------------------------------------
    // Smooth animation
    // --------------------------------------------------------

    if (
        !smoothedData ||
        smoothedData.length !==
        data.length
    ) {

        smoothedData =
            data.slice();

    }
    else {

        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            smoothedData[i] =
                lerp(
                    smoothedData[i],
                    data[i],
                    0.35
                );
        }
    }


    updatePeakHold(
        smoothedData
    );


    // --------------------------------------------------------
    // Filled spectrum
    // --------------------------------------------------------

    noStroke();

    fill(
        255,
        140,
        0,
        40
    );


    beginShape();


    vertex(
        x + 55,
        y + h / 2
    );


    for (
        let i = 0;
        i < smoothedData.length;
        i++
    ) {

        let px =
            x +
            55 +
            (
                i /
                (
                    smoothedData.length - 1
                )
            ) *
            (
                w - 75
            );


        let py =
            y +
            h / 2 -
            smoothedData[i] *
            2.2;


        vertex(
            px,
            py
        );
    }


    vertex(
        x + w - 20,
        y + h / 2
    );


    endShape(
        CLOSE
    );


    // --------------------------------------------------------
    // Main trace
    // --------------------------------------------------------

    drawingContext.shadowBlur =
        8;


    drawingContext.shadowColor =
        "rgba(255,140,0,0.8)";


    stroke(
        255,
        180,
        60
    );


    strokeWeight(
        2
    );


    noFill();


    beginShape();


    for (
        let i = 0;
        i < smoothedData.length;
        i++
    ) {

        let px =
            x +
            55 +
            (
                i /
                (
                    smoothedData.length - 1
                )
            ) *
            (
                w - 75
            );


        let py =
            y +
            h / 2 -
            smoothedData[i] *
            2.2;


        vertex(
            px,
            py
        );
    }


    endShape();


    drawingContext.shadowBlur =
        0;


    // --------------------------------------------------------
    // 315 MHz marker
    // --------------------------------------------------------

    let freqValue =
        freqSlider.value();


    let fraction =
        constrain(
            (
                freqValue -
                314.5
            ) /
            (
                315.5 -
                314.5
            ),
            0,
            1
        );


    let markerX =
        x +
        55 +
        fraction *
        (
            w - 75
        );


    stroke(
        255,
        255,
        255,
        90
    );


    strokeWeight(
        1
    );


    line(
        markerX,
        y + 55,
        markerX,
        y + h - 55
    );


    noStroke();


    // --------------------------------------------------------
    // Frequency label
    // --------------------------------------------------------

    fill(
        255,
        140,
        0
    );


    textSize(
        labelSize * 0.75
    );


    text(
        "TPMS Carrier: " +
        freqValue.toFixed(3) +
        " MHz",
        x + w / 2,
        y + 47
    );


    // --------------------------------------------------------
    // Packet status
    // --------------------------------------------------------

    fill(
        textColor
    );


    textSize(
        labelSize * 0.75
    );


    text(
        packetDetected
            ? "PACKET DETECTED"
            : "NO PACKET",
        x + w / 2,
        y + h - 58
    );


    // --------------------------------------------------------
    // Arrows
    // --------------------------------------------------------

    drawArrowButton(
        x + 15,
        y + h - 35,
        "left"
    );


    drawArrowButton(
        x + w - 15,
        y + h - 35,
        "right"
    );


    fill(255);


    textSize(
        labelSize
    );


    text(
        spectrumNames[
            spectrumIndex
        ],
        x + w / 2,
        y + h - 35
    );
}


// ============================================================
// Arrow buttons
// ============================================================

function drawArrowButton(
    x,
    y,
    direction
) {

    let hovering;


    if (
        direction === "left"
    ) {

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


    fill(
        hovering
            ? color(
                255,
                140,
                0
            )
            : color(120)
    );


    noStroke();


    if (
        direction === "left"
    ) {

        triangle(
            x,
            y,
            x + 20,
            y - 15,
            x + 20,
            y + 15
        );

    }
    else {

        triangle(
            x,
            y,
            x - 20,
            y - 15,
            x - 20,
            y + 15
        );
    }
}


// ============================================================
// TPMS information panel
// ============================================================

// ============================================================
// TPMS information panel
// ============================================================

function drawTPMSPanel() {

    let x = 40;
    let y = height * 0.64;
    let w = width * 0.42;
    let h = height * 0.22;

    // --------------------------------------------------------
    // Panel
    // --------------------------------------------------------

    stroke(255, 140, 0);
    strokeWeight(3);

    fill(panelColor);

    rect(
        x,
        y,
        w,
        h,
        15
    );

    // --------------------------------------------------------
    // Title
    // --------------------------------------------------------

    noStroke();

    fill(textColor);

    textAlign(CENTER, CENTER);

    // Make title smaller if screen is small
    let titleSize = min(
        headingSize,
        w * 0.055
    );

    textSize(titleSize);

    text(
        "TPMS Signal Analysis",
        x + w / 2,
        y + h * 0.16
    );

    // --------------------------------------------------------
    // Calculate responsive text sizes
    // --------------------------------------------------------

    let infoSize = min(
        labelSize * 0.75,
        w * 0.032,
        h * 0.12
    );

    textSize(infoSize);

    // --------------------------------------------------------
    // Values
    // --------------------------------------------------------

    let currentData =
        testSpectrums[
            spectrumNames[spectrumIndex]
        ];

    let snr = 0;

    if (currentData) {

        snr =
            calculateSNR(
                currentData
            );
    }

    let frequencyText =
        "Carrier Frequency: " +
        freqSlider.value().toFixed(3) +
        " MHz";

    let strengthText =
        "Signal Strength: " +
        signalStrength.toFixed(2);

    let noiseText =
        "Estimated Noise: " +
        estimatedNoise.toFixed(2);

    let snrText =
        "SNR: " +
        snr.toFixed(2);

    let packetText =
        "Packets Detected: " +
        packetCount;

    // --------------------------------------------------------
    // Two-column layout
    // --------------------------------------------------------

    let leftColumn =
        x + w * 0.27;

    let rightColumn =
        x + w * 0.73;

    let row1 =
        y + h * 0.43;

    let row2 =
        y + h * 0.64;

    let row3 =
        y + h * 0.85;

    // --------------------------------------------------------
    // Left column
    // --------------------------------------------------------

    textAlign(CENTER, CENTER);

    fill(textColor);

    text(
        frequencyText,
        leftColumn,
        row1
    );

    text(
        noiseText,
        leftColumn,
        row2
    );

    text(
        packetText,
        leftColumn,
        row3
    );

    // --------------------------------------------------------
    // Right column
    // --------------------------------------------------------

    text(
        strengthText,
        rightColumn,
        row1
    );

    text(
        snrText,
        rightColumn,
        row2
    );
}


// ============================================================
// Toggle switch
// ============================================================

function drawToggleSwitch(
    x,
    y,
    checked,
    label
) {

    let toggleW = 46;

    let toggleH = 24;


    let hovering =
        mouseX >= x &&
        mouseX <=
            x + toggleW &&
        mouseY >= y &&
        mouseY <=
            y + toggleH;


    noStroke();


    if (
        checked
    ) {

        fill(
            255,
            140,
            0
        );

    }
    else if (
        hovering
    ) {

        fill(
            lightModeOn
                ? 180
                : 90
        );

    }
    else {

        fill(
            lightModeOn
                ? 160
                : 60
        );
    }


    rect(
        x,
        y,
        toggleW,
        toggleH,
        toggleH / 2
    );


    fill(
        textColor
    );


    let knobD =
        toggleH - 6;


    let knobX =
        checked
            ? x +
              toggleW -
              knobD -
              3
            : x + 3;


    circle(
        knobX +
        knobD / 2,
        y +
        toggleH / 2,
        knobD
    );


    fill(
        textColor
    );


    textAlign(
        LEFT,
        CENTER
    );


    textSize(
        labelSize
    );


    text(
        label +
        (
            checked
                ? "  (ON)"
                : "  (OFF)"
        ),
        x +
        toggleW +
        15,
        y +
        toggleH / 2
    );
}


// ============================================================
// Settings panel
// ============================================================

function drawSettingsPanel() {

    let x =
        width * 0.50;

    let y = 120;

    let w =
        width * 0.46;

    let h =
        height * 0.74;


    stroke(
        255,
        140,
        0
    );


    strokeWeight(
        3
    );


    fill(
        panelColor
    );


    rect(
        x,
        y,
        w,
        h,
        15
    );


    noStroke();


    fill(
        textColor
    );


    textSize(
        headingSize
    );


    text(
        "Settings",
        x + w / 2,
        y + 40
    );


    textAlign(
        LEFT,
        CENTER
    );


    let left =
        x + 40;


    textSize(
        labelSize
    );


    // --------------------------------------------------------
    // Frequency
    // --------------------------------------------------------

    text(
        "Tuned Frequency (MHz):",
        left,
        y + 90
    );


    let freqLabelW =
        textWidth(
            "Tuned Frequency (MHz):"
        );


    freqSlider.position(
        left +
        freqLabelW +
        15,
        y + 80
    );


    freqSlider.size(
        140
    );


    text(
        freqSlider.value()
            .toFixed(3) +
        " MHz",
        left +
        freqLabelW +
        165,
        y + 90
    );


    // --------------------------------------------------------
    // Sample rate
    // --------------------------------------------------------

    text(
        "Sample Rate (MS/s):",
        left,
        y + 125
    );


    let srLabelW =
        textWidth(
            "Sample Rate (MS/s):"
        );


    sampleRateInput.position(
        left +
        srLabelW +
        15,
        y + 115
    );


    // --------------------------------------------------------
    // Packet threshold
    // --------------------------------------------------------

    text(
        "Packet Threshold:",
        left,
        y + 160
    );


    let thresholdLabelW =
        textWidth(
            "Packet Threshold:"
        );


    thresholdInput.position(
        left +
        thresholdLabelW +
        15,
        y + 150
    );


    // --------------------------------------------------------
    // Active processing
    // --------------------------------------------------------

    let activeToggles = [];


    if (fftEnabled)
        activeToggles.push(
            "FFT"
        );


    if (smoothingEnabled)
        activeToggles.push(
            "Smooth"
        );


    if (baselineEnabled)
        activeToggles.push(
            "Baseline"
        );


    if (noiseEnabled)
        activeToggles.push(
            "Noise"
        );


    if (packetDetectionEnabled)
        activeToggles.push(
            "Packet Detection"
        );


    text(
        "Active: " +
        (
            activeToggles.length
                ? activeToggles.join(
                    ", "
                )
                : "None"
        ),
        left,
        y + 195
    );


    // --------------------------------------------------------
    // FFT
    // --------------------------------------------------------

    drawToggleSwitch(
        left,
        y + 230,
        fftEnabled,
        "Apply FFT"
    );


    // --------------------------------------------------------
    // Smoothing
    // --------------------------------------------------------

    drawToggleSwitch(
        left,
        y + 290,
        smoothingEnabled,
        "Smooth Spectrum"
    );


    // --------------------------------------------------------
    // Baseline
    // --------------------------------------------------------

    drawToggleSwitch(
        left,
        y + 350,
        baselineEnabled,
        "Remove Baseline"
    );


    // --------------------------------------------------------
    // Noise
    // --------------------------------------------------------

    drawToggleSwitch(
        left,
        y + 410,
        noiseEnabled,
        "Estimate Noise"
    );


    // --------------------------------------------------------
    // Packet Detection
    // --------------------------------------------------------

    drawToggleSwitch(
        left,
        y + 470,
        packetDetectionEnabled,
        "Detect Packets"
    );
}


// ============================================================
// Run Capture button
// ============================================================

function drawRunCaptureButton() {

    let x = 40;

    let y =
        height * 0.64 +
        height * 0.22 +
        15;

    let w =
        width * 0.42;

    let h = 50;


    let hovering =
        mouseX >= x &&
        mouseX <=
            x + w &&
        mouseY >= y &&
        mouseY <=
            y + h;


    stroke(
        255,
        140,
        0
    );


    strokeWeight(
        3
    );


    if (
        hovering
    ) {

        fill(
            255,
            160,
            30
        );

    }
    else {

        fill(
            255,
            140,
            0
        );
    }


    rect(
        x,
        y,
        w,
        h,
        10
    );


    noStroke();


    fill(35);


    textAlign(
        CENTER,
        CENTER
    );


    textSize(
        labelSize
    );


    text(
        "Run TPMS Capture",
        x + w / 2,
        y + h / 2
    );
}


// ============================================================
// Generate mock TPMS capture
// ============================================================

function generateMockCapture() {

    let peakPos =
        random(
            0.40,
            0.60
        );


    let peakHeight =
        random(
            30,
            60
        );


    let noiseLevel =
        random(
            4,
            12
        );


    let width =
        random(
            7,
            15
        );


    return generateTPMSSpectrum(
        peakPos,
        peakHeight,
        noiseLevel,
        width
    );
}


// ============================================================
// Home button
// ============================================================

function drawHomeButton() {

    fill(
        panelColor
    );


    stroke(
        255,
        140,
        0
    );


    strokeWeight(
        2
    );


    rect(
        20,
        20,
        120,
        45,
        10
    );


    noStroke();


    fill(
        textColor
    );


    textAlign(
        CENTER,
        CENTER
    );


    textSize(
        labelSize
    );


    text(
        "← Home",
        80,
        42
    );
}


// ============================================================
// Settings button
// ============================================================

function drawSettingsButton() {

    let w = 120;

    let h = 45;


    let x =
        width -
        w -
        20;


    let y = 20;


    fill(
        panelColor
    );


    stroke(
        255,
        140,
        0
    );


    strokeWeight(
        2
    );


    rect(
        x,
        y,
        w,
        h,
        10
    );


    noStroke();


    fill(
        textColor
    );


    textAlign(
        CENTER,
        CENTER
    );


    textSize(
        labelSize
    );


    text(
        "Settings",
        x + w / 2,
        y + h / 2
    );
}


// ============================================================
// Mouse controls
// ============================================================

function mousePressed() {

    // --------------------------------------------------------
    // Home
    // --------------------------------------------------------

    if (
        mouseX >= 20 &&
        mouseX <= 140 &&
        mouseY >= 20 &&
        mouseY <= 65
    ) {

        playButtonClick();

        window.location.href =
            "../ui.html";
    }


    // --------------------------------------------------------
    // Settings button
    // --------------------------------------------------------

    let settingsBtnW =
        120;

    let settingsBtnH =
        45;


    let settingsBtnX =
        width -
        settingsBtnW -
        20;


    let settingsBtnY =
        20;


    if (
        mouseX >=
            settingsBtnX &&
        mouseX <=
            settingsBtnX +
            settingsBtnW &&
        mouseY >=
            settingsBtnY &&
        mouseY <=
            settingsBtnY +
            settingsBtnH
    ) {

        window.location.href =
            "settings.html";
    }


    // --------------------------------------------------------
    // Settings toggles
    // --------------------------------------------------------

    let settingsX =
        width * 0.50;


    let settingsY =
        120;


    let toggleX =
        settingsX + 40;


    let toggleW = 46;

    let toggleH = 24;


    // FFT

    if (
        mouseX >= toggleX &&
        mouseX <=
            toggleX +
            toggleW &&
        mouseY >=
            settingsY +
            230 &&
        mouseY <=
            settingsY +
            230 +
            toggleH
    ) {

        playButtonClick();

        fftEnabled =
            !fftEnabled;
    }


    // Smoothing

    if (
        mouseX >= toggleX &&
        mouseX <=
            toggleX +
            toggleW &&
        mouseY >=
            settingsY +
            290 &&
        mouseY <=
            settingsY +
            290 +
            toggleH
    ) {

        playButtonClick();

        smoothingEnabled =
            !smoothingEnabled;
    }


    // Baseline

    if (
        mouseX >= toggleX &&
        mouseX <=
            toggleX +
            toggleW &&
        mouseY >=
            settingsY +
            350 &&
        mouseY <=
            settingsY +
            350 +
            toggleH
    ) {

        playButtonClick();

        baselineEnabled =
            !baselineEnabled;
    }


    // Noise

    if (
        mouseX >= toggleX &&
        mouseX <=
            toggleX +
            toggleW &&
        mouseY >=
            settingsY +
            410 &&
        mouseY <=
            settingsY +
            410 +
            toggleH
    ) {

        playButtonClick();

        noiseEnabled =
            !noiseEnabled;
    }


    // Packet detection

    if (
        mouseX >= toggleX &&
        mouseX <=
            toggleX +
            toggleW &&
        mouseY >=
            settingsY +
            470 &&
        mouseY <=
            settingsY +
            470 +
            toggleH
    ) {

        playButtonClick();

        packetDetectionEnabled =
            !packetDetectionEnabled;
    }


    // --------------------------------------------------------
    // Spectrum arrows
    // --------------------------------------------------------

    let spectrumX = 40;

    let spectrumY = 120;

    let spectrumW =
        width * 0.42;

    let spectrumH =
        height * 0.48;


    // Left

    if (
        mouseX >= spectrumX &&
        mouseX <=
            spectrumX + 35 &&
        mouseY >=
            spectrumY +
            spectrumH -
            60 &&
        mouseY <=
            spectrumY +
            spectrumH
    ) {

        playButtonClick();

        spectrumIndex--;


        if (
            spectrumIndex < 0
        ) {

            spectrumIndex =
                spectrumNames.length - 1;
        }
    }


    // Right

    if (
        mouseX >=
            spectrumX +
            spectrumW -
            35 &&
        mouseX <=
            spectrumX +
            spectrumW &&
        mouseY >=
            spectrumY +
            spectrumH -
            60 &&
        mouseY <=
            spectrumY +
            spectrumH
    ) {

        playButtonClick();

        spectrumIndex++;


        if (
            spectrumIndex >=
            spectrumNames.length
        ) {

            spectrumIndex = 0;
        }
    }


    // --------------------------------------------------------
    // Run TPMS capture
    // --------------------------------------------------------

    let captureX = 40;


    let captureY =
        height * 0.64 +
        height * 0.22 +
        15;


    let captureW =
        width * 0.42;


    let captureH = 50;


    if (
        mouseX >= captureX &&
        mouseX <=
            captureX +
            captureW &&
        mouseY >= captureY &&
        mouseY <=
            captureY +
            captureH
    ) {

        playButtonClick();


        console.log(
            "Starting TPMS capture..."
        );


        console.log(
            "Frequency:",
            freqSlider.value(),
            "MHz"
        );


        console.log(
            "Sample Rate:",
            sampleRateInput.value(),
            "MS/s"
        );


        console.log(
            "Threshold:",
            thresholdInput.value()
        );


        // Generate simulated TPMS signal

        rawLiveCapture =
            generateMockCapture();


        processTPMSCapture(
            rawLiveCapture
        );


        applyTuning();


        if (
            !spectrumNames.includes(
                "Live"
            )
        ) {

            spectrumNames.push(
                "Live"
            );
        }


        spectrumIndex =
            spectrumNames.indexOf(
                "Live"
            );


        console.log(
            "TPMS packet detected:",
            packetDetected
        );


        console.log(
            "Signal strength:",
            signalStrength
        );


        console.log(
            "Noise:",
            estimatedNoise
        );


        console.log(
            "SNR:",
            calculateSNR(
                rawLiveCapture
            )
        );
    }
}


// ============================================================
// Window resize
// ============================================================

function windowResized() {

    resizeCanvas(
        windowWidth,
        windowHeight
    );
}

