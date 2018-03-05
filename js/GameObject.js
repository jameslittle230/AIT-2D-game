"use strict"; 
const GameObject = function(mesh) {
    this.mesh = mesh;

    this.position = new Vec3(0, 0, 0);
    this.orientation = 0;
    this.scale = new Vec3(0.4, 0.4, 0);
    this.isSelected = false;

    this.modelMatrix = new Mat4();
};

GameObject.prototype.updateModelMatrix = function(){
    this.modelMatrix.set()
        .rotate(this.orientation)
        .scale(this.scale)

    if(this.isSelected) {
        this.modelMatrix.scale(1.3, 1.3);
    }

    this.modelMatrix.translate(this.position);
};

GameObject.prototype.draw = function(camera){
    this.updateModelMatrix();
    this.modelMatrix.mul(camera.viewProjMatrix);
    this.mesh.material.modelViewProjMatrix.set(this.modelMatrix)
    this.mesh.draw();
};