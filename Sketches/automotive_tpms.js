///FIXED VARIABLES
let frequency = 315e6;
let sampleRate = 2e6;

//USER INPUT VARIABLES
let lnaSlider;
let vgaSlider;
let triggerInput;

//for graph
let amplitudeHistory = [];
let maxGraphPoints = 200;
let graphRunning = false;

// Temporary test value
let currentAmplitude = 5;
let lastAmplitudeUpdate = 0;
let graphUpdateInterval = 100;

function preload() {
    clickSound = loadSound("../Sounds/click.wav");
}


function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    lnaSlider = createSlider(0, 40, 32, 8);
    vgaSlider = createSlider(0, 62, 20, 2);
    lnaSlider.style("accent-color", "rgb(255, 140, 0)");
    vgaSlider.style("accent-color", "rgb(255, 140, 0)");

    triggerInput = createInput("2.0");   // default value

    triggerInput.size(80);

    triggerInput.style("background", "#232323");
    triggerInput.style("color", "white");
    triggerInput.style("border", "2px solid rgb(255,140,0)");
    triggerInput.style("font-family", "Orbitron");
    triggerInput.style("font-size", "16px");
}

function updateInputTheme() {
    if (lightModeOn) {
        triggerInput.style("background", "#eeeeee");
        triggerInput.style("color", "black");
    } else {
        triggerInput.style("background", "#232323");
        triggerInput.style("color", "white");
    }

    triggerInput.style("border", "2px solid rgb(255,140,0)");
    triggerInput.style("font-family", "Orbitron");
    triggerInput.style("font-size", "16px");
}

function draw() {
    updateThemeColors();
    updateInputTheme();
    updateFontSizes();
    background(bgColor);

    // Add one simulated amplitude point every 100 milliseconds
    if (graphRunning &&millis() - lastAmplitudeUpdate >= graphUpdateInterval) {
        currentAmplitude = 5 + random(-0.15, 0.15);

        // Occasionally create a fake RF spike
        if (random() < 0.05) {
            currentAmplitude += random(2, 4);
        }

        addAmplitudePoint(currentAmplitude);

        lastAmplitudeUpdate = millis();
    }
    drawHeader();
    drawRightPanel();
    drawLeftPanel();
    drawHomeButton();
}

function addAmplitudePoint(amplitude) {
    let numericAmplitude = Number(amplitude);

    if (!Number.isFinite(numericAmplitude)) {
        return;
    }

    amplitudeHistory.push(numericAmplitude);

    if (amplitudeHistory.length > maxGraphPoints) {
        amplitudeHistory.shift();
    }
}

//HEADER
function drawHeader() {
    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(titleSize);
    text("Automotive TPMS Dashboard", width/2,45);
}

//HOME BUTTON
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

//BACK TO HOME PAGE IF HOME BUTTON IS CLICKED
function mousePressed(){
    //home button
    if(mouseX >= 20 &&
       mouseX <= 140 &&
       mouseY >= 20 &&
       mouseY <= 65){
        playButtonClick();
        window.location.href = "../ui.html";
    }

    //start/stop button
    let x = width * 0.60;
    let y = 120;
    let w = width * 0.35;
    let h = height * 0.74;

    let buttonX = x + w / 11;
    let buttonY = h + y - 90;
    let buttonW = 180;
    let buttonH = 50;

    // Start/stop button click
    if (
        mouseX >= buttonX &&
        mouseX <= buttonX + buttonW &&
        mouseY >= buttonY &&
        mouseY <= buttonY + buttonH
    ) {
        playButtonClick();
        graphRunning = !graphRunning;

        // Prevent an old timer value from causing an immediate update
        lastAmplitudeUpdate = millis();
    }

    // Clear button dimensions
    let clearButtonX = buttonX + 200;
    let clearButtonY = buttonY;
    let clearButtonW = 180;
    let clearButtonH = 50;

    // Clear graph
    if (
        mouseX >= clearButtonX &&
        mouseX <= clearButtonX + clearButtonW &&
        mouseY >= clearButtonY &&
        mouseY <= clearButtonY + clearButtonH
    ) {
        playButtonClick();
        amplitudeHistory = [];
        currentAmplitude = 5;
        lastAmplitudeUpdate = millis();
        return;
    }

}

//RIGHT SIDE PANEL
function drawRightPanel(){

    let x = width*0.60;
    let y = 120;
    let w = width*0.35;
    let h = height*0.74;

    stroke(255,140,0);
    strokeWeight(3);

    fill(panelColor);
    rect(x,y,w,h,15);

    noStroke();

    fill(textColor);
    textSize(headingSize);
    text("Settings",x+w/2,y+30);

    textAlign(LEFT,CENTER);

    let left = x+40;
    let inputX = x+230;

    fill(textColor);

    textSize(labelSize);

    //------------------------------------
    // Frequency
    //------------------------------------

    text("Frequency (Hz): 315 mHz",left,y+90);

    //------------------------------------
    // Sample Rate
    //------------------------------------

    text("Sample Rate: 2 MS/s",left,y+150);

    //------------------------------------
    // LNA Gain
    //------------------------------------

    text("LNA Gain:",left,y+210);
    lnaSlider.position(inputX - 70, y + 198);
    lnaSlider.size(150);

    textAlign(LEFT, CENTER);
    text(`${lnaSlider.value()} dB`, inputX + 95, y + 210);

    //------------------------------------
    // VGA Gain
    //------------------------------------
    fill(textColor);
    text("VGA Gain:",left,y+270);
    vgaSlider.position(inputX - 70, y + 258);
    vgaSlider.size(150);

    textAlign(LEFT, CENTER);
    text(`${vgaSlider.value()} dB`, inputX + 95, y + 270);

    //------------------------------------
    //Trigger Multiplier
    //------------------------------------
    fill(textColor);
    text("Trigger Multiplier:",left,y+330);
    triggerInput.position(inputX, y + 315);


    //------------------------------------
    // Start Button
    //------------------------------------

    let buttonX = x + w / 11;
    let buttonY = y + h - 90;
    let buttonW = 180;
    let buttonH = 50;

    fill(255, 140, 0);
    rect(buttonX, buttonY, buttonW, buttonH, 10);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(labelSize);

    if (graphRunning) {
        text(
            "STOP",
            buttonX + buttonW / 2,
            buttonY + buttonH / 2
        );
    } else {
        text(
            "START",
            buttonX + buttonW / 2,
            buttonY + buttonH / 2
        );
    }

    //------------------------------------
    //Clear Button
    //------------------------------------

    let clearButtonX = buttonX + 200;
    let clearButtonY = buttonY;
    let clearButtonW = 180;
    let clearButtonH = 50;

    fill(panelColor);
    stroke(255, 140, 0);
    strokeWeight(2);

    rect(
        clearButtonX,
        clearButtonY,
        clearButtonW,
        clearButtonH,
        10
    );

    noStroke();
    fill(textColor);
    textAlign(CENTER, CENTER);
    textSize(labelSize);

    text(
        "CLEAR GRAPH",
        clearButtonX + clearButtonW / 2,
        clearButtonY + clearButtonH / 2
    );
}

//INPUTS
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


//LEFT SIDE PANEL
function drawLeftPanel(){
    let x = width*0.03;
    let y = 120;
    let w = width*0.55;
    let h = height*0.74;

    stroke(255,140,0);
    strokeWeight(3);

    fill(panelColor);
    rect(x,y,w,h,15);

    noStroke();

    fill(textColor);
    textSize(headingSize);
    text("Burst Data",x+w/2,y+30);
    text("Tire ID",x+w/2,y+330);

    textAlign(LEFT,CENTER);

    let left = x+40;
    let inputX = x+230;

    fill(255);

    textSize(labelSize);

    //line
    stroke(255,140,0);
    strokeWeight(2);
    line(x+20,y+300,x+w-20,y+300);
    //line(x+360,y+60,x+360,y+h-170);

    let graphX = x + 60;
    let graphY = y + 70;
    let graphW = w - 100;
    let graphH = 200;

    drawAmplitudeGraph(graphX, graphY, graphW, graphH);

}

//DRAW GRAPH
function drawAmplitudeGraph(graphX, graphY, graphW, graphH) {
    // Graph background
    stroke(255, 140, 0);
    strokeWeight(1);
    fill(bgColor);
    rect(graphX, graphY, graphW, graphH);

    // Horizontal grid lines
    stroke(90);
    strokeWeight(1);

    for (let i = 0; i <= 4; i++) {
        let lineY = graphY + (graphH / 4) * i;
        line(graphX, lineY, graphX + graphW, lineY);
    }

    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
        let lineX = graphX + (graphW / 5) * i;
        line(lineX, graphY, lineX, graphY + graphH);
    }

    // Axis labels
    noStroke();
    fill(textColor);
    textSize(smallSize);

    textAlign(CENTER, TOP);
    text("Time", graphX + graphW / 2, graphY + graphH + 8);

    push();
    translate(graphX - 30, graphY + graphH / 2);
    rotate(-HALF_PI);
    textAlign(CENTER, CENTER);
    text("Amplitude", 0, 0);
    pop();

    if (amplitudeHistory.length < 2) {
        return;
    }

    // Choose the visible amplitude range
    let minimumAmplitude = 0;
    let maximumAmplitude = 10;

    // Draw amplitude line
    noFill();
    stroke(255, 140, 0);
    strokeWeight(2);

    beginShape();

    for (let i = 0; i < amplitudeHistory.length; i++) {
        let pointX = map(
            i,
            0,
            maxGraphPoints - 1,
            graphX,
            graphX + graphW
        );

        let pointY = map(
            amplitudeHistory[i],
            minimumAmplitude,
            maximumAmplitude,
            graphY + graphH,
            graphY
        );

        pointY = constrain(pointY, graphY, graphY + graphH);

        vertex(pointX, pointY);
    }

    endShape();

    // Display latest amplitude
    noStroke();
    fill(textColor);
    textAlign(RIGHT, TOP);
    textSize(smallSize);

    let latestAmplitude =
        amplitudeHistory[amplitudeHistory.length - 1];

    text(
        `Current Amplitude: ${latestAmplitude.toFixed(2)}`,
        graphX + graphW - 8,
        graphY + 8
    );
}