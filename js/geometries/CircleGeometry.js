"use strict";
const HeartGeometry = function(gl) {
  this.gl = gl;

  // vertex buffer
  this.n = 255;
  var n = this.n
  var points = [];

  for(var i=0; i<=n; i++) {
      var j = i/n * 2*Math.PI;
      points.push(Math.sin(j) * Math.sin(j) * Math.sin(j));
      points.push(((13 * Math.cos(j)) - (5 * Math.cos(2*j)) - (2 * Math.cos(3*j)) - (Math.cos(4*j)))/16 + 0.1);
      points.push(0.5);
  }

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(points),
    gl.STATIC_DRAW);

  // index buffer
  var index = []
  for(var i=1; i<n; i++) {
    var j = i/n * 2*Math.PI;
    index.push(0);
    index.push(i);
    index.push(i+1);
  }
  index.push(0);
  index.push(n);
  index.push(1);

  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(index),
    gl.STATIC_DRAW);
};

HeartGeometry.prototype.draw = function() {
  const gl = this.gl;
  // set vertex buffer to pipeline input
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );

  // set index buffer to pipeline input
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.drawElements(gl.TRIANGLES, 3*this.n, gl.UNSIGNED_SHORT, 0);
};
