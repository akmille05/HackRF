let saveData = false;

// Theme color state (selectedThemeColor, themeOptions, loadThemeColor,
// saveThemeColor) now lives in theme.js — include that script before
// this one on every page.
let themeToggleOn = false;

// function preload() {
//     clickSound = loadSound("../Sounds/click.wav");
// }

function setup() {
    createCanvas(windowWidth, windowHeight);

    rectMode(CORNER);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    saveData = localStorage.getItem("saveData") === "true";

    loadThemeColor();

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
    fill(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
    rect(0,0,width,90);

    fill(255);
    textSize(titleSize);
    textAlign(CENTER,CENTER);
    text("Settings", width/2,45);
}
function drawHomeButton(){

    fill(panelColor);
    stroke(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
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
        playButtonClick();
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
        playButtonClick();
        saveLightMode(!lightModeOn);
        return;
    }

    //------------------------------------
    // Theme toggle
    //------------------------------------

    let themeToggleX = x + w - 100;
    let themeToggleY = y + 112;

    if (
        mouseX >= themeToggleX &&
        mouseX <= themeToggleX + toggleW &&
        mouseY >= themeToggleY &&
        mouseY <= themeToggleY + toggleH
    ) {
        playButtonClick();
        themeToggleOn = !themeToggleOn;
        return;
    }

    //------------------------------------
    // Theme color choices (only clickable when dropdown is open)
    //------------------------------------

    if (themeToggleOn) {
        let swatchStartX = x + 40;
        let swatchStartY = y + 160;
        let swatchSize = 32;
        let swatchSpacing = 45;

        for (let i = 0; i < themeOptions.length; i++) {
            let sx = swatchStartX + i * swatchSpacing;

            if (
                mouseX >= sx &&
                mouseX <= sx + swatchSize &&
                mouseY >= swatchStartY &&
                mouseY <= swatchStartY + swatchSize
            ) {
                playButtonClick();

                saveThemeColor({
                    r: themeOptions[i].r,
                    g: themeOptions[i].g,
                    b: themeOptions[i].b
                });

                themeToggleOn = false;
                return;
            }
        }
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
        playButtonClick();
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
        playButtonClick();
        saveHighContrast(!highContrastOn);
        return;
    }

    //------------------------------------
    // Button Noise toggle
    //------------------------------------
    let buttonNoiseToggleX = x + w + 550;
    let buttonNoiseToggleY = y + 72;

    if (
        mouseX >= buttonNoiseToggleX &&
        mouseX <= buttonNoiseToggleX + toggleW &&
        mouseY >= buttonNoiseToggleY &&
        mouseY <= buttonNoiseToggleY + toggleH
    ) {
        saveButtonNoise(!buttonNoiseOn);
        return;
    }

    //------------------------------------
    // Save Data toggle
    //------------------------------------

    let saveDataToggleX = x + w + 550;
    let saveDataToggleY = y + 322;

    if (
        mouseX >= saveDataToggleX &&
        mouseX <= saveDataToggleX + toggleW &&
        mouseY >= saveDataToggleY &&
        mouseY <= saveDataToggleY + toggleH
    ) {
        playButtonClick();

        saveData = !saveData;

        localStorage.setItem(
            "saveData",
            saveData
        );

        return;
    }
}

function drawToggle(x, y, w, h, isOn) {
    // Switch background
    noStroke();

    if (isOn) {
        fill(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
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

function drawThemeDropdown(x, y) {
    let swatchStartX = x + 40;
    let swatchStartY = y + 160;
    let swatchSize = 32;
    let swatchSpacing = 45;

    for (let i = 0; i < themeOptions.length; i++) {
        let opt = themeOptions[i];
        let sx = swatchStartX + i * swatchSpacing;

        let isSelected =
            selectedThemeColor.r === opt.r &&
            selectedThemeColor.g === opt.g &&
            selectedThemeColor.b === opt.b;

        if (isSelected) {
            stroke(255);
            strokeWeight(3);
        } else {
            noStroke();
        }

        fill(opt.r, opt.g, opt.b);
        rect(sx, swatchStartY, swatchSize, swatchSize, 6);
    }

    noStroke();
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
    stroke(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
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

    fill(textColor);
    text("Theme:",left,y+130);
    drawToggle(x + w - 100, y + 112, 60, 30, themeToggleOn);

    if (themeToggleOn) {
        drawThemeDropdown(x, y);
    }

}

function drawAccessibilityPanel(){


    let x = 10;
    let y = 120;
    let w = width*0.46;
    let h = height*0.3;
    let left = x+40;
    let right = x+w+100;
    let inputX = x+230;

    stroke(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
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

    stroke(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
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

    let buttonNoiseToggleX = x + w + 550;
    let buttonNoiseToggleY = y + 72;
    let toggleW = 60;
    let toggleH = 30;

    drawToggle(
        buttonNoiseToggleX,
        buttonNoiseToggleY,
        toggleW,
        toggleH,
        buttonNoiseOn
    );
}

function drawDataPanel(){

    let x = 10;
    let y = 120;
    let w = width * 0.46;
    let h = height * 0.3;

    let right = x + w + 100;

    stroke(selectedThemeColor.r, selectedThemeColor.g, selectedThemeColor.b);
    strokeWeight(3);
    fill(panelColor);

    rect(x + w + 65, y + 250, w, h, 15);

    noStroke();
    fill(textColor);

    textSize(headingSize);
    textAlign(CENTER, CENTER);

    text(
        "Data",
        x + w + 65 + w / 2,
        y + 280
    );

    textAlign(LEFT, CENTER);

    fill(textColor);
    textSize(labelSize);

    text(
        "Save Data to File:",
        right,
        y + 340
    );

    // Save Data toggle
    let saveDataToggleX = x + w + 550;
    let saveDataToggleY = y + 322;

    drawToggle(
        saveDataToggleX,
        saveDataToggleY,
        60,
        30,
        saveData
    );
}