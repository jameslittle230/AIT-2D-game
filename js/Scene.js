"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.triangleGeometry = new TriangleGeometry(gl);

  this.timeAtLastFrame = new Date().getTime();
  this.trianglePosition = {x: 0, y: 0, z: 0};
  this.trianglePosition2 = {x: 0, y: 0, z: 0};
  this.triangleScale = 0.5;
  this.triangleScale2 = 0.8;

  this.transform = {dx1: 0.7, dy1: 0.25, dx2: -0.3, dy2: -0.9}
  this.frameCount = 0;

};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  this.frameCount++;
  
  this.trianglePosition.x += this.transform.dx1 * dt;
  this.trianglePosition.y += this.transform.dy1 * dt;
  this.trianglePosition2.x += this.transform.dx2 * dt;
  this.trianglePosition2.y += this.transform.dy2 * dt;
  this.triangleScale = (Math.sin(this.frameCount / Math.PI / 10) + 1.5) * 0.08 + 0.5;
  // this.triangleScale2 = Math.cos(this.frameCount / Math.PI / 8);

  if(this.trianglePosition.x >= 1/this.triangleScale || this.trianglePosition.x <= -1/this.triangleScale) {
    this.transform.dx1 *= -1;
  }

  if(this.trianglePosition.y >= 1/this.triangleScale || this.trianglePosition.y <= -1/this.triangleScale) {
    this.transform.dy1 *= -1;
  }

  if(this.trianglePosition2.y < -1/this.triangleScale2) {
    this.trianglePosition2.y = 1/this.triangleScale2;
  }

  if(this.trianglePosition2.x < -1/this.triangleScale2) {
    this.trianglePosition2.x = 1/this.triangleScale2;
  }

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition"); 
  const triangleScaleLocation = gl.getUniformLocation(this.solidProgram.glProgram, "triangleScale"); 
  
  if(trianglePositionLocation < 0 || triangleScaleLocation < 0) {
    console.log("Could not find uniform"); 
  } else {
    gl.uniform3f(trianglePositionLocation, this.trianglePosition.x, this.trianglePosition.y, this.trianglePosition.z); 
    gl.uniform1f(triangleScaleLocation, this.triangleScale);
  }

  // clear the screen
  gl.clearColor(0.3, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.solidProgram.commit();
  this.triangleGeometry.draw();

  gl.uniform3f(trianglePositionLocation, this.trianglePosition2.x, this.trianglePosition2.y, this.trianglePosition2.z); 
  gl.uniform1f(triangleScaleLocation, this.triangleScale2);
  this.triangleGeometry.draw();
};


