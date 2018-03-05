"use strict";
const Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");

  this.buildHeartObject(gl);
  this.buildStarObject(gl);

  this.timeAtLastFrame = new Date().getTime();

  this.elapsedTime = 0;

  this.gameObjects = [];
  this.camera = new OrthoCamera();

  this.heart = new GameObject(new Mesh(this.heartGeometry, this.heartMaterial));
  this.star = new GameObject(new Mesh(this.starGeometry, this.starMaterial));
  this.gameObjects.push(this.heart);
  this.gameObjects.push(this.star);

  console.log(this.gameObjects);
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
  this.star.orientation += dt/2;

  // Clear screen
  gl.clearColor(255/255, 255/255, 255/255, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // if(timeElapsedLocation < 0) {
  //   console.log("Could not find uniform");
  // } else {
    this.gameObjects.forEach(gameObj => {
      gameObj.draw(this.camera);
    });
  // }
};

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
  this.starMaterial.solidColor.set(1, 0.941176471, 0.37254902);
}
