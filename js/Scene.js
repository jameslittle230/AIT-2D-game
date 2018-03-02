"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.heartGeometry = new HeartGeometry(gl);
  this.starGeometry = new StarGeometry(gl);

  this.timeAtLastFrame = new Date().getTime();

  this.material = new Material(gl, this.solidProgram);
  this.material.solidColor.set(0.2, 0.3, 0.8);

  this.material2 = new Material(gl, this.solidProgram);
  this.material2.solidColor.set(0.2, 0.3, 0.8);

  this.gameObjects = [];
  this.camera = new OrthoCamera();

  this.tri1 = new GameObject(new Mesh(this.heartGeometry, this.material));
  this.tri2 = new GameObject(new Mesh(this.starGeometry, this.material2));
  this.gameObjects.push(this.tri2);
  this.gameObjects.push(this.tri1);

  this.tri1.position.set(0.5, 0.5, 0);
  this.tri2.mesh.material.solidColor.set(172/225, 100/255, 227/255)
};

Scene.prototype.update = function(gl, keysPressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  if(this.keysPressed.W) { this.tri1.position.add( 0,     1*dt, 0); }
  if(this.keysPressed.A) { this.tri1.position.add(-1*dt,  0,    0); }
  if(this.keysPressed.S) { this.tri1.position.add( 0,    -1*dt, 0); }
  if(this.keysPressed.D) { this.tri1.position.add( 1*dt,  0,    0); }
  if(this.keysPressed.Q) { this.rotation += 1*dt; }
  if(this.keysPressed.E) { this.rotation += -1*dt; }
  if(this.keysPressed.Z) { this.scale += -1*dt; }
  if(this.keysPressed.C) { this.scale += 1*dt; }

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition");
  const matrixLocation = gl.getUniformLocation(this.solidProgram.glProgram, "modelMatrix");

  // Clear screen
  gl.clearColor(100/255, 227/255, 117/255, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(trianglePositionLocation < 0 || matrixLocation < 0) {
    console.log("Could not find uniform");
  } else {
    this.gameObjects.forEach(gameObj => {
      gameObj.draw();
    });
  }
};


