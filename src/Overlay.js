
  Overlay = function(properties) {
    this.properties = properties ? properties : {};
    // Just setting the same default values
    this.properties.scale = this.properties.scale ? this.properties.scale : {
        x: 1,
        y: 1,
        z: 1
    };
    this.properties.position = this.properties.position ? this.properties.position : MyAvatar.position;
    this.properties.rotation = this.properties.rotation ? this.properties.rotation : Quat.ZERO;
    this.properties.color = this.properties.color ? this.properties.color : {
        red: 255,
        green: 255,
        blue: 255
    };
    this.properties.alpha = this.properties.alpha ? this.properties.alpha : 1.0;
    this.type = this.properties.type ? this.properties.type : "cube";
    if (this.properties.type === "line3d") {
        this.properties.start = this.properties.start ? this.properties.start : Vec3.ZERO;
        this.properties.end = this.properties.end ? this.properties.end : Vec3.ZERO;
        this.properties.glow = this.properties.glow ? this.properties.glow : 0.0;
    } else {
        this.properties.solid = this.properties.solid ? true : false;
    }

    this.callbacks = {};
    this._filter = [];
    var self = this;
    this.scriptEnding = function() {
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
        if (this.id === -1) {
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
            print("OWrap: Overlay does not exist in world.");
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

try {
    module.exports = Overlay;
} catch (e) {
    Script.registerValue("Overlay", Overlay);
}