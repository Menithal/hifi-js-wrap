/**
Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 3/11/16.
Work in Progress

Distributed under MIT License
See LICENCE for License details.
*/
(function() {

  function Entity(properties) {
      if (properties === null || properties === undefined || typeof properties === "function") {
          var self = this
          this.preload = typeof properties === "function" ? properties : function(id) {
              self.id = id
          }
          this.callbacks = {}
          this.properties = {}
          this._filter = []
      } else if (typeof properties === "string") {
          this.properties = Entities.getEntityProperties(id)
          if (this.properties && this.properties !== null && this.properties.length !== 0) {
              this.id = properties.id
          } else {
              this.id = null
              this.properties = {}
          }
      } else {
          this.properties = properties
      }
      this.callbacks = {}
      this._filter = []
  }
  Entity.prototype = {
      properties: null,
      id: null,
      _filter: null,
      callbacks: null,
      filter: function(filter) {
          if (this.id !== null) { // Lets not destroy properties if this isnt even in the world yet!
              this._filter = filter
              return this.sync(filter)
          }
          return this
      },
      addEntity: function() {
          if (this.id === null) this.id = Entities.addEntity(this.properties)
          return this
      },
      deleteEntity: function() {
          try {
              if (this.id !== null) Entities.deleteEntity(this.id)
          } catch (e) {
              print("Entity does no longer exist.")
          }
          this.id = null
          return this
      },
      sync: function(filter) {
          if (this.id !== null) {
              filter = (filter === null || filter === undefined) ? this._filter : filter
              var newProperties = Entities.getEntityProperties(this.id, filter)
              if (newProperties.id !== undefined) {
                  this.properties = newProperties
              } else {
                  this.id = null
              }
          }
          this._filter = []
          return this
      },
      editProperties: function(newProperties) {
          for (var property in newProperties) {
            print(property)
              this.properties[property] = newProperties[property]
          }
          return this
      },
      callMethod: function(methodName, params) {
          if (this.id !== null) {
              Entities.callEntityMethod(this.id, methodName, params)
          }
          return this
      },
      unbind: function(method) {
          if (this.callbacks[method] !== null) {
              return this
          }
          Script.clearEventHandler(this.id, method, this.callbacks[method])
          return this
      },
      bind: function(method, callback, override) {
          if (override === undefined) {
              override = true
          }
          if (this.callbacks[method] !== null) {
              this.unbind(method, this.callbacks[method])
          }
          var s = this
          this.callbacks[method] = override ? function() {
              callback(s, this.arguments)
          } : callback
          Script.addEventHandler(this.id, method, callback)
          return this
      },
      clearInteractions: function() {
          this.unbind("startFarTrigger")
              .unbind("clickDownOnEntity")
              .unbind("continueFarTrigger")
              .unbind("holdingClickOnEntity")
              .unbind("continueFarTrigger")
              .unbind("holdingClickOnEntity")

          if(this.startFarTrigger ) delete this.startFarTrigger
          if(this.clickDownOnEntity) delete this.clickDownOnEntity
          if(this.continueFarTrigger ) delete this.continueFarTrigger
          if(this.holdingClickOnEntity) delete this.holdingClickOnEntity
          if(this.continueFarTrigger ) delete this.continueFarTrigger
          if(this.holdingClickOnEntity) delete this.holdingClickOnEntity

          return this
      },
      setInteractionStart: function(call) { // Creates Wraps mouse clicks and Trigger calls together.
          var s = this
          var startFarTrigger = function() { call(s, { button: "hand" }) }
          var clickDownOnEntity =  function(i, m) { call(s, m) }
          if(this.id === null){
            this.clickDownOnEntity = clickDownOnEntity
            this.startFarTrigger = startFarTrigger
          }else{
            this.bind("startFarTrigger", startFarTrigger, false)
                .bind("clickDownOnEntity", clickDownOnEntity, false)
          }
          return this
      },
      setInteractionHold: function(call) { // Creates Wraps mouse clicks and Trigger calls together.
          var s = this
          var continueFarTrigger = function() {call(s, {button: "hand"})}
          var holdingClickOnEntity = function(i, m) {call(s, m)}
          if(this.id === null){
            this.continueFarTrigger = continueFarTrigger
            this.holdingClickOnEntity = holdingClickOnEntity
          }else{
            this.bind("continueFarTrigger", continueFarTrigger, false)
                .bind("holdingClickOnEntity", holdingClickOnEntity, false)
          }
          return this
      },
      setInteractionStop: function(call) { // Creates Wraps mouse clicks and Trigger calls together.
          var s = this
          var stopFarTrigger = function() {call(s, {button: "hand"})}
          var clickReleaseOnEntity = function(i, m) {call(s, m)}
          if(this.id === null){
            this.stopFarTrigger = stopFarTrigger
            this.clickReleaseOnEntity = clickReleaseOnEntity
          }else{
            this.bind("stopFarTrigger", stopFarTrigger, false)
                .bind("clickReleaseOnEntity", clickReleaseOnEntity, false)
          }
          return this
      },
      updateEntity: function() {
          try {
            if (this.id !== null) Entities.editEntity(this.id, this.getProperties())
          } catch (e) {
            print("EWrap: Entity does not exist in world.")
          }
          return this.sync()
      },
      getProperties: function(filters) { // Filtered properties update. We dont need to update everything always, so sometimes its good to define this.
          filters = (filters === null || filters === undefined) ? this._filter : filters
          if (filters.length === 0) return this.properties

          var filtered = {}
          for (var index in filters) {
              filtered.push(this.properties[filters[index]])
          }
          return filtered
      }
  }


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
          var dimen = {x: 0.156, z: 0.0663, y:0.005}
          var vec = randVec(5)
          vec.y = Math.abs(vec.y) + Math.random() * 3
            new Entity({
                type: "Box",
                position: Vec3.sum(instance.properties.position, randVec(2)),
                velocity: vec,
                name: "CubeToDelete" + Math.random() * 10000,
                color: color,
                friction: 0.05,
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
