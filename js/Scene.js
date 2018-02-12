"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.triangleGeometry = new TriangleGeometry(gl);

  this.timeAtLastFrame = new Date().getTime();
  this.trianglePosition = {x: 0, y: 0, z: 0};

};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  this.trianglePosition.x += 0.008;

  const trianglePositionLocation = gl.getUniformLocation(this.solidProgram.glProgram, "trianglePosition"); 
  
  if(trianglePositionLocation < 0) {
    console.log("Could not find uniform: trianglePosition."); 
  } else {
    gl.uniform3f(trianglePositionLocation, this.trianglePosition.x, this.trianglePosition.y, this.trianglePosition.z); 
  }

  // clear the screen
  gl.clearColor(0.3, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.solidProgram.commit();
  this.triangleGeometry.draw();
};


