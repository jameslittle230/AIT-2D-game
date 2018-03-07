"use strict";
const GemGeometry = function(gl) {
  this.gl = gl;

  // vertex buffer
  var points = [
    -0.44, 0.76, 0.5,
    0.44, 0.76, 0.5,
    0.88, 0.254, 0.5,
    0, -0.78, 0.5,
    -0.88, 0.254, 0.5
  ];

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(points),
    gl.STATIC_DRAW);

  // index buffer
  var index = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4
  ]

  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(index),
    gl.STATIC_DRAW);
};

GemGeometry.prototype.draw = function() {
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

  gl.drawElements(gl.TRIANGLES, 9, gl.UNSIGNED_SHORT, 0);
};
