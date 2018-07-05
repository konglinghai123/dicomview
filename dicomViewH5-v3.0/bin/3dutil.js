var goog = {};
goog.isDefAndNotNull = function(val) {
  return val != null;
};
goog.math = {};
goog.math.Vec3 = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};
goog.math.Vec3.prototype.scale = function(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
};
goog.math.Vec3.prototype.add = function(b) {
    this.x += b.x;
    this.y += b.y;
    this.z += b.z;
    return this;
};
goog.math.Vec3.cross = function(a, b) {
  return new goog.math.Vec3(
      a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
};
goog.vec={}
goog.vec.Vec3={};
goog.vec.Vec3={};
goog.vec.Vec3.createFloat32 = function() {
    return new Float32Array(3);
};
goog.vec.Vec3.setFromValues = function(vec, v0, v1, v2) {
    vec[0] = v0;
    vec[1] = v1;
    vec[2] = v2;
    return vec;
};
goog.math.Vec3.distance = function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };
goog.vec.Vec3.createFloat32FromValues = function(v0, v1, v2) {
    var a = goog.vec.Vec3.createFloat32();
    goog.vec.Vec3.setFromValues(a, v0, v1, v2);
    return a;
};
goog.vec.Vec3.magnitude = function(vec0) {
    var x = vec0[0], y = vec0[1], z = vec0[2];
    return Math.sqrt(x * x + y * y + z * z);
};
goog.vec.Vec3.normalize = function(vec0, resultVec) {
    var ilen = 1 / goog.vec.Vec3.magnitude(vec0);
    resultVec[0] = vec0[0] * ilen;
    resultVec[1] = vec0[1] * ilen;
    resultVec[2] = vec0[2] * ilen;
    return resultVec;
};
goog.vec.Mat4 = {}
goog.vec.Vec4 = {}
goog.vec.Vec3.equals = function(v0, v1) {
    return v0.length == v1.length && v0[0] == v1[0] && v0[1] == v1[1] &&
        v0[2] == v1[2];
  };
goog.vec.Vec4.scale = function(vec0, scalar, resultVec) {
    resultVec[0] = vec0[0] * scalar;
    resultVec[1] = vec0[1] * scalar;
    resultVec[2] = vec0[2] * scalar;
    resultVec[3] = vec0[3] * scalar;
    return resultVec;
};
goog.vec.Mat4.createFloat32Identity = function() {
    var mat = goog.vec.Mat4.createFloat32();
    mat[0] = mat[5] = mat[10] = mat[15] = 1;
    return mat;
};
goog.vec.Vec3.cross = function(v0, v1, resultVec) {
    var x0 = v0[0], y0 = v0[1], z0 = v0[2];
    var x1 = v1[0], y1 = v1[1], z1 = v1[2];
    resultVec[0] = y0 * z1 - z0 * y1;
    resultVec[1] = z0 * x1 - x0 * z1;
    resultVec[2] = x0 * y1 - y0 * x1;
    return resultVec;
};
goog.vec.Mat4.createFloat32 = function() {
  return new Float32Array(16);
};
goog.vec.Mat4.setRowValues = function(mat, row, v0, v1, v2, v3) {
  mat[row] = v0;
  mat[row + 4] = v1;
  mat[row + 8] = v2;
  mat[row + 12] = v3;
  return mat;
};
goog.vec.Mat4.invert = function(mat, resultMat) {
  var m00 = mat[0], m10 = mat[1], m20 = mat[2], m30 = mat[3];
  var m01 = mat[4], m11 = mat[5], m21 = mat[6], m31 = mat[7];
  var m02 = mat[8], m12 = mat[9], m22 = mat[10], m32 = mat[11];
  var m03 = mat[12], m13 = mat[13], m23 = mat[14], m33 = mat[15];

  var a0 = m00 * m11 - m10 * m01;
  var a1 = m00 * m21 - m20 * m01;
  var a2 = m00 * m31 - m30 * m01;
  var a3 = m10 * m21 - m20 * m11;
  var a4 = m10 * m31 - m30 * m11;
  var a5 = m20 * m31 - m30 * m21;
  var b0 = m02 * m13 - m12 * m03;
  var b1 = m02 * m23 - m22 * m03;
  var b2 = m02 * m33 - m32 * m03;
  var b3 = m12 * m23 - m22 * m13;
  var b4 = m12 * m33 - m32 * m13;
  var b5 = m22 * m33 - m32 * m23;

  var det = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
  if (det == 0) {
    return false;
  }

  var idet = 1.0 / det;
  resultMat[0] = (m11 * b5 - m21 * b4 + m31 * b3) * idet;
  resultMat[1] = (-m10 * b5 + m20 * b4 - m30 * b3) * idet;
  resultMat[2] = (m13 * a5 - m23 * a4 + m33 * a3) * idet;
  resultMat[3] = (-m12 * a5 + m22 * a4 - m32 * a3) * idet;
  resultMat[4] = (-m01 * b5 + m21 * b2 - m31 * b1) * idet;
  resultMat[5] = (m00 * b5 - m20 * b2 + m30 * b1) * idet;
  resultMat[6] = (-m03 * a5 + m23 * a2 - m33 * a1) * idet;
  resultMat[7] = (m02 * a5 - m22 * a2 + m32 * a1) * idet;
  resultMat[8] = (m01 * b4 - m11 * b2 + m31 * b0) * idet;
  resultMat[9] = (-m00 * b4 + m10 * b2 - m30 * b0) * idet;
  resultMat[10] = (m03 * a4 - m13 * a2 + m33 * a0) * idet;
  resultMat[11] = (-m02 * a4 + m12 * a2 - m32 * a0) * idet;
  resultMat[12] = (-m01 * b3 + m11 * b1 - m21 * b0) * idet;
  resultMat[13] = (m00 * b3 - m10 * b1 + m20 * b0) * idet;
  resultMat[14] = (-m03 * a3 + m13 * a1 - m23 * a0) * idet;
  resultMat[15] = (m02 * a3 - m12 * a1 + m22 * a0) * idet;
  return true;
};
goog.vec.Vec4.setFromValues = function(vec, v0, v1, v2, v3) {
  vec[0] = v0;
  vec[1] = v1;
  vec[2] = v2;
  vec[3] = v3;
  return vec;
};
goog.vec.Vec4.createFloat32 = function() {
    return new Float32Array(4);
};
goog.vec.Vec4.createFloat32FromValues = function(v0, v1, v2, v3) {
  var vec = goog.vec.Vec4.createFloat32();
  goog.vec.Vec4.setFromValues(vec, v0, v1, v2, v3);
  return vec;
};
goog.vec.Mat4.multVec4 = function(mat, vec, resultVec) {
  var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
  resultVec[0] = x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12];
  resultVec[1] = x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13];
  resultVec[2] = x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14];
  resultVec[3] = x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15];
  return resultVec;
};

goog.vec.Mat4.computeRASBBox = function(IJKToRAS, MRIdim){
    
      var _rasBB = [Number.MAX_VALUE, -Number.MAX_VALUE,
                   Number.MAX_VALUE, -Number.MAX_VALUE,
                   Number.MAX_VALUE, -Number.MAX_VALUE];
    
      var ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
      var rasResult = goog.vec.Vec4.createFloat32();
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, 0, MRIdim[2]-1, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, MRIdim[1]-1, 0, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, 0, 0, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, MRIdim[1]-1, 0, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, 0, MRIdim[2]-1, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(0, MRIdim[1]-1, MRIdim[2]-1, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
      ijkTarget = goog.vec.Vec4.createFloat32FromValues(MRIdim[0]-1, MRIdim[1]-1, MRIdim[2]-1, 1);
      goog.vec.Mat4.multVec4(IJKToRAS, ijkTarget, rasResult);
    
      _rasBB[0] = rasResult[0] < _rasBB[0] ? rasResult[0] : _rasBB[0];
      _rasBB[1] = rasResult[0] > _rasBB[1] ? rasResult[0] : _rasBB[1];
      _rasBB[2] = rasResult[1] < _rasBB[2] ? rasResult[1] : _rasBB[2];
      _rasBB[3] = rasResult[1] > _rasBB[3] ? rasResult[1] : _rasBB[3];
      _rasBB[4] = rasResult[2] < _rasBB[4] ? rasResult[2] : _rasBB[4];
      _rasBB[5] = rasResult[2] > _rasBB[5] ? rasResult[2] : _rasBB[5];
    
    return _rasBB;
}
goog.vec.Mat4.multVec3 = function(mat, vec, resultVec) {
    var x = vec[0], y = vec[1], z = vec[2];
    resultVec[0] = x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
    resultVec[1] = x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
    resultVec[2] = x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
    return resultVec;
};
goog.vec.Mat4.multMat = function(mat0, mat1, resultMat) {
    var a00 = mat0[0], a10 = mat0[1], a20 = mat0[2], a30 = mat0[3];
    var a01 = mat0[4], a11 = mat0[5], a21 = mat0[6], a31 = mat0[7];
    var a02 = mat0[8], a12 = mat0[9], a22 = mat0[10], a32 = mat0[11];
    var a03 = mat0[12], a13 = mat0[13], a23 = mat0[14], a33 = mat0[15];
  
    var b00 = mat1[0], b10 = mat1[1], b20 = mat1[2], b30 = mat1[3];
    var b01 = mat1[4], b11 = mat1[5], b21 = mat1[6], b31 = mat1[7];
    var b02 = mat1[8], b12 = mat1[9], b22 = mat1[10], b32 = mat1[11];
    var b03 = mat1[12], b13 = mat1[13], b23 = mat1[14], b33 = mat1[15];
  
    resultMat[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    resultMat[1] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    resultMat[2] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    resultMat[3] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
  
    resultMat[4] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    resultMat[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    resultMat[6] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    resultMat[7] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
  
    resultMat[8] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    resultMat[9] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    resultMat[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    resultMat[11] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
  
    resultMat[12] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
    resultMat[13] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
    resultMat[14] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
    resultMat[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;
    return resultMat;
};