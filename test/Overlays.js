
class Overlays {
  constructor(World) {
    this.World = World;
  }
  getOverlayProperties(id, filter = []) {
    let overlay = this.World.get(id, "Overlay");
    if(filter.length > 0) {
    }
    return Object.assign({},overlay);
  }
  editOverlay(id, properties) {
    let overlay = this.World.get(id, "Overlay");
    let keys = Object.keys(properties);
    if(overlay === {}) return;

    keys.forEach((key) => {
      if (key !== "id" && key !== "worldType" && type !== "type") {
        overlay[key] = properties[key];
      }
    });
  }
  addOverlay(properties) {
    properties["worldType"] = "Overlay";
    return this.World.add(properties);
  }
  deleteOverlay(id) {
    this.World.remove(id, "Overlay");
  }
  count(){
    return this.World.count("Overlay");
  }
}
module.exports = Overlays;
