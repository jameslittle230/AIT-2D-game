"use strict"; 
const GameObject = function(mesh) { 
    this.mesh = mesh;

    this.position = new Vec3(0, 0, 0);
    this.orientation = 0;
    this.scale = new Vec3(1, 1, 0);

    this.modelMatrix = new Mat4();
};

GameObject.prototype.updateModelMatrix = function(){
    // console.log(this.position)
    this.modelMatrix.set()
        .rotate(this.orientation)
        .scale(this.scale)
        .translate(this.position);
};

GameObject.prototype.draw = function(camera){
    this.updateModelMatrix();
    this.modelMatrix.mul(camera.viewProjMatrix);
    this.mesh.material.modelViewProjMatrix.set(this.modelMatrix)
    this.mesh.draw();
};