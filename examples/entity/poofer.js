/**
Example of an Script that uses the Entity library to rez an object.
Making is Rain.

Distributed under MIT. see License.

*/

(function() {
  var Entity;Overlay=function(a){this.properties=a?a:{},this.properties.scale=this.properties.scale?this.properties.scale:{x:1,y:1,z:1},this.properties.position=this.properties.position?this.properties.position:MyAvatar.position,this.properties.rotation=this.properties.rotation?this.properties.rotation:Quat.ZERO,this.properties.color=this.properties.color?this.properties.color:{red:255,green:255,blue:255},this.properties.alpha=this.properties.alpha?this.properties.alpha:1,this.type=this.properties.type?this.properties.type:"cube","line3d"===this.properties.type?(this.properties.start=this.properties.start?this.properties.start:Vec3.ZERO,this.properties.end=this.properties.end?this.properties.end:Vec3.ZERO,this.properties.glow=this.properties.glow?this.properties.glow:0):this.properties.solid=!!this.properties.solid,this.callbacks={},this._filter=[];var b=this;this.scriptEnding=function(){b.deleteOverlay(),Script.scriptEnding.disconnect(b.scriptEnding)},Script.scriptEnding.connect(b.scriptEnding)},Overlay.prototype={properties:null,id:-1,_filter:null,callbacks:null,filter:function(a){return this.id!==-1?(this._filter=a,this.sync(a)):this},addOverlay:function(){return this.id===-1&&(this.id=Overlays.addOverlay(this.type,this.properties)),this},deleteOverlay:function(){try{this.id!==-1&&Overlays.deleteOverlay(this.id)}catch(a){print("Overlay does no longer exist.")}return this.id=-1,this},updateOverlay:function(){try{this.id!==-1&&Overlays.editOverlay(this.id,this.properties)}catch(a){print("OWrap: Overlay does not exist in world.")}return this},editProperties:function(a){for(var b in a)this.properties[b]=a[b];return this}},Entity=function(a){if(null===a||void 0===a||"function"==typeof a){var b=this;this.preload="function"==typeof a?a:function(a){b.id=a,Object.keys(b.callbacks).forEach(function(c){b[c]=b.callbacks[c],Script.addEventHandler(a,c,b[c])})},this.callbacks={},this.properties={},this._filter=[]}else"string"==typeof a?(this.properties=Entities.getEntityProperties(a),this.properties&&null!==this.properties&&0!==this.properties.length?this.id=a:(this.id=null,this.properties={})):this.properties=a;this.callbacks={},this._filter=[]},Entity.prototype={properties:null,id:null,_filter:null,callbacks:null,setPreload:function(a){return this.preload=a,this},filter:function(a){return null!==this.id&&void 0!==this.id?(this._filter=a,this.sync(a)):this},addEntity:function(){return null===this.id&&void 0!==this.id&&(this.id=Entities.addEntity(this.properties)),this},deleteEntity:function(){try{null!==this.id&&void 0!==this.id&&Entities.deleteEntity(this.id)}catch(a){print("Entity does no longer exist.")}return this.id=null,this},sync:function(a){if(null!==this.id&&void 0!==this.id){a=null===a||void 0===a?this._filter:a;var b=Entities.getEntityProperties(this.id,a);void 0!==b.id?this.properties=b:this.id=null}return this._filter=[],this},getJSONUserData:function(){return this.properties.userData.length>0?JSON.parse(this.properties.userData):{}},editProperties:function(a){for(var b in a)"userData"!==b||a[b]instanceof JSON?this.properties[b]=a[b]:this.properties[b]=JSON.stringify(a[b]);return this},callMethod:function(a,b){return null===this.id||void 0===this.id?this:(Entities.callEntityMethod(this.id,a,b),this)},unbind:function(a){return null===this.id||void 0===this.id?this:null===this.callbacks[a]?this:(Script.removeEventHandler(this.id,a,this.callbacks[a]),delete this.callbacks[a],this)},bind:function(a,b,c){print("binding method "+a+this.id),void 0===c&&(c=!0),null!==this.callbacks[a]&&this.unbind(a,this.callbacks[a]);var d=this;return this.callbacks[a]=c?function(){b(d,this.arguments)}:b,null!==this.id&&void 0!==this.id&&Script.addEventHandler(this.id,a,b),this},clearInteractions:function(){return this.unbind("startFarTrigger").unbind("clickDownOnEntity").unbind("continueFarTrigger").unbind("holdingClickOnEntity").unbind("continueFarTrigger").unbind("holdingClickOnEntity"),this},clearEquip:function(){return this.unbind("onEquip").unbind("startEquip").unbind("continueEquip"),this},setOnEquip:function(a){var b=this,c=function(c,d){var e="left"===d[0]?Controller.Standard.LT:Controller.Standard.RT;a(b,e,d)};return null===this.id?this.startEquip=c:this.bind("onEquip",c,!1),b},setOnEquipTrigger:function(a){var b=this,c=function(c,d){var e="left"===d[0]?Controller.Standard.LT:Controller.Standard.RT,f=Controller.getValue(e);a(b,e,f,d)};return null===this.id?this.continueEquip=c:this.bind("continueEquip",c,!1),b},setOnUnequip:function(a){var b=this,c=function(c,d){var e="left"===d[0]?Controller.Standard.LT:Controller.Standard.RT,f=Controller.getValue(e);a(b,e,f,d)};return null===this.id?this.releaseEquip=c:this.bind("releaseEquip",c,!1),b},setInteractionStart:function(a){var b=this,c=function(){a(b,{button:"hand"})},d=function(c,d){a(b,d)};return null===this.id?(this.clickDownOnEntity=d,this.startFarTrigger=c):this.bind("startFarTrigger",c,!1).bind("clickDownOnEntity",d,!1),this},setInteractionHold:function(a){var b=this,c=function(){a(b,{button:"hand"})},d=function(c,d){a(b,d)};return null===this.id?(this.continueFarTrigger=c,this.holdingClickOnEntity=d):this.bind("continueFarTrigger",c,!1).bind("holdingClickOnEntity",d,!1),this},setInteractionStop:function(a){var b=this,c=function(){a(b,{button:"hand"})},d=function(c,d){a(b,d)};return null===this.id?(this.stopFarTrigger=c,this.clickReleaseOnEntity=d):this.bind("stopFarTrigger",c,!1).bind("clickReleaseOnEntity",d,!1),this},updateEntity:function(){try{null!==this.id&&Entities.editEntity(this.id,this.getProperties())}catch(a){print("EWrap: Entity does not exist in world.")}return this.sync()},getProperties:function(a){if(a=null===a||void 0===a?this._filter:a,0===a.length)return this.properties;var b={};return a.forEach(function(c){b.push(this.properties[a[index]])}),b}};


  // Define some randomization Functions.
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
