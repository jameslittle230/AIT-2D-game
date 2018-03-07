"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");

  this.buildHeartObject(gl);
  this.buildStarObject(gl);
  // this.buildDiamondObject(gl);
  // this.buildGemObject(gl);
  // this.buildSquareObject(gl);

  this.timeAtLastFrame = new Date().getTime();

  this.elapsedTime = 0;

  this.board = [];
  this.selected = null;

  this.camera = new OrthoCamera();

  for(var i=0; i<10; i++) {
    var row = [];
    for(var j=0; j<10; j++) {
      var obj;
      var random = Math.floor((Math.random() * 7) + 1);
      if(j%2 == i%2) {
        obj = new GameObject(new Mesh(this.heartGeometry, this.heartMaterial), "heart");
      } else {
        obj = new GameObject(new Mesh(this.starGeometry, this.starMaterial), "star");
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
      if(this.board[i][j].mesh.geometry === this.starGeometry) {
        this.board[i][j].orientation += dt/2;
      }
    }
  }

  // Clear screen
  gl.clearColor(255/255, 255/255, 255/255, 0.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for(var i=0; i<10; i++) {
    for(var j=0; j<10; j++) {
      // this.board[i][j].position = new Vec3(j, i, 0);
      this.board[i][j].draw(this.camera);
    }
  }
};

Scene.prototype.dragStart = function(x, y) {
  // Take click coordinates (in [-1, 1], y upwards) and normalize to camera
  var clickVector = new Vec3(x, y, 0);
  var camInverse = this.camera.viewProjMatrix.clone().invert();
  clickVector = clickVector.xyz1times(camInverse);
  var x = Math.round(clickVector.x);
  var y = Math.round(clickVector.y);

  console.log(x, y);

  if((0<=x && x<10) && (0<=y && y<10)) {
    this.selected = {
      x: x,
      y: y,
      space: this.board[y][x]
    };
    this.selected.space.isSelected = true;
  }
};

Scene.prototype.dragMove = function(x, y) {
  // Take click coordinates (in [-1, 1], y upwards) and normalize to camera
  var clickVector = new Vec3(x, y, 0);
  var camInverse = this.camera.viewProjMatrix.clone().invert();
  clickVector = clickVector.xyz1times(camInverse);
  var x = clickVector.x;
  var y = clickVector.y;

  this.selected.space.position.set(x, y, 0.5);
}

Scene.prototype.dragEnd = function(x, y) {
  // Take click coordinates (in [-1, 1], y upwards) and normalize to camera
  var clickVector = new Vec3(x, y, 0);
  var camInverse = this.camera.viewProjMatrix.clone().invert();
  clickVector = clickVector.xyz1times(camInverse);
  var x = Math.round(clickVector.x);
  var y = Math.round(clickVector.y);

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
        }

        this.board[y][x].position.set(x, y, 0.5);
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
