
  /**
  Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
  Matti 'Menithal' Lahtinen on 3/11/16.
  Work in Progress
  Distributed under MIT License
  See LICENCE for License details.
  */

  // Entities can have Overlays as Children, and Overlays can be children of Overlays.
  // TODO: Improve Both Entities and Overlays to allow for Child Management
  // TODO: Allow for Propagation (visibility, especially)
  // TODO: Update To Use node for Compiling
  // TODO: Allow compiling to minify and

  Overlay = function(properties) {
      this.properties = properties ? properties : {};
      // Just setting the same default values
      this.children = [];
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
      children: [],
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
      addChild: function (obj) {
        if(obj instanceof Overlay /* || obj instanceof Entity */) {
          this.children.push(obj)
        } else if (!obj instanceof Entity && obj instanceof Object) {
          var n = new Overlay(obj);
          this.children.push(n)
        }  else {
          throw "Couldn't add a child Overlay";
        }

        return this;
      },
      deleteChild: function(index){
        if(this.children[index] != null){
          var deleted = this.children.splice(index, 1);
          deleted[0].deleteOverlay();
          this.children.deleteOverlay();
        }
        return this;
      },
      deleteChildren: function () {
        this.children.forEach(function (item) {
          item.deleteOverlay();
        });
        this.children = [];
        return this;
      },
      deleteOverlay: function() {
          try {
              if(this.children.length > 0) this.children.forEach(function(item) {item.deleteOverlay();});

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

  Entity = function(arg) {
      if (arg === null || arg === undefined || typeof arg === "function") {
          var self = this;
          this.preload = typeof arg === "function" ? arg : function(id) {
              self.id = id;
              Object.keys(self.callbacks).forEach(function (item) {
                self[item] = self.callbacks[item];
                Script.addEventHandler(id, item, self[item]);
              })
          }
          this.callbacks = {};
          this.properties = {};
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
          this.properties = arg;
      }
      this.callbacks = {};
      this.children = [];
      this._filter = [];
  };

  Entity.prototype = {
      properties: null,
      id: null,
      children: [],
      _filter: null,
      callbacks: null,
      setPreload: function(preload) {
        this.preload = preload;
        return this;
      },
      filter: function(filter) {
          if (this.id !== null && this.id !== undefined) { /* Lets not destroy properties if this isnt even in the world yet! */
              this._filter = filter;
              return this.sync(filter);
          }
          return this;
      },
      addLocalEntity: function() {
          if (this.id === null && this.id !== undefined) this.id = Entities.addEntity(this.properties, true);
          return this;
      },
      addEntity: function() {
          if (this.id === null && this.id !== undefined) this.id = Entities.addEntity(this.properties);
          return this;
      },
      deleteEntity: function() {
          try {
              this.deleteChildren();
              if (this.id !== null && this.id !== undefined) Entities.deleteEntity(this.id);
          } catch (e) {
              print("Entity does no longer exist.");
          }
          this.id = null;
          return this;
      },
      sync: function(filter) {
          if(!(this.id === null || this.id === undefined)) {
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
      getJSONUserData: function(){
        return this.properties.userData.length > 0 ? JSON.parse(this.properties.userData) : {};
      },
      editProperties: function(newProperties) {
          for (var property in newProperties) {
              if(property === "userData" && (newProperties[property].constructor !== "".constructor)) {
                this.properties[property] = JSON.stringify(newProperties[property]);
              } else {
                this.properties[property] = newProperties[property];
              }
          }
          return this;
      },
      callMethod: function(methodName, params) {
          if(this.id === null || this.id === undefined) return this;
          Entities.callEntityMethod(this.id, methodName, params);
          return this;
      },
      unbind: function(method) {
          if(this.id === null || this.id === undefined) return this;
          if (this.callbacks[method] === null) {
              return this;
          }
          Script.removeEventHandler(this.id, method, this.callbacks[method]);
          delete this.callbacks[method];
          return this;
      },
      bind: function(method, callback, override) {
          print('binding method ' + method + this.id);
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
          if(this.id !== null && this.id !== undefined) Script.addEventHandler(this.id, method, callback);

          return this;
      },
      clearInteractions: function() {
          this.unbind("startFarTrigger")
              .unbind("clickDownOnEntity")
              .unbind("continueFarTrigger")
              .unbind("holdingClickOnEntity")
              .unbind("continueFarTrigger")
              .unbind("holdingClickOnEntity");
          return this;
      },
      clearEquip: function() {
          this.unbind("onEquip")
              .unbind("startEquip")
              .unbind("continueEquip")
          return this;
      },
      setOnEquip: function(call) {
          var s = this;
          var startEquip = function(id, arg) {
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
      setOnEquipTrigger: function(call) {
          var s = this;
          var continueEquip = function(id, arg) {
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
      setOnUnequip: function(call) {
          var s = this;
          var releaseEquip = function(id, arg) {
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
      frameUpdate: function(properties) {
        try {
            if (this.id !== null) Entities.editEntity(this.id, properties);
        } catch (e) {
            print("EWrap: Entity does not exist in world.");
        }
        return this;
      },
      addChild: function (obj) {
        if(obj instanceof Overlay || obj instanceof Entity) {
          if (this.id !== null) {
            obj.properties.parentID = this.id;
          }

          this.children.push(obj)
          return obj;
        } else if (!obj instanceof Entity && !obj instanceof Overlay && obj instanceof Object) {
          if (this.id !== null) {
            obj.parentID = this.id;
          }
          var n = new Entity(obj);
          this.children.push(n)
          return n;
        }  else {
          throw "Couldn't add a child Overlay";
        }
        return this;
      },
      deleteChild: function(index){
        if(this.children[index] != null){
          if(this.children[index])
          this.children.deleteOverlay();
          this.children.splice(index, 1);
        }
        return this;
      },
      deleteChildren: function () {
        this.children.forEach(function (item) {
          item.deleteOverlay();
        });
        this.children = [];
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
          filters.forEach(function(item) {
              filtered.push(this.properties[filters[index]]);
          });

          return filtered;
      }
  }
