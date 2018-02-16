"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.triangleGeometry = new TriangleGeometry(gl);

  this.timeAtLastFrame = new Date().getTime();
  this.trianglePosition = new Vec3(0, 1, 0);
  this.trianglePosition2 = new Vec3(0, 0, 0);
  this.triangleScale = 0.5;
  this.triangleScale2 = 0.3;

  this.transform = new Vec3(0.8, 0.25, 0);
  this.transform2 = new Vec3(0, 0, 0);
  this.frameCount = 0;
};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  this.frameCount++;
  
  this.trianglePosition.add(this.transform.times(dt));
  this.trianglePosition2.add(this.transform2.times(dt));

  if(this.keysPressed.D === true) {
    this.transform2.set(1, 0, 0);
  } else if(this.keysPressed.W === true) {
    this.transform2.set(0, 1, 0);
  } else if(this.keysPressed.A === true) {
    this.transform2.set(-1, 0, 0);
  } else if(this.keysPressed.S === true) {
    this.transform2.set(0, -1, 0);
  } else {
    this.transform2.set(0, 0, 0);
  }
  // this.triangleScale = (Math.sin(this.frameCount / Math.PI / 10) + 1.5) * 0.08 + 0.5;
  // this.triangleScale2 = Math.cos(this.frameCount / Math.PI / 8);

  // if(this.trianglePosition.x >= 1/this.triangleScale || this.trianglePosition.x <= -1/this.triangleScale) {
  //   this.transform.dx1 *= -1;
  // }

  // if(this.trianglePosition.y >= 1/this.triangleScale || this.trianglePosition.y <= -1/this.triangleScale) {
  //   this.transform.dy1 *= -1;
  // }

  // if(this.trianglePosition2.y < -1/this.triangleScale2) {
  //   this.trianglePosition2.y = 1/this.triangleScale2;
  // }

  // if(this.trianglePosition2.x < -1/this.triangleScale2) {
  //   this.trianglePosition2.x = 1/this.triangleScale2;
  // }

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition");
  const triangleScaleLocation = gl.getUniformLocation(this.solidProgram.glProgram, "triangleScale");

  if(trianglePositionLocation < 0 || triangleScaleLocation < 0) {
    console.log("Could not find uniform");
  } else {
    this.trianglePosition.commit(gl, trianglePositionLocation)
    gl.uniform1f(triangleScaleLocation, this.triangleScale);
  }

  // clear the screen
  gl.clearColor(0.3, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.solidProgram.commit();
  this.triangleGeometry.draw();

  this.trianglePosition2.commit(gl, trianglePositionLocation)
  gl.uniform1f(triangleScaleLocation, this.triangleScale2);
  this.triangleGeometry.draw();
};


