var Guid = require("guid");
var {Vec3, Quaternion} = require("./Util");

class World {
  constructor() {
    this.worldSpace = [];
  }
  get(id, type = "worldTest") {
    let index = this.worldSpace.findIndex(val => val.id === id && val.worldType === type);
    return (index > -1) ? this.worldSpace[index]: {};
  }
  add(obj) {
    obj.id = `{${Guid.raw()}}`;
    obj.parentID = '{000000000-0000-0000-0000-0000000000000}';
    obj.worldType = obj.worldType ? obj.worldType : "worldTest";
    if (!obj.position) {
      obj.position = new Vec3(0,0,0);
    }
    if (!obj.rotation) {
      obj.rotation = new Quaternion(0,0,0,1);
    }

    this.worldSpace.push(obj);
    return obj.id;
  }
  remove(id, type = "worldTest") {
    let index = this.worldSpace.findIndex(val => val.id === id && val.worldType === type);
    this.worldSpace.splice(index, 1);
  }
  count(type = "worldTest") {
    return this.worldSpace.filter(item => item.worldType === type).length;
  }
}

module.exports = World;
