
Script.include("../hifi-js-wrap.min.js?" + Math.random());
var Overlay;
(function() {
  var line = new Overlay({type:'line3d', position: Vec3.ZERO}).addOverlay();
  var target = new Overlay({type:'sphere', scale:{x:0.2,y:0.2,z:0.2}, solid: true, color:{red:255,green:0,blue:0}}).addOverlay();

  var updateThread = function (dt) {
    var eyes = MyAvatar.getEyePosition();
    var headOrientation = MyAvatar.headOrientation;
    var headFwd = Quat.getFront(headOrientation);

    var ray = {origin: eyes, direction: headFwd};
    var trace = Entities.findRayIntersection(ray, true);
    var blacklist = [];
    while(trace.intersects && trace.properties.collisionless) {
      blacklist.push(trace.entityID);
      trace = Entities.findRayIntersection(ray, true, [], blacklist);
    }

    if (trace.intersects) {
      line.editProperties({alpha: 1, start: eyes, end: trace.intersection});
      target.editProperties({alpha: 1,position: trace.intersection});
      print(JSON.stringify(trace));
    } else {
      line.editProperties({alpha:0, start: Vec3.ZERO, end: Vec3.ZERO});
      target.editProperties({alpha:0});
    }
    line.updateOverlay();
    target.updateOverlay();
  };


  Script.update.connect(updateThread);
  var endScript = function () {
    Script.update.disconnect(updateThread);
    Script.scriptEnding.disconnect(this);
  }

  Script.scriptEnding.connect(endScript);
}());
