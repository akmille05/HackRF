let buttonNoiseOn = false;
let saveData = false;

function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");
}
function draw() {
    updateThemeColors();
    updateFontSizes();
    background(bgColor);


    drawHeader();
    drawHomeButton();
    drawAppearancePanel();
    drawAccessibilityPanel();
    drawNotificationsPanel();
    drawDataPanel();

}
function drawHeader() {

    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(titleSize);
    textAlign(CENTER,CENTER);
    text("Settings", width/2,45);
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

function mousePressed() {
    // Home button
    if (
        mouseX >= 20 &&
        mouseX <= 140 &&
        mouseY >= 20 &&
        mouseY <= 65
    ) {
        window.location.href = "../ui.html";
        return;
    }

    // Shared panel/button dimensions
    let x = 10;
    let y = 120;
    let w = width * 0.46;

    let toggleW = 60;
    let toggleH = 30;

    //------------------------------------
    // Light Mode toggle
    //------------------------------------

    let lightToggleX = x + w - 100;
    let lightToggleY = y + 72;

    if (
        mouseX >= lightToggleX &&
        mouseX <= lightToggleX + toggleW &&
        mouseY >= lightToggleY &&
        mouseY <= lightToggleY + toggleH
    ) {
        saveLightMode(!lightModeOn);
        return;
    }

    //------------------------------------
    // Large Text toggle
    //------------------------------------

    let largeTextToggleX = x + w - 100;
    let largeTextToggleY = y + 322;

    if (
        mouseX >= largeTextToggleX &&
        mouseX <= largeTextToggleX + toggleW &&
        mouseY >= largeTextToggleY &&
        mouseY <= largeTextToggleY + toggleH
    ) {
        saveLargeText(!largeTextOn);
        return;
    }
    //------------------------------------
    // High Contrast toggle
    //------------------------------------
    let highContrastToggleX = x + w - 100;
    let highContrastToggleY = y + 362;

    if (
        mouseX >= highContrastToggleX &&
        mouseX <= highContrastToggleX + toggleW &&
        mouseY >= highContrastToggleY &&
        mouseY <= highContrastToggleY + toggleH
    ) {
        saveHighContrast(!highContrastOn);
        return;
    }
}

function drawToggle(x, y, w, h, isOn) {
    // Switch background
    noStroke();

    if (isOn) {
        fill(255, 140, 0);
    } else {
        fill(90);
    }

    rect(x, y, w, h, h / 2);

    // Sliding circle
    fill(255);

    let circleX;

    if (isOn) {
        circleX = x + w - h / 2;
    } else {
        circleX = x + h / 2;
    }

    circle(circleX, y + h / 2, h - 6);
}

function drawAppearancePanel(){
    let x = 10;
    let y = 120;
    let w = width*0.46;
    let h = height*0.3;


    if (lightModeOn) {
        panelColor = color(220);   // light gray panels
        textColor = color(0);      // black text
    } else {
        panelColor = color(55);    // dark gray panels
        textColor = color(255);    // white text
    }

    //appearance
    stroke(255,140,0);
    strokeWeight(3);
    fill(panelColor);
    rect(x,y,w,h,15);
    noStroke();
    fill(textColor);
    textSize(headingSize);
    text("Appearance",x+w/2,y+30);
    textAlign(LEFT,CENTER);
    let left = x+40;
    let right = x+w+100;
    let inputX = x+230;
    fill(textColor);
    textSize(labelSize);
    text("Light mode:",left,y+90);
    drawToggle(x + w - 100, y + 72, 60, 30, lightModeOn);

}

function drawAccessibilityPanel(){


    let x = 10;
    let y = 120;
    let w = width*0.46;
    let h = height*0.3;
    let left = x+40;
    let right = x+w+100;
    let inputX = x+230;

    stroke(255,140,0);
    strokeWeight(3);
    fill(panelColor);
    rect(x,y+250,w,h,15);
    noStroke();
    fill(textColor);
    textSize(headingSize);
    textAlign(CENTER,CENTER);
    text("Accessibility",x+w/2,y+280);
    textAlign(LEFT,CENTER);
    fill(textColor);
    textSize(labelSize);

    text("Large Text:",left,y+340);

    let largeTextToggleX = x + w - 100;
    let largeTextToggleY = y + 322;
    let toggleW = 60;
    let toggleH = 30;

    drawToggle(
        largeTextToggleX,
        largeTextToggleY,
        toggleW,
        toggleH,
        largeTextOn
    );
    fill(textColor);


    text("High Contrast:",left,y+380);
    let highContrastToggleX = x + w - 100;
    let highContrastToggleY = y + 362;

    drawToggle(
        highContrastToggleX,
        highContrastToggleY,
        toggleW,
        toggleH,
        highContrastOn
    );
}

function drawNotificationsPanel(){
    

    let x = 10;
    let y = 120;
    let w = width*0.46;
    let h = height*0.3;
    let left = x+40;
    let right = x+w+100;
    let inputX = x+230;

    stroke(255,140,0);
    strokeWeight(3);
    fill(panelColor);
    rect(x+w+65,y,w,h,15);
    noStroke();
    fill(textColor);
    textSize(headingSize);
    textAlign(CENTER,CENTER);
    text("Notifications",x+w+65+w/2,y+30);
    textAlign(LEFT,CENTER);
    fill(textColor);
    textSize(labelSize);
    text("Button Noise:",right,y+90);
}

function drawDataPanel(){

    let x = 10;
    let y = 120;
    let w = width*0.46;
    let h = height*0.3;
    let left = x+40;
    let right = x+w+100;
    let inputX = x+230;

    stroke(255,140,0);
    strokeWeight(3);
    fill(panelColor);
    rect(x+w+65,y+250,w,h,15);
    noStroke();
    fill(textColor);
    textSize(headingSize);
    textAlign(CENTER,CENTER);
    text("Data",x+w+65+w/2,y+280);
    textAlign(LEFT,CENTER);
    fill(textColor);
    textSize(labelSize);
    text("Save Data to File:",right,y+340);



}