class Vec3 {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
class Quaternion {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

module.exports = {Vec3, Quaternion};
