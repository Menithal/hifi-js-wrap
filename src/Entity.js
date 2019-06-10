
/**
Hifi JS Entity Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 6/09/19.

Work in Progress
Distributed under MIT License
See LICENCE for License details.
*/
var Entity;
Entity = function (arg, debug) {

    var self = this;

    this.properties = {};
    if (arg === null || arg === undefined) {
        this.setPreload(function () { });
        this.properties = { grab: { grabbable: false } };
    } else if (typeof arg === "function") {
        // Preload Only
        this.setPreload(arg);
        this.properties = { grab: { grabbable: false } };
    } else if (typeof arg === "string") {
        // Already Existing UUID 
        this.properties = Entities.getEntityProperties(arg);

        if (this.properties && this.properties !== null && this.properties.length !== 0) {
            this.id = arg;
        } else {
            this.id = null;
        }
    } else {
        if (!arg.grab) {
            arg.grab = { grabbable: false };
        }
        this.preload = function () {
            Object.keys(self.callbacks).forEach(function (item) {
                Script.addEventHandler(self.id, item, self.callbacks[item]);
            })

            if (arg.preload) {
                arg.preload(self);
            }
        };
        this.properties = arg;
    }
    this.callbacks = {};
    this._filter = [];

    this.log = function (val) {
        if (debug) {
            console.log("Hifi-js-wrap DEBUG:", val);
        }
    };

    Script.scriptEnding.connect(function () {
        self.unload();
    });
};

Entity.prototype = {
    properties: null,
    id: null,
    _filter: null,
    callbacks: null,
    unload: function () {
        this.scriptEnding();
    },
    setPreload: function (preload) {
        var self = this;
        this.preload = function (id) {
            this.id = id;
            self.sync(["position", "rotation", "dimensions", "parentID"]);
            Object.keys(self.callbacks).forEach(function (item) {
                Script.addEventHandler(self.id, item, self.callbacks[item]);
            })
            preload(self);
        };
        return this;
    },
    filter: function (filter) {
        if (this.id !== null && this.id !== undefined) { /* Lets not destroy properties if this isnt even in the world yet! */
            this._filter = filter;
            return this.sync(filter);
        }
        return this;
    },
    addLocalEntity: function () {
        return this.addEntity(true);
    },
    addEntity: function (local) {
        this.log("addLocalEntity: Creating a new Entity");
        if (this.id === null && this.id !== undefined) {
            // Local can be undefined, thus its state.
            this.id = Entities.addEntity(this.properties, local ? true : false);

            if (this.preload) {
                this.preload(this);
            }
        } else {
            this.log("addEntity: Entity already exists, now just updating " + this.id);
            this.update(this.properties);
        }

        return this;
    },
    deleteEntity: function () {
        this.log("deleteEntity: Deleting Entity " + this.id);
        if (this.id !== null && this.id !== undefined) {
            this.scriptEnding();
            Entities.deleteEntity(this.id);
        }
        else { this.log("deleteEntity: Entity has not yet been added to world"); }

        this.id = null;
        return this;
    },
    setProperties: function (properties) {
        return this.editProperties(properties);
    },
    editProperties: function (newProperties) {
        for (var property in newProperties) {
            if (property === "userData" && (newProperties[property].constructor !== "".constructor)) {
                this.properties[property] = JSON.stringify(newProperties[property]);
            } else {
                this.properties[property] = newProperties[property];
            }
        }
        return this;
    },
    callMethod: function (methodName, params) {
        if (this.id === null || this.id === undefined) return this;
        Entities.callEntityMethod(this.id, methodName, params);
        return this;
    },
    unbind: function (method) {
        if (this.callbacks[method] === null) {
            return this;
        }
        if (this.id !== null && this.id !== undefined) {
            Script.removeEventHandler(this.id, method, this.callbacks[method]);
        }
        delete this.callbacks[method];
        return this;
    },
    bind: function (method, callback, override) {
        this.log("bind: Binding Method " + method + " to " + this.id);
        if (override === undefined) {
            override = true;
        }
        if (this.callbacks[method] !== null) {
            this.unbind(method, this.callbacks[method]);
        }
        var s = this;
        this.callbacks[method] = override ? function () {
            callback(s, this.arguments);
        } : callback;

        if (this.id !== null && this.id !== undefined) {
            Script.addEventHandler(this.id, method, callback);
        }

        return this;
    },
    clearInteractions: function () {
        this.log("clearInteractions: Clearing all interactions from " + this.id);
        this.unbind("startFarTrigger")
            .unbind("clickDownOnEntity")
            .unbind("continueFarTrigger")
            .unbind("holdingClickOnEntity")
            .unbind("continueFarTrigger")
            .unbind("holdingClickOnEntity");
        return this;
    },
    clearEquip: function () {
        this.log("clearInteractions: Clearing all equipment triggers from " + this.id);
        this.unbind("onEquip")
            .unbind("startEquip")
            .unbind("continueEquip")
        return this;
    },
    setOnEquip: function (call) {
        this.log("setOnEquip: Setting Up Equipment Triggers for " + this.id);

        var grabProperties = {};
        if (this.properties && this.properties.grab) {
            grabProperties = this.properties.grab;
            grabProperties.grabbable = true;
            grabProperties.equippable = true;
        } else {
            grabProperties = { grabbable: true, triggerable: false, equippable: true };
        }

        var self = this;
        var startEquip = function (id, arg) {
            self.log("OnEquip: " + id);
            var controller = arg[0] === "left" ? Controller.Standard.LT : Controller.Standard.RT;
            call(self, controller, arg);
        };

        this.bind("onEquip", startEquip, false)
            .update({ grab: grabProperties });

        return this;
    },
    setWhileEquipped: function (call) {
        this.log("setWhileEquipped: Setting While Equipped on " + this.id);
        var grabProperties = {};
        if (this.properties && this.properties.grab) {
            grabProperties = this.properties.grab;
            grabProperties.grabbable = true;
            grabProperties.equippable = true;
        } else {
            grabProperties = { grabbable: true, triggerable: false, equippable: true };
        }
        var self = this;

        var continueEquip = function (id, arg) {
            self.log("continueEquip: " + id);
            var controller = arg[0] === "left" ? Controller.Standard.LT : Controller.Standard.RT
            var triggerValue = Controller.getValue(controller);
            call(self, controller, triggerValue, arg);
        }

        this.bind("continueEquip", continueEquip, false)
            .update({ grab: grabProperties });

        return this;
    },
    setOnUnequip: function (call) {
        this.log("setOnUnequip: Setting up When Unequiping on " + this.id);

        var grabProperties = {};
        if (this.properties && this.properties.grab) {
            grabProperties = this.properties.grab;
            grabProperties.grabbable = true;
            grabProperties.equippable = true;
        } else {
            grabProperties = { grabbable: true, triggerable: false, equippable: true };
        }

        var self = this;
        var releaseEquip = function (id, arg) {
            self.log("releaseEquip: " + id);
            var controller = arg[0] === "left" ? Controller.Standard.LT : Controller.Standard.RT
            var triggerValue = Controller.getValue(controller);
            call(self, controller, triggerValue, arg);
        }

        this.bind("releaseEquip", releaseEquip, false)
            .update({ grab: grabProperties });

        return this;
    },
    /* Creates Wraps mouse clicks and Trigger calls together. */
    setInteractionStart: function (call) {
        this.log("setInteractionStart: Setting up on " + this.id);

        var grabProperties = {};
        if (this.properties && this.properties.grab) {
            grabProperties = this.properties.grab;
            grabProperties.triggerable = true;
        } else {
            grabProperties = { grabbable: false, triggerable: true, equippable: false };
        }

        var self = this;
        var startFarTrigger = function () {
            self.log("startFarTrigger: " + self.id)
            call(self, {
                button: "hand"
            });
        };
        var clickDownOnEntity = function (i, m) {
            self.log("clickDownOnEntity: " + self.id)
            call(self, m);
        };

        this.bind("startFarTrigger", startFarTrigger, false)
            .bind("clickDownOnEntity", clickDownOnEntity, false)
            .update({ grab: grabProperties });

        return this;
    },
    setInteractionHold: function (call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        this.log("setInteractionHold: Setting up on " + this.id);

        var grabProperties = {};
        if (this.properties && this.properties.grab) {
            grabProperties = this.properties.grab;
            grabProperties.triggerable = true;
        } else {
            grabProperties = { grabbable: false, triggerable: true, equippable: false };
        }

        var self = this;
        var continueFarTrigger = function () {
            self.log("continueFarTrigger: " + self.id);
            call(self, {
                button: "hand"
            });
        };
        var holdingClickOnEntity = function (i, m) {
            self.log("holdingClickOnEntity: " + self.id);
            call(self, m);
        };

        this.bind("continueFarTrigger", continueFarTrigger, false)
            .bind("holdingClickOnEntity", holdingClickOnEntity, false)
            .update({ grab: grabProperties });


        return this;
    },
    setInteractionStop: function (call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        this.log("setInteractionStop: Setting up on " + this.id);

        var grabProperties;
        if (this.properties && this.properties.grab) {
            grabProperties = this.properties.grab;
            grabProperties.triggerable = true;
        } else {
            grabProperties = { grabbable: false, triggerable: true, equippable: false };
        }

        var self = this;
        var stopFarTrigger = function () {
            self.log("stopFarTrigger: " + self.id);
            call(self, {
                button: "hand"
            });
        };
        var clickReleaseOnEntity = function (i, m) {
            self.log("clickReleaseOnEntity: " + self.id);
            call(self, m);
        };


        this.bind("stopFarTrigger", stopFarTrigger, false)
            .bind("clickReleaseOnEntity", clickReleaseOnEntity, false)
            .update({ grab: grabProperties });

        return this;
    },
    update: function (properties) {
        this.log("update: updating properties for " + this.id);
        if (this.id !== null) {
            Entities.editEntity(this.id, properties ? properties : this.getProperties());
        } else {
            this.log("update: Entity has not been added to world!");
        }
        return this;
    },
    sync: function (filter) {
        this.log("sync: Syncronizing properties to object for " + this.id);
        if (!(this.id === null || this.id === undefined)) {
            filter = (filter === null || filter === undefined) ? this._filter : filter;
            var newProperties = Entities.getEntityProperties(this.id, filter);
            if (newProperties.id !== undefined) {
                this.properties = newProperties;
            } else {
                this.id = null; // Entity No longer exists.
            }
        } else {
            this.log("sync: Entity has not been added to world!");
        }
        this._filter = [];
        return this;
    },
    getProperties: function (filters) { /* Filtered properties update. We dont need to update everything always, so sometimes its good to define this. */

        this.log("getProperties: Getting new properties for " + this.id);
        filters = (filters === null || filters === undefined) ? this._filter : filters;
        if (filters.length === 0) return this.properties;

        var filteredProperties = {};
        filters.forEach(function (item) {
            filteredProperties.push(this.properties[filters[index]]);
        });

        return filteredProperties;
    },

    getJoint: function (bone) {
        return Entities.getJointIndex(this.id, bone);
    },
    getJointRelativePosition: function (bone) {
        if (this.id) {
            if (isNaN(bone)) {
                bone = this.getJoint(bone);
            }
            return Entities.getAbsoluteJointTranslationInObjectFrame(this.id, bone);
        }
        return null;
    },
    getJointRelativeRotation: function (bone) {
        if (this.id) {
            if (isNaN(bone)) {
                bone = this.getJoint(bone);
            }
            return Entities.getAbsoluteJointRotationInObjectFrame(this.id, bone);
        }
        return null;
    },
    getJSONUserData: function () {
        return this.properties.userData.length > 0 ? JSON.parse(this.properties.userData) : {};
    },
    scriptEnding: function () {
        this.log("scriptEnding: Clearing Script Triggers for " + this.id + ". Remember to delete after.");
        var self = this;
        return this.clearInteractions().clearEquip();
    }
}

try {
    module.exports = Entity;
} catch (e) {
    Script.registerValue("Entity", Entity);
}