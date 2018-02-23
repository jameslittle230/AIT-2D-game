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

  this.orbiters = 5
};

Scene.prototype.update = function(gl, keysPressed) {
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  if(this.keysPressed.W) {
    this.trianglePosition.add(0, 1*dt, 0);
  }

  if(this.keysPressed.A) {
    this.trianglePosition.add(-1*dt, 0, 0);
  }

  if(this.keysPressed.S) {
    this.trianglePosition.add(0, -1*dt, 0);
  }

  if(this.keysPressed.D) {
    this.trianglePosition.add(1*dt, 0, 0);
  }

  if(this.keysPressed.Q) {
    this.rotation += 1*dt;
  }

  if(this.keysPressed.E) {
    this.rotation += -1*dt;
  }

  if(this.keysPressed.Z) {
    this.scale += -1*dt;
  }

  if(this.keysPressed.C) {
    this.scale += 1*dt;
  }

  if(this.keysPressed.R) {
    this.orbiters += 1;
  }

  if(this.keysPressed.F) {
    this.orbiters -= 1;
  }

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition");
  const matrixLocation = gl.getUniformLocation(this.solidProgram.glProgram, "modelMatrix");
  const brightnessLocation = gl.getUniformLocation(this.solidProgram.glProgram, "brightness");

  // Clear screen
  gl.clearColor(0.3, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if(trianglePositionLocation < 0 || matrixLocation < 0 || brightnessLocation < 0) {
    console.log("Could not find uniform");
  } else {
    const modelMatrix = new Mat4()
      .rotate(this.rotation)
      .scale(Math.pow(3, this.scale))
      .translate(this.trianglePosition);
    this.trianglePosition.commit(gl, trianglePositionLocation);
    modelMatrix.commit(gl, matrixLocation);
    gl.uniform1f(brightnessLocation, 1);
    this.solidProgram.commit();
    this.triangleGeometry.draw();

    for(var i=0; i<this.orbiters; i++) {
      const modelMatrix2 = new Mat4()
        .rotate(-timeAtThisFrame/1000) // Rotate each triangle individually
        .scale(0.25) // Set scale of each triangle
        .translate(0, 0.5, 0) // Move triangle away from origin
        .rotate(2*Math.PI / this.orbiters * i + (timeAtThisFrame / 1400)) // Orbit triangle around center
        .translate(this.trianglePosition); // Move origin to triangle position
      modelMatrix2.commit(gl, matrixLocation);
      gl.uniform1f(brightnessLocation, Math.pow(3, this.scale));
      this.triangleGeometry.draw();
    }
  }
};


