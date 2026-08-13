// Read the saved setting.
// If nothing has been saved yet, dark mode is used.
let lightModeOn =
    localStorage.getItem("lightModeOn") === "true";
let largeTextOn =
    localStorage.getItem("largeTextOn") === "true";
let highContrastOn =
    localStorage.getItem("highContrastOn") === "true";
let buttonNoiseOn =
    localStorage.getItem("buttonNoiseOn") === "true";


let bgColor;
let panelColor;
let textColor;

let titleSize;
let headingSize;
let labelSize;
let smallSize;

let clickSound;

// Accent/theme color (the color that's used for panel borders, header,
// toggle "on" state, etc. — originally hardcoded orange).
let selectedThemeColor = { r: 255, g: 140, b: 0 }; // default: original orange

const themeOptions = [
    { name: "Orange",      r: 255, g: 140, b: 0   },
    { name: "Turquoise",   r: 64,  g: 224, b: 208 },
    { name: "Hot Pink",    r: 255, g: 105, b: 180 },
    { name: "Neon Green",  r: 57,  g: 255, b: 20  },
    { name: "Red",         r: 255, g: 0,   b: 0   },
    { name: "Lavender",    r: 180, g: 160, b: 255 }
];

// Call this once in setup() on every page.
function loadThemeColor() {
    let savedTheme = localStorage.getItem("themeColor");
    if (savedTheme) {
        selectedThemeColor = JSON.parse(savedTheme);
    }
}

// Call this whenever the user picks a new color (settings page only).
function saveThemeColor(colorObj) {
    selectedThemeColor = colorObj;
    localStorage.setItem("themeColor", JSON.stringify(selectedThemeColor));
}

function playButtonClick() {
    if (
        !buttonNoiseOn ||
        !clickSound ||
        !clickSound.isLoaded()
    ) {
        return;
    }

    // Browsers may suspend audio when a new page loads.
    userStartAudio()
        .then(() => {
            clickSound.play();
        })
        .catch(error => {
            console.error("Could not start audio:", error);
        });
}

function updateThemeColors() {
    if (highContrastOn) {
        if (lightModeOn) {
            bgColor = color(255);
            panelColor = color(245);
            textColor = color(0);
        } else {
            bgColor = color(0);
            panelColor = color(20);
            textColor = color(255);
        }
    } else {
        if (lightModeOn) {
            bgColor = color(235);
            panelColor = color(220);
            textColor = color(0);
        } else {
            bgColor = color(35);
            panelColor = color(55);
            textColor = color(255);
        }
    }
}

function saveLightMode(value) {
    lightModeOn = value;
    localStorage.setItem("lightModeOn", String(value));
}

function saveHighContrast(value) {
    highContrastOn = value;
    localStorage.setItem(
        "highContrastOn",
        String(value)
    );
}

function updateFontSizes() {

    if (largeTextOn) {
        titleSize = 40;
        headingSize = 34;
        labelSize = 22;
        smallSize = 16;
    }
    else {
        titleSize = 34;
        headingSize = 30;
        labelSize = 18;
        smallSize = 12;
    }
}

function saveLargeText(value) {
    largeTextOn = value;

    localStorage.setItem(
        "largeTextOn",
        String(value)
    );
}

function saveButtonNoise(value) {
    buttonNoiseOn = value;
    localStorage.setItem(
        "buttonNoiseOn",
        String(value)
    );
}