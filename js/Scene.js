"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");

  this.buildHeartObject(gl);
  this.buildStarObject(gl);
  this.buildDiamondObject(gl);
  this.buildGemObject(gl);
  this.buildSquareObject(gl);
  // this.buildCircleObject(gl);

  this.timeAtLastFrame = new Date().getTime();

  this.elapsedTime = 0;

  this.board = [];
  this.selected = null;
  this.bombsLeft = 5;

  this.camera = new OrthoCamera();

  for(var i=0; i<10; i++) {
    var row = [];
    for(var j=0; j<10; j++) {
      var obj;
      var random = Math.floor((Math.random() * 5) + 1);
      if(random == 0) {
        obj = new GameObject(new Mesh(this.diamondGeometry, this.diamondMaterial), "diamond");
      } else if (random == 1) {
        obj = new GameObject(new Mesh(this.starGeometry, this.starMaterial), "star");
      } else if (random == 2) {
        obj = new GameObject(new Mesh(this.heartGeometry, this.heartMaterial), "heart");
      } else if (random == 3) {
        obj = new GameObject(new Mesh(this.gemGeometry, this.gemMaterial), "gem");
      } else if (random == 4) {
        obj = new GameObject(new Mesh(this.squareGeometry, this.squareMaterial), "square");
      } else {
        obj = new GameObject(new Mesh(this.diamondGeometry, this.diamondMaterial), "diamond");
      }
      obj.position.add(j, i, 0);
      row.push(obj);
    }
    this.board.push(row);
  }
};

Scene.prototype.update = function(gl, keysPressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.elapsedTime += dt;
  this.timeAtLastFrame = timeAtThisFrame;
  document.getElementById('overlay').innerHTML = this.elapsedTime.toFixed(2);

  // Heartbeat
  this.heartMaterial.color.set(Math.sin(2*this.elapsedTime) * 0.2 + 0.8, 57.0/255.0, 105.0/255.0);

  // Gyro
  for(var i=0; i<10; i++) {
    for(var j=0; j<10; j++) {
      if(this.board[i][j] !== null) {
        if(this.board[i][j].type === "star") {
            this.board[i][j].orientation += dt/2;
          }
        }
    }
  }

  // Clear screen
  gl.clearColor(255/255, 255/255, 255/255, 0.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw
  for(var i=0; i<10; i++) {
    for(var j=0; j<10; j++) {
      // this.board[i][j].position = new Vec3(j, i, 0);
      if(this.board[i][j] !== null) {
        this.board[i][j].draw(this.camera);
      }
    }
  }
};

Scene.prototype.normalizeClickCoords = function(x, y, round = true) {
  var clickVector = new Vec3(x, y, 0);
  var camInverse = this.camera.viewProjMatrix.clone().invert();
  clickVector = clickVector.xyz1times(camInverse);

  if(round) {
    clickVector.x = Math.round(clickVector.x);
    clickVector.y = Math.round(clickVector.y);
  }

  return clickVector;
}

Scene.prototype.dragStart = function(x, y) {
  var cv = this.normalizeClickCoords(x, y)

  if((0<=cv.x && cv.x<10) && (0<=cv.y && cv.y<10)) {
    this.selected = {
      x: cv.x,
      y: cv.y,
      space: this.board[cv.y][cv.x]
    };
    this.selected.space.isSelected = true;
  }
};

Scene.prototype.dragMove = function(x, y) {
  var cv = this.normalizeClickCoords(x, y, false)
  this.selected.space.position.set(cv.x, cv.y, 0.5);
}

Scene.prototype.dragEnd = function(x, y) {
  var cv = this.normalizeClickCoords(x, y)
  var x = cv.x;
  var y = cv.y;

  // Swap logic: if there's already a selected space, we might need to perform
  // a swap
  if(this.selected !== null) {

    var sx = this.selected.x;
    var sy = this.selected.y;

    // Check if selected space is adjacent: some tricky abs value logic here
    if((Math.abs(sx - x) === 1 && sy === y) ||
       (Math.abs(sy - y) === 1 && sx === x)) {

        // Swap spaces in memory
        var temp = this.selected.space;
        this.board[sy][sx] = this.board[y][x];
        this.board[y][x] = temp;

        if(!this.checkLegal()) {
          // Swap back
          var temp = this.board[sy][sx];
          this.board[sy][sx] = this.board[y][x];
          this.board[y][x] = temp;
        } else {
          this.board[y][x].position.set(x, y, 0.5);
          this.removeTriples();
        }
    }

    // Deselect space
    this.board[sy][sx].position.set(sx, sy, 0.5);
    this.selected.space.isSelected = false;
    this.selected = null;
  }
}

Scene.prototype.checkLegal = function() {
  for(var i=0; i<10; i++) {
    for(var j=0; j<7; j++) {
      if(this.board[i][j].type === this.board[i][j+1].type && this.board[i][j].type === this.board[i][j+2].type) {
        return true;
      }
    }
  }

  for(var i=0; i<7; i++) {
    for(var j=0; j<10; j++) {
      if(this.board[i][j].type === this.board[i+1][j].type && this.board[i][j].type === this.board[i+1][j].type) {
        return true;
      }
    }
  }

  return false;
}

Scene.prototype.removeTriples = function() {
  for(var i=0; i<10; i++) {
    for(var j=0; j<7; j++) {
      if(!this.board[i][j] || !this.board[i][j+1] || !this.board[i][j+2]) {
        continue;
      }

      if(this.board[i][j].type === this.board[i][j+1].type && this.board[i][j].type === this.board[i][j+2].type) {
        this.board[i][j] = null;
        this.board[i][j+1] = null;
        this.board[i][j+2] = null;
      }
    }
  }

  for(var i=0; i<7; i++) {
    for(var j=0; j<10; j++) {
      if(!this.board[i][j] || !this.board[i+1][j] || !this.board[i+1][j]) {
        continue;
      }

      if(this.board[i][j].type === this.board[i+1][j].type && this.board[i][j].type === this.board[i+1][j].type) {
        this.board[i][j] = null;
        this.board[i+1][j] = null;
        this.board[i+1][j] = null;
      }
    }
  }

  for(var a=0; a<10; a++) {
    for(var i=0; i<9; i++) {
      for(var j=0; j<10; j++) {
        if(this.board[i+1][j] === null) {
          this.board[i+1][j] = this.board[i][j];
          this.board[i][j] = null;
        }
      }
    }
  }

  return false;
}

Scene.prototype.bombAttempt = function(x, y) {
  var cv = this.normalizeClickCoords(x, y)
  if(this.bombsLeft > 0) {
    this.board[cv.y][cv.x] = null;
    this.bombsLeft--;
  }
}

/**
 * Build Objects
 */

Scene.prototype.buildHeartObject = function(gl) {
  this.heartFS = new Shader(gl, gl.FRAGMENT_SHADER, "heart_fs.essl");
  this.heartProgram = new Program(gl, this.vsIdle, this.heartFS);
  this.heartGeometry = new HeartGeometry(gl);
  this.heartMaterial = new Material(gl, this.heartProgram);
  this.heartMaterial.color.set(0.1, 0.4, 0.5);
}

Scene.prototype.buildStarObject = function(gl) {
  this.starProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.starGeometry = new StarGeometry(gl);
  this.starMaterial = new Material(gl, this.starProgram);
  this.starMaterial.solidColor.set(1, 0.8, 0);
}

Scene.prototype.buildDiamondObject = function(gl) {
  this.diamondProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.diamondGeometry = new DiamondGeometry(gl);
  this.diamondMaterial = new Material(gl, this.diamondProgram);
  this.diamondMaterial.solidColor.set(0.52,0.91,0.99);
}

Scene.prototype.buildGemObject = function(gl) {
  this.gemProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.gemGeometry = new GemGeometry(gl);
  this.gemMaterial = new Material(gl, this.gemProgram);
  this.gemMaterial.solidColor.set(0.66,0.99,0.45);
}

Scene.prototype.buildSquareObject = function(gl) {
  this.squareProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.squareGeometry = new SquareGeometry(gl);
  this.squareMaterial = new Material(gl, this.squareProgram);
  this.squareMaterial.solidColor.set(0.61,0.47,0.15);
}

Scene.prototype.buildCircleObject = function(gl) {
  this.circleProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.circleGeometry = new CircleGeometry(gl);
  this.circleMaterial = new Material(gl, this.circleProgram);
  this.circleMaterial.solidColor.set(1, 0.8, 0);
}