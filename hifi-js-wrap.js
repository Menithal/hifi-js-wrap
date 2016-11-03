/**
Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 3/11/16.
Work in Progress

MIT License

Copyright (c) 2016 Matti Lahtinen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


function Entity(properties) {
  if(typeof properties === "string"){
    this.properties = Entities.getEntityProperties(id)
    if(this.properties && this.properties !== null && this.properties.length !== 0){
      this.id = properties.id
    }else{
      this.id = null
      this.properties = {}
    }
  }else{
    this.properties = properties
  }
}
Entity.prototype = {
    properties: {},
    id: null,
    _filter: [],
    filter: function(filter) {
        if(this.id !== null){ // Lets not destroy properties if this isnt even in the world yet!
          this._filter = filter
          return this.sync(filter)
        }
        return this
    },
    addEntity: function() {
        if (this.id === null) {
            this.id = Entities.addEntity(this.properties)
        }
        return this
    },
    deleteEntity: function() {
        try {
            if (this.id !== null) {
                Entities.deleteEntity(this.id)
            }
        } catch (e) {
            print("Entity does no longer exist.")
        }
        this.id = null
        return this
    },
    sync: function(filter) {
        if (this.id !== null) {
            filter = (filter === null || filter === undefined)? this._filter : filter
            var newProperties = Entities.getEntityProperties(this.id, filter)
            print(JSON.stringify(newProperties.length))
            if (newProperties.id !== undefined) {
                this.properties = newProperties
            }else{
              print("FCC")
                this.id = null
            }
        }
        this._filter = []
        return this
    },
    getProperties: function(filters) { // Filtered properties update. We dont need to update everything always, so sometimes its good to define this.
        filters = (filters === null || filters === undefined)? this._filter : filters

        if (filters.length === 0) return this.properties
        var filtered = {}
        for (var index in filters) {
            filtered.push(this.properties[filters[index]])
        }
        return filtered
    },
    editProperties: function(newProperties) {
        for (var property in newProperties) {
            this.properties[property] = newProperties[property]
        }
        return this
    },
    updateEntity: function() {
        try {
            if (this.id !== null) {
                Entities.editEntity(this.id, this.getProperties())
            }
        } catch (e) {
            print("EWrap: Entity does not exist in world.")
        }
        return this.sync()
    }
}
