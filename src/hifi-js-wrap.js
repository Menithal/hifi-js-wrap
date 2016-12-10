/**
Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 3/11/16.
Work in Progress
Distributed under MIT License
See LICENCE for License details.
*/
Overlay = function(properties) {
  this.properties = properties ? properties: {};
  // Just setting the same default values
  this.properties.scale = this.properties.scale ? this.properties.scale: {x:1,y:1,z:1};
  this.properties.position = this.properties.position ? this.properties.position: MyAvatar.position;
  this.properties.rotation = this.properties.rotation ? this.properties.rotation: Quat.ZERO;
  this.properties.color = this.properties.color ? this.properties.color: {red:255,green:255,blue:255};
  this.properties.alpha = this.properties.alpha ? this.properties.alpha: 1.0;
  this.type = this.properties.type ? this.properties.type : "cube";
  if (this.properties.type === "line3d" ) {
    this.properties.start = this.properties.start ? this.properties.start : Vec3.ZERO;
    this.properties.end = this.properties.end ? this.properties.end :  Vec3.ZERO;
    this.properties.glow = this.properties.glow ? this.properties.glow : 0.0;
  }else {
    this.properties.solid = this.properties.solid ? true: false;
  }

  this.callbacks = {};
  this._filter = [];
  var self = this;
  this.scriptEnding = function () {
    self.deleteOverlay();
    Script.scriptEnding.disconnect(self.scriptEnding);
  };
  /* UI that ends, should just remove the overlays */
  Script.scriptEnding.connect(self.scriptEnding);
};
Overlay.prototype = {
  properties: null,
  id: -1,
  _filter: null,
  callbacks: null,
  filter: function(filter) {
    if (this.id !== -1) { /* Lets not destroy properties if this isnt even in the world yet! */
      this._filter = filter
      return this.sync(filter)
    }
    return this
  },
  addOverlay: function() {
    if (this.id === -1){
      this.id = Overlays.addOverlay(this.type, this.properties);
    }
    return this;
  },
  deleteOverlay: function() {
    try {
      if (this.id !== -1) Overlays.deleteOverlay(this.id);
    } catch (e) {
      print("Overlay does no longer exist.");
    }
    this.id = -1;
    return this;
  },
  updateOverlay: function() {
    try {
      if (this.id !== -1) Overlays.editOverlay(this.id, this.properties);
    } catch (e) {
      print("OWrap: Overlay does not exist in world." );
    }
    return this;
  },
  editProperties: function(newProperties) {
    for (var property in newProperties) {
      this.properties[property] = newProperties[property];
    }
    return this;
  }
};

Entity = function(properties) {
  if (properties === null || properties === undefined || typeof properties === "function") {
    var self = this;
    this.preload = typeof properties === "function" ? properties : function(id) {
      self.id = id;
    }
    this.callbacks = {};
    this.properties = {};
    this._filter = [];
  } else if (typeof properties === "string") {
    this.properties = Entities.getEntityProperties(properties);
    if (this.properties && this.properties !== null && this.properties.length !== 0) {
      this.id = properties.id;
    } else {
      this.id = null;
      this.properties = {};
    }
  } else {
    this.properties = properties;
  }
  this.callbacks = {};
  this._filter = [];
};

Entity.prototype = {
    properties: null,
    id: null,
    _filter: null,
    callbacks: null,
    filter: function(filter) {
        if (this.id !== null) { /* Lets not destroy properties if this isnt even in the world yet! */
            this._filter = filter;
            return this.sync(filter);
        }
        return this;
    },
    addEntity: function() {
        if (this.id === null) this.id = Entities.addEntity(this.properties);
        return this;
    },
    deleteEntity: function() {
        try {
            if (this.id !== null) Entities.deleteEntity(this.id);
        } catch (e) {
            print("Entity does no longer exist.");
        }
        this.id = null;
        return this;
    },
    sync: function(filter) {
        if (this.id !== null) {
            filter = (filter === null || filter === undefined) ? this._filter : filter;
            var newProperties = Entities.getEntityProperties(this.id, filter);
            if (newProperties.id !== undefined) {
                this.properties = newProperties;
            } else {
                this.id = null;
            }
        }
        this._filter = [];
        return this;
    },
    editProperties: function(newProperties) {
        for (var property in newProperties) {
            this.properties[property] = newProperties[property];
        }
        return this;
    },
    callMethod: function(methodName, params) {
        if (this.id !== null) {
            Entities.callEntityMethod(this.id, methodName, params);
        }
        return this;
    },
    unbind: function(method) {
        if (this.callbacks[method] !== null) {
            return this;
        }
        Script.clearEventHandler(this.id, method, this.callbacks[method]);
        return this;
    },
    bind: function(method, callback, override) {
        if (override === undefined) {
            override = true;
        }
        if (this.callbacks[method] !== null) {
            this.unbind(method, this.callbacks[method]);
        }
        var s = this;
        this.callbacks[method] = override ? function() {
            callback(s, this.arguments);
        } : callback;
        Script.addEventHandler(this.id, method, callback);
        return this;
    },
    clearInteractions: function() {
        this.unbind("startFarTrigger")
            .unbind("clickDownOnEntity")
            .unbind("continueFarTrigger")
            .unbind("holdingClickOnEntity")
            .unbind("continueFarTrigger")
            .unbind("holdingClickOnEntity");

        if (this.startFarTrigger) delete this.startFarTrigger;
        if (this.clickDownOnEntity) delete this.clickDownOnEntity;
        if (this.continueFarTrigger) delete this.continueFarTrigger;
        if (this.holdingClickOnEntity) delete this.holdingClickOnEntity;
        if (this.continueFarTrigger) delete this.continueFarTrigger;
        if (this.holdingClickOnEntity) delete this.holdingClickOnEntity;

        return this;
    },
    setInteractionStart: function(call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        var s = this;
        var startFarTrigger = function() {
            call(s, {
                button: "hand"
            });
        };
        var clickDownOnEntity = function(i, m) {
            call(s, m);
        };
        if (this.id === null) {
            this.clickDownOnEntity = clickDownOnEntity;
            this.startFarTrigger = startFarTrigger;
        } else {
            this.bind("startFarTrigger", startFarTrigger, false)
                .bind("clickDownOnEntity", clickDownOnEntity, false);
        }
        return this;
    },
    setInteractionHold: function(call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        var s = this;
        var continueFarTrigger = function() {
            call(s, {
                button: "hand"
            });
        };
        var holdingClickOnEntity = function(i, m) {
            call(s, m);
        };
        if (this.id === null) {
            this.continueFarTrigger = continueFarTrigger;
            this.holdingClickOnEntity = holdingClickOnEntity;
        } else {
            this.bind("continueFarTrigger", continueFarTrigger, false)
                .bind("holdingClickOnEntity", holdingClickOnEntity, false);
        }
        return this;
    },
    setInteractionStop: function(call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        var s = this;
        var stopFarTrigger = function() {
            call(s, {
                button: "hand"
            });
        };
        var clickReleaseOnEntity = function(i, m) {
            call(s, m);
        };
        if (this.id === null) {
            this.stopFarTrigger = stopFarTrigger;
            this.clickReleaseOnEntity = clickReleaseOnEntity;
        } else {
            this.bind("stopFarTrigger", stopFarTrigger, false)
                .bind("clickReleaseOnEntity", clickReleaseOnEntity, false);
        }
        return this;
    },
    updateEntity: function() {
        try {
            if (this.id !== null) Entities.editEntity(this.id, this.getProperties());
        } catch (e) {
            print("EWrap: Entity does not exist in world.");
        }
        return this.sync();
    },
    getProperties: function(filters) { /* Filtered properties update. We dont need to update everything always, so sometimes its good to define this. */
        filters = (filters === null || filters === undefined) ? this._filter : filters;
        if (filters.length === 0) return this.properties;

        var filtered = {};
        filters.forEach(function(item){
          filtered.push(this.properties[filters[index]]);
        });

        return filtered;
    }
}

//var o = new Overlay({type: "cube", position: MyAvatar.position, scale: {x:1,y:1,z:1}}); o.addOverlay(); var p = o.properties; p.position = Vec3.sum(p.position, {x:0,z:0, y:1}); o.editProperties(p).updateOverlay();
