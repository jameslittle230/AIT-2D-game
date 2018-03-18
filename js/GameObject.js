"use strict"; 
const GameObject = function(mesh, type) {
    this.mesh = mesh;
    this.type = type;

    this.position = new Vec3(0, 0, 0);
    this.orientation = 0;
    this.scale = new Vec3(0.4, 0.4, 0);
    this.isSelected = false;

    this.motionFramesLeft = 0;
    this.motionDuration = 1;
    this.animationType = "";
    this.motionTarget = new Vec2(0, 0);
    this.motionOrigin = new Vec2(0, 0);

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
    // Handle Animation
    if(this.motionFramesLeft > 0) {
        this.motionFramesLeft--;
        if(this.animationType == "translate") {
            var easeValue = 1-(this.motionFramesLeft / this.motionDuration);
            easeValue = easeValue*(2-easeValue);

            var px = this.motionOrigin.x + (this.motionTarget.x - this.motionOrigin.x) * easeValue;
            var py = this.motionOrigin.y + (this.motionTarget.y - this.motionOrigin.y) * easeValue;

            this.position.set(px, py, 0);
        } else {
            this.scale.mul(0.92, 0.92, 0);
            this.orientation += 0.3;
        }
    }

    this.updateModelMatrix();
    this.modelMatrix.mul(camera.viewProjMatrix);
    this.mesh.material.modelViewProjMatrix.set(this.modelMatrix)
    this.mesh.draw();
};

GameObject.prototype.moveToPos = function(x, y, duration=20) {
    this.motionOrigin.set(this.position.x, this.position.y)
    this.motionTarget.set(x, y);
    this.motionFramesLeft = duration;
    this.motionDuration = duration;
    this.animationType = "translate";
}

GameObject.prototype.delete = function() {
    this.motionFramesLeft = 180;
    this.motionDuration = 180;
    this.animationType = "delete";
    this.type = "empty";
}