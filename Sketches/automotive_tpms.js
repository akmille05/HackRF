///FIXED VARIABLES
let frequency = 315e6;
let sampleRate = 2e6;

//USER INPUT VARIABLES
let lnaSlider;
let vgaSlider;
let triggerInput;



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

function draw() {
    background(35);

    drawHeader();
    drawRightPanel();
    drawLeftPanel();
    drawHomeButton();
}

//HEADER
function drawHeader() {
    noStroke();
    fill(255,140,0);
    rect(0,0,width,90);

    fill(255);
    textSize(34);
    text("Automotive TPMS Dashboard", width/2,45);
}

//HOME BUTTON
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

//BACK TO HOME PAGE IF HOME BUTTON IS CLICKED
function mousePressed(){

    if(mouseX >= 20 &&
       mouseX <= 140 &&
       mouseY >= 20 &&
       mouseY <= 65){

        window.location.href = "../ui.html";
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
    fill(255);
    text("VGA Gain:",left,y+270);
    vgaSlider.position(inputX - 70, y + 258);
    vgaSlider.size(150);

    textAlign(LEFT, CENTER);
    text(`${vgaSlider.value()} dB`, inputX + 95, y + 270);

    //------------------------------------
    //Trigger Multiplier
    //------------------------------------
    fill(255);
    text("Trigger Multiplier:",left,y+330);
    triggerInput.position(inputX, y + 315);


    //------------------------------------
    // Start Button
    //------------------------------------

    fill(255,140,0);

    rect(x+w/3.25,h+y-90,180,50,10);

    fill(255);

    textAlign(CENTER,CENTER);

    textSize(20);

    text("START",x+w/2,h+y-65);
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

    fill(55);
    rect(x,y,w,h,15);

    noStroke();

    fill(255);
    textSize(30);
    text("Burst Data",x+w/2,y+30);
    text("Tire ID",x+w/2,y+330);

    textAlign(LEFT,CENTER);

    let left = x+40;
    let inputX = x+230;

    fill(255);

    textSize(18);

    //line
    stroke(255,140,0);
    strokeWeight(2);
    line(x+20,y+300,x+w-20,y+300);
    line(x+360,y+60,x+360,y+h-170);

}