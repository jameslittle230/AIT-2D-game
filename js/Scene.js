"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.triangleGeometry = new TriangleGeometry(gl);

  this.timeAtLastFrame = new Date().getTime();

  this.trianglePosition = new Vec3(0, 1, 0);
  this.rotation = 0;
};

Scene.prototype.update = function(gl, keysPressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  if(this.keysPressed.W) {
    this.trianglePosition.add(0, 3*dt, 0);
  }

  if(this.keysPressed.A) {
    this.trianglePosition.add(-3*dt, 0, 0);
  }

  if(this.keysPressed.S) {
    this.trianglePosition.add(0, -3*dt, 0);
  }

  if(this.keysPressed.D) {
    this.trianglePosition.add(3*dt, 0, 0);
  }

  if(this.keysPressed.Q) {
    this.rotation += 1*dt;
  }

  if(this.keysPressed.E) {
    this.rotation += -1*dt;
  }

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition");
  const matrixLocation = gl.getUniformLocation(this.solidProgram.glProgram, "modelMatrix");

  if(trianglePositionLocation < 0 || matrixLocation < 0) {
    console.log("Could not find uniform");
  } else {
    const modelMatrix = new Mat4().rotate(this.rotation).translate(this.trianglePosition);
    this.trianglePosition.commit(gl, trianglePositionLocation);
    modelMatrix.commit(gl, matrixLocation);
  }

  // clear the screen
  gl.clearColor(0.3, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.solidProgram.commit();
  this.triangleGeometry.draw();

  // this.trianglePosition2.commit(gl, trianglePositionLocation)
  // gl.uniform1f(triangleScaleLocation, this.triangleScale2);
  // this.triangleGeometry.draw();
};


