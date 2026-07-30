let photoFiles = [];
let loadedImages = [];
let sourceTiles = []; 
let displayTiles = []; 
let tileSize = 25; // how detailed we want the mosaic

let isReady = false; 
let loadingText = "Loading and slicing up photos...";

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(20);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  imageMode(CENTER); // draw from the center for easier scaling/rotation

  // fetch the list of images from our local node server
  fetch('/api/photos')
    .then(res => res.json())
    .then(files => {
      photoFiles = files;
      loadAllImages();
    })
    .catch(err => {
      console.error(err);
      loadingText = "Backend error. Is server.js running?";
    });
}

function loadAllImages() {
  if (photoFiles.length === 0) {
    loadingText = "No photos found. Drop some in the 'photos' folder!";
    return;
  }

  let loadedCount = 0;
  photoFiles.forEach(file => {
    loadImage(`/photos/${file}`, img => {
      // scale down to save memory, 400px width is usually enough for slicing
      img.resize(400, 0); 
      loadedImages.push(img);
      loadedCount++;

      // once all are loaded, move to the next step
      if (loadedCount === photoFiles.length) {
        processAndSliceImages();
      }
    });
  });
}

function processAndSliceImages() {
  loadingText = "Generating random mosaic...";
  
  // go through every loaded image and chop it into little squares
  for (let img of loadedImages) {
    for (let y = 0; y < img.height; y += tileSize) {
      for (let x = 0; x < img.width; x += tileSize) {
        // grab the chunk and store it
        let tileImg = img.get(x, y, tileSize, tileSize);
        sourceTiles.push(tileImg);
      }
    }
  }

  // do the initial layout
  buildInteractiveGrid();
  isReady = true; 
}

function buildInteractiveGrid() {
  displayTiles = [];
  let cols = Math.ceil(width / tileSize);
  let rows = Math.ceil(height / tileSize);
  
  // shuffle the pool of tiles so it's completely random every time
  shuffle(sourceTiles, true);
  
  let sourceIndex = 0;
  
  // fill up the entire screen grid
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      // loop back if we run out of tiles to ensure the screen is covered
      let tileImg = sourceTiles[sourceIndex % sourceTiles.length];
      
      let originX = x * tileSize + tileSize / 2;
      let originY = y * tileSize + tileSize / 2;
      
      displayTiles.push({
        img: tileImg,
        originX: originX,     
        originY: originY,
        currentX: originX,    
        currentY: originY,
        scale: 1              
      });
      
      sourceIndex++;
    }
  }
}

// re-roll the layout every time the user clicks
function mousePressed() {
  if (isReady && sourceTiles.length > 0) {
    buildInteractiveGrid();
  }
}

function draw() {
  background(10);

  if (!isReady) {
    fill(255);
    text(loadingText, width / 2, height / 2);
    return;
  }

  // physics and rendering for each tile
  for (let tile of displayTiles) {
    let d = dist(mouseX, mouseY, tile.originX, tile.originY);
    let interactionRadius = 120; 
    
    if (d < interactionRadius) {
      // push the tile away if the mouse gets close
      let angle = atan2(tile.originY - mouseY, tile.originX - mouseX);
      let force = map(d, 0, interactionRadius, 60, 0); 
      
      let targetX = tile.originX + cos(angle) * force;
      let targetY = tile.originY + sin(angle) * force;
      
      // ease into the new pushed position and scale up slightly
      tile.currentX = lerp(tile.currentX, targetX, 0.2);
      tile.currentY = lerp(tile.currentY, targetY, 0.2);
      tile.scale = lerp(tile.scale, 1.5, 0.2); 
    } else {
      // snap back to original position smoothly
      tile.currentX = lerp(tile.currentX, tile.originX, 0.1);
      tile.currentY = lerp(tile.currentY, tile.originY, 0.1);
      tile.scale = lerp(tile.scale, 1.0, 0.1);
    }
    
    // draw the tile
    push();
    translate(tile.currentX, tile.currentY);
    scale(tile.scale);
    image(tile.img, 0, 0, tileSize, tileSize);
    pop();
  }
}

// recalculate grid if the window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (isReady && sourceTiles.length > 0) {
    buildInteractiveGrid();
  }
}