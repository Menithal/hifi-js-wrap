/**
Example of an Script that uses the Entity library to rez an object.
Making is Rain.

Distributed under MIT. see License.

*/

(function() {
  Script.include("../hifi-js-wrap.min.js?"+Math.random())
  var Entity
  var randVec = function(amount) { return { x: Math.random() * amount - Math.random() * amount, y: Math.random() * amount - Math.random() * amount, z: Math.random() * amount - Math.random() * amount } }
  var randScaleVec = function(min, amount) {
    var size = Math.random() * amount
    size = size < min? min: size
    return { x:size,  y: size, z: size } }
  var randColor = function() { return { red: Math.random() * 255, green: Math.random() * 255, blue: Math.random() * 255  } };
  var lastClick = new Date()
  // On interaction / on click / on touch start spawn whole bunch of spheres and change random.
  var cl = function(instance, event) {
      if((new Date() - lastClick) > 10000){
        instance.sync(["position","color"])
        var amount = 100
        for (var i = 0; i < amount; i++) {
          var color = randColor()
          var dimen = {x: 0.1560, y: 0.005, z:0.0663}
          var vec = randVec(5)
          vec.y = Math.abs(vec.y) + Math.random() * 3
            new Entity({
                type: "Model",
                position: Vec3.sum(instance.properties.position, randVec(2)),
                velocity: vec,
                modelURL: "http://www.norteclabs.com/HF/scripts/examples/entity/dollars.fbx",
                name: "Dollars" + Math.random() * 10000,
                color: color,
                friction: 0.05,
                shapeType: 'Box',
                density: 100,
                angularVelocity: randVec(90),
                angularFriction: 0.05,
                //registrationPoint: randVec(1),
                dimensions: dimen,
                gravity: {x:0,y:-1,z:0},
                dynamic: true,
                lifetime: 30
            }).addEntity()
            if(i == amount/2){ print(instance.id); instance.editProperties({color:color}).updateEntity() }
        }
        lastClick = new Date()
      }
  };
  var e = new Entity()
  e.setInteractionStart(cl)
  return e
});
