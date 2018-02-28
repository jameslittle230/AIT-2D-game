"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.triangleGeometry = new TriangleGeometry(gl);

  this.timeAtLastFrame = new Date().getTime();

  this.trianglePosition = new Vec3(0.2, 0.3, 0);
  this.rotation = 0;
  this.scale = -0.5;

  Object.defineProperty(Material, "solidColor", {value: new Vec3()});

  this.material = new Material(gl, this.solidProgram);
  this.material.solidColor.set(0.2, 0.3, 0.8);

  this.material2 = new Material(gl, this.solidProgram);
  this.material2.solidColor.set(0.7, 0.44, 0.3);
};

Scene.prototype.update = function(gl, keysPressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  if(this.keysPressed.W) { this.trianglePosition.add( 0,     1*dt, 0); }
  if(this.keysPressed.A) { this.trianglePosition.add(-1*dt,  0,    0); }
  if(this.keysPressed.S) { this.trianglePosition.add( 0,    -1*dt, 0); }
  if(this.keysPressed.D) { this.trianglePosition.add( 1*dt,  0,    0); }
  if(this.keysPressed.Q) { this.rotation += 1*dt; }
  if(this.keysPressed.E) { this.rotation += -1*dt; }
  if(this.keysPressed.Z) { this.scale += -1*dt; }
  if(this.keysPressed.C) { this.scale += 1*dt; }

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition");
  const matrixLocation = gl.getUniformLocation(this.solidProgram.glProgram, "modelMatrix");

  // Clear screen
  gl.clearColor(1, 0.62, 0.94, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(trianglePositionLocation < 0 || matrixLocation < 0) {
    console.log("Could not find uniform");
  } else {
    var modelMatrix = new Mat4()
      .rotate(this.rotation)
      .scale(Math.pow(3, this.scale))
      .translate(this.trianglePosition);
    this.material.commit(); // this has to be before the matrix.commit line: https://stackoverflow.com/a/14416423/3841018
    modelMatrix.commit(gl, matrixLocation);
    this.triangleGeometry.draw();

    modelMatrix = new Mat4()
      .rotate(this.rotation)
      .scale(Math.pow(3, this.scale))
      .translate(this.trianglePosition)
      .translate(0.3, 0.3);
    this.material2.commit()
    modelMatrix.commit(gl, matrixLocation);
    this.triangleGeometry.draw();
  }
};


