
var {Vec3, Quaternion} = require("./Util");
class Entities {
  constructor(World) {
    this.World = World;
  }
  getEntityProperties(id, filter = []) {
    let entity = this.World.get(id, "Entity");
    if(filter.length > 0) {
      filter[""]
    }
    return Object.assign({},entity);
  }
  editEntity(id, properties) {
    let entity = this.World.get(id, "Entity");
    let keys = Object.keys(properties);
    if(entity === {}) return;

    keys.forEach((key) => {
      if (key !== "id" && key !== "worldType" && type !== "type") {
        entity[key] = properties[key];
      }
    });
  }
  addEntity(properties, local = false) {
    properties["worldType"] = "Entity";
    properties["localEntity"] = local;
    if (!properties.velocity) {
      properties.velocity = new Vec3(0,0,0);
    }
    if (!properties.angularVelocity) {
      properties.angularVelocity = new Vec3(0,0,0);
    }
    if (!properties.userData) {
      properties.userData = "";
    }
    return this.World.add(properties);
  }
  deleteEntity(id) {
    this.World.remove(id, "Entity");
  }
  count(){
    return this.World.count("Entity");
  }
}
module.exports = Entities;
