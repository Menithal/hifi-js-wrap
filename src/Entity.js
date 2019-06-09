
/**
Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 3/11/16.
Work in Progress
Distributed under MIT License
See LICENCE for License details.
*/
var Entity;
Entity = function (arg) {
    if (arg === null || arg === undefined || typeof arg === "function") {
        var self = this;
        this.preload = typeof arg === "function" ? arg : function (id) {
            self.id = id;
            Object.keys(self.callbacks).forEach(function (item) {
                self[item] = self.callbacks[item];
                Script.addEventHandler(id, item, self[item]);
            })
        }
        this.callbacks = {};
        this.properties = { grab: { grabbable: false } };
        this._filter = [];
    } else if (typeof arg === "string") {
        this.properties = Entities.getEntityProperties(arg);

        if (this.properties && this.properties !== null && this.properties.length !== 0) {
            this.id = arg;
        } else {
            this.id = null;
            this.properties = {};
        }
    } else {
        if (!arg.grab) {
            arg.grab = { grabbable: false };
        }
        this.properties = arg;
    }
    this.callbacks = {};
    this._filter = [];
};

Entity.prototype = {
    properties: null,
    id: null,
    _filter: null,
    callbacks: null,
    setPreload: function (preload) {
        this.preload = preload;
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
        if (this.id === null && this.id !== undefined) this.id = Entities.addEntity(this.properties, true);
        return this;
    },
    addEntity: function () {
        if (this.id === null && this.id !== undefined) this.id = Entities.addEntity(this.properties);
        return this;
    },
    deleteEntity: function () {
        try {
            if (this.id !== null && this.id !== undefined) Entities.deleteEntity(this.id);
        } catch (e) {
            print("Entity does no longer exist.");
        }
        this.id = null;
        return this;
    },
    sync: function (filter) {
        if (!(this.id === null || this.id === undefined)) {
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
    getJSONUserData: function () {
        return this.properties.userData.length > 0 ? JSON.parse(this.properties.userData) : {};
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
        if (this.id === null || this.id === undefined) return this;
        if (this.callbacks[method] === null) {
            return this;
        }
        Script.removeEventHandler(this.id, method, this.callbacks[method]);
        delete this.callbacks[method];
        return this;
    },
    bind: function (method, callback, override) {
        print('binding method ' + method + this.id);
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
        if (this.id !== null && this.id !== undefined) Script.addEventHandler(this.id, method, callback);

        return this;
    },
    clearInteractions: function () {
        this.unbind("startFarTrigger")
            .unbind("clickDownOnEntity")
            .unbind("continueFarTrigger")
            .unbind("holdingClickOnEntity")
            .unbind("continueFarTrigger")
            .unbind("holdingClickOnEntity");
        return this;
    },
    clearEquip: function () {
        this.unbind("onEquip")
            .unbind("startEquip")
            .unbind("continueEquip")
        return this;
    },
    setOnEquip: function (call) {
        var s = this;
        var startEquip = function (id, arg) {
            var controller = arg[0] === "left" ? Controller.Standard.LT : Controller.Standard.RT;
            call(s, controller, arg);
        };
        if (this.id === null) {
            this.startEquip = startEquip;
        } else {
            this.bind("onEquip", startEquip, false);
        }
        return s;
    },
    setOnEquipTrigger: function (call) {
        var s = this;
        var continueEquip = function (id, arg) {
            var controller = arg[0] === "left" ? Controller.Standard.LT : Controller.Standard.RT
            var triggerValue = Controller.getValue(controller);
            call(s, controller, triggerValue, arg);
        }
        if (this.id === null) {
            this.continueEquip = continueEquip;
        } else {
            this.bind("continueEquip", continueEquip, false);
        }
        return s;
    },
    setOnUnequip: function (call) {
        var s = this;
        var releaseEquip = function (id, arg) {
            var controller = arg[0] === "left" ? Controller.Standard.LT : Controller.Standard.RT
            var triggerValue = Controller.getValue(controller);
            call(s, controller, triggerValue, arg);
        }
        if (this.id === null) {
            this.releaseEquip = releaseEquip;
        } else {
            this.bind("releaseEquip", releaseEquip, false);
        }
        return s;
    },
    setInteractionStart: function (call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        var s = this;
        var startFarTrigger = function () {
            call(s, {
                button: "hand"
            });
        };
        var clickDownOnEntity = function (i, m) {
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
    setInteractionHold: function (call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        var s = this;
        var continueFarTrigger = function () {
            call(s, {
                button: "hand"
            });
        };
        var holdingClickOnEntity = function (i, m) {
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
    setInteractionStop: function (call) { /* Creates Wraps mouse clicks and Trigger calls together. */
        var s = this;
        var stopFarTrigger = function () {
            call(s, {
                button: "hand"
            });
        };
        var clickReleaseOnEntity = function (i, m) {
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
    frameUpdate: function (properties) {
        try {
            if (this.id !== null) Entities.editEntity(this.id, properties);
        } catch (e) {
            print("EWrap: Entity does not exist in world.");
        }
        return this;
    },
    updateEntity: function () {
        try {
            if (this.id !== null) Entities.editEntity(this.id, this.getProperties());
        } catch (e) {
            print("EWrap: Entity does not exist in world.");
        }
        return this.sync();
    },
    getProperties: function (filters) { /* Filtered properties update. We dont need to update everything always, so sometimes its good to define this. */
        filters = (filters === null || filters === undefined) ? this._filter : filters;
        if (filters.length === 0) return this.properties;

        var filtered = {};
        filters.forEach(function (item) {
            filtered.push(this.properties[filters[index]]);
        });

        return filtered;
    }
}


try {
    module.exports = Entity;
} catch (e) {
    Script.registerValue("Entity", Entity);
}