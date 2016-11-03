/**
Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 3/11/16.
Work in Progress

Distributed under MIT License
See LICENCE for License details.
*/

function Entity(properties) {
    if (properties === null || properties === undefined) {
      var self = this
      this.preload = function(id){
        self.id = id
        self.sync()
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
            print(JSON.stringify(newProperties.length))
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
        this.unbind("startNearTrigger")
            .unbind("clickDownOnEntity")
            .unbind("continueNearTrigger")
            .unbind("holdingClickOnEntity")
            .unbind("continueNearTrigger")
            .unbind("holdingClickOnEntity")

        return this
    },
    setInteractionStart: function(call) { // Creates Wraps mouse clicks and Trigger calls together.
        var s = this
        this.bind("startNearTrigger", function() {
                call(s, {
                    button: "hand"
                })
            }, false)
            .bind("clickDownOnEntity", function(i, m) {
                call(s, m)
            }, false)
        return this
    },
    setInteractionHold: function(call) { // Creates Wraps mouse clicks and Trigger calls together.
        var s = this
        this.bind("continueNearTrigger", function() {
                call(s, {
                    button: "hand"
                })
            }, false)
            .bind("holdingClickOnEntity", function(i, m) {
                call(s, m)
            }, false)
        return this
    },
    setInteractionStop: function(call) { // Creates Wraps mouse clicks and Trigger calls together.
        var s = this
        this.bind("stopNearTrigger", function() {
                call(s, {
                    button: "hand"
                })
            }, false)
            .bind("clickReleaseOnEntity", function(i, m) {
                call(s, m)
            }, false)
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
