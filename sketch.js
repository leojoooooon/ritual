/*
  Final Project: Entropy Smear (Ultimate Smooth & Impact Edition)
  
  Features:
  1. MUSIC PLAYER: Click to play 'music.mp3' & enter Fullscreen.
  2. SMOOTH TRANSITION: Images crossfade and smears blend organically.
  3. LINEAR CHAOS: Distortion grows over time (60s) without resetting.
  4. HIGH IMPACT: Strong Bass Zoom & Extreme Stretch reacting to music.
*/

let song, fft;
let images = []; 
let audioStarted = false;

// TIMING VARIABLES
let startTime = 0;       // Global chaos timer
let lastSwitchTime = 0;  // Image cycle timer

// CONFIGURATION
const CHAOS_DURATION = 200;    // Time to reach max distortion
const CYCLE_DURATION = 20000; // Switch every 10 seconds
const TRANSITION_TIME = 3000; // Crossfade takes 3 seconds

// INDICES
let currentIdx = 0;
let nextIdx = 1;

function preload() {
     song = loadSound('jisi.wav');

  // 2. LOAD YOUR IMAGES
images[0] = loadImage('1.jpg');
  images[1] = loadImage('2.jpg');
  images[2] = loadImage('3.jpg');
  images[3] = loadImage('4.jpg');
  images[4] = loadImage('5.jpg');
  images[5] = loadImage('6.jpg');
  images[6] = loadImage('7.jpg');

}

function setup() {
  pixelDensity(1); 
  createCanvas(windowWidth, windowHeight);
  background(0);

  for (let img of images) {
    resizeToCover(img);
  }

  fft = new p5.FFT(0.8, 256); 
  fft.setInput(song); 

  textAlign(CENTER);
  textSize(20);
  fill(255);
  noStroke();
  text("CLICK", width/2, height/2);
}

function resizeToCover(img) {
  let aspect = img.width / img.height;
  let screenAspect = width / height;
  if (aspect > screenAspect) img.resize(0, height);
  else img.resize(width, 0);
}

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    song.loop(); // Loop the music
    audioStarted = true;
    
    // Start timers
    startTime = millis(); 
    lastSwitchTime = millis();
    
    fullscreen(true);
  }
}

function draw() {
  if (!audioStarted) return;

  let now = millis();

  // --- 1. CALCULATE TIMING & TRANSITION ---
  
  // A. Global Chaos (0.0 to 1.0)
  let totalElapsed = (now - startTime) / 1000.0;
  let chaos = constrain(map(totalElapsed, 0, CHAOS_DURATION, 0, 1), 0, 1);

  // B. Image Cycle & Transition Progress
  let timeInCycle = now - lastSwitchTime;
  let transitionProgress = 0; // 0 = Only Current, 1 = Only Next
  
  // Start transition closer to the end of the cycle
  if (timeInCycle > (CYCLE_DURATION - TRANSITION_TIME)) {
    let fadeTime = timeInCycle - (CYCLE_DURATION - TRANSITION_TIME);
    transitionProgress = map(fadeTime, 0, TRANSITION_TIME, 0, 1);
  }

  // Swap Images when cycle is done
  if (timeInCycle > CYCLE_DURATION) {
    currentIdx = nextIdx;
    nextIdx = (nextIdx + 1) % images.length;
    lastSwitchTime = now;
    transitionProgress = 0;
  }

  // --- 2. AUDIO ANALYSIS ---
  fft.analyze();
  let mid = fft.getEnergy("mid"); 
  let bass = fft.getEnergy("bass");

  // --- 3. BACKGROUND (Accumulation) ---
  let fadeSpeed = map(chaos, 0, 1, 20, 2) + map(bass, 0, 255, 0, 10); 
  noStroke();
  fill(0, fadeSpeed);
  rect(0, 0, width, height);

  // --- 4. GHOST LAYER (Crossfade + Pulse) ---
  push();
  translate(width/2, height/2);
  
  // Bass Zoom
  let beatZoom = map(bass, 0, 255, 1.0, 1.15); 
  scale(beatZoom);
  
  let refreshAlpha = map(chaos, 0, 1, 60, 10); 
  imageMode(CENTER);

  // Draw Current Image (Fading Out)
  tint(255, refreshAlpha * (1 - transitionProgress));
  image(images[currentIdx], 0, 0, width, height);

  // Draw Next Image (Fading In) - Only if transitioning
  if (transitionProgress > 0) {
    tint(255, refreshAlpha * transitionProgress);
    image(images[nextIdx], 0, 0, width, height);
  }
  pop();

  // --- 5. SMEAR EFFECT (Mixed Sampling) ---
  
  let stripCount = floor(map(bass, 0, 255, 5, 60)) + floor(chaos * 50);

  for (let i = 0; i < stripCount; i++) {
    
    // SMOOTH TRANSITION LOGIC:
    // Randomly choose which image to sample from based on progress.
    // Early transition: Mostly Current Image. Late transition: Mostly Next Image.
    let targetImg;
    if (random(1) < transitionProgress) {
      targetImg = images[nextIdx];
    } else {
      targetImg = images[currentIdx];
    }

    let sourceX = random(targetImg.width);
    let stripW = random(1, 4); 
    let sourceY = random(targetImg.height);
    let stripH = random(5, targetImg.height / 4);

    let drawX = random(width);
    
    // Stretch Logic
    let chaosStretch = map(chaos, 0, 1, 50, 800); 
    let audioStretch = map(mid, 0, 255, 0, 600); // Extreme music stretch
    let totalW = chaosStretch + audioStretch;

    // Alpha Logic
    let alpha = map(mid, 0, 255, 20, 100) + (chaos * 20);
    
    tint(255, alpha);
    blendMode(BLEND); 
    
    let driftY = sin(frameCount * 0.01 + i) * (chaos * 20);
    let imgStrip = targetImg.get(sourceX, sourceY, stripW, stripH);
    
    imageMode(CORNER); 
    image(imgStrip, drawX - totalW/2, sourceY + driftY, totalW, stripH);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let img of images) {
    resizeToCover(img);
  }
  background(0);
}