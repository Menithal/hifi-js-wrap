
/**
Hifi JS Wrap Library Prototype (USE AT YOUR OWN RISK)
Matti 'Menithal' Lahtinen on 3/11/16.
Work in Progress
Distributed under MIT License
See LICENCE for License details.
*/
/*
  Entities can have Overlays as Children, and Overlays can be children of Overlays.
*/
function defaultBuilder(object, param, def) {
  return object[param] ? object[param]: def
}
function deepUpsert(properties, newValues) {
  newValues.forEach((value, key) => {
    if(!properties[key]) {
      properties[key] = value
    }
  })
}
/*
  High Fidelity js
  Has no console object, but to keep this more js like, going write like such
  this override will only occur
*/
if(!console) {
  var print = print ? print : function(){};
  console = {}
  stringify = (str) => {
    if (typeof str[0] === 'string') {
      if (str.length > 1) {
        return str[0] + stringify(str.filter((v,i)=> i > 0))
      }
      return [0]
    } else  if (str instanceof Object) {
      var build = "{"
      Object.keys(str).forEach((index) => {
        build+= `${index}:${str[index]},`
      })
      build += "}"
      return str
    }
    return str
  }
  console.debug = () => {
    print(`js-wrap-debug: ${stringify(arguments)}`)
  }
  console.log = () => {
    print(`js-wrap-log: ${stringify(arguments)}`)
  }
  console.warn = () => {
    print(`js-wrap-warn: ${stringify(arguments)}`)
  }
  console.error = () => {
    print(`js-wrap-error: ${stringify(arguments)}`)
  }
}
/*
  Overlay
*/
const NULL_ID = '{000000000-0000-0000-0000-0000000000000}'
class HifiObject {
  constructor(properties = {}) {
    this.id = defaultBuilder(properties, 'id', NULL_ID)
    this.parentId = defaultBuilder(properties, 'parentID', NULL_ID)
    this.parent = null
    this.children = []
  }
  setParent(item) {
    if (item instanceof HifiObject) {
      if (!this.id.equals(NULL_ID)) {
        this.parentId = item.id
        this.parent = item
        item.children.push(this)
      }
    }
  }
  getParent() {
    return this.parent
  }
  getChildren() {
    return this.children
  }
  clearParent() {
    if (this.parent === null) {
      let index = this.parent.children.indexOf(e => e === this )
      this.parent.children.splice(index, 1)
      this.parent = null
    }
  }
  clearChildren() {
    this.children.forEach(item => item.clearParent())
  }
  removeSelf() {
    this.children.forEach(item => item.removeSelf())
    delete this.parent
    delete this.children
    this.parentId = NULL_ID
    this.id = NULL_ID
  }
}

class Overlay extends HifiObject {
  constructor(properties = {}) {
    super(properties)
    this.properties = properties
    this.properties.scale = defaultBuilder(this.properties, 'scale', {x:1,y:1,z:1})
    this.properties.position = defaultBuilder(this.properties, 'position', MyAvatar.position)
    this.properties.rotation = defaultBuilder(this.properties, 'rotation', Quat.ZERO)
    this.properties.rotation = defaultBuilder(this.properties, 'color', {red:128,blue:128,green:128})
    this.properties.alpha = defaultBuilder(this.properties, 'alpha', 1.0)
    this.type = defaultBuilder(this.properties, 'type', 'cube')

    if (this.properties.type.equals('line3d')) {
      this.properties.start = defaultBuilder(this.properties, 'start', Vec3.ZERO)
      this.properties.end = defaultBuilder(this.properties, 'end', Vec3.ZERO)
      this.properties.glow = defaultBuilder(this.properties, 'glow', 0)
    } else {
      this.properties.glow = defaultBuilder(this.properties, 'solid', false)
    }
    this._scriptEnding = () => {
      this.deleteOverlay()
      Script.scriptEnding.disconnect(this._scriptEnding)
    }
    Script.scriptEnding.connect(this._scriptEnding)
  }
  addOverlay() {
    if (this.id === null) {
      this.id = Overlays.addOverlay(this.type, this.properties)
      if(this.children.length > 0) {
        this.children.forEach(item => item.addOverlay())
      }
    }
    return this
  }
  deleteOverlay() {
    try {
      if (this.id !== null) Overlays.deleteOverlay(this.id)
    } catch (e) {
      console.warn(`OWrap: Overlay ${this.id} does no longer exist`)
    }
    this._remove()
  }
  updateOverlay() {
    try {
      if (this.id !== null) Overlays.editOverlay(this.id, this.properties)
    } catch (e) {
      console.warn(`OWrap: Overlay ${this.id} does not exist in world`)
    }
    return this
  }
  /*
    Child Manager here
  */
  addChild(...child) {
    if (child instanceof Overlay) {
      child.setParent(this)
      if (this.id.equals(NULL_ID)) {
        if (child.id.equals(NULL_ID)) {
          child.addOverlay()
        } else {
          child.updateOverlay()
        }
      }
    } else if (child instanceof Array) {
      child.forEach((item) => this.addChild(item))
    } else {
      console.warn(`OWrap: Could not add Overlay ${this.id}, addChild was called with an unexpected value`, child)
    }
  }
}

class Entity extends HifiObject {
  constructor (arg = {}) {
    super()
    this._filter = []
    this.callbacks = {}
    if (arg === null || arg === undefined || typeof arg === "function") {
      this.preload = typeof arg === "function" ?
        arg : (id) => {
          this.id = id
          Object.keys(this.callbacks).forEach((item) => {
            this[item] = this.callbacks[item]
            Script.addEventHandler(id, item, this[item])
          })
        }
    } else if (typeof arg === "string") {
      this.properties = Entities.getEntityProperties(arg)
      if (this.properties && this.properties !== null && this.properties.length !== 0) {
        this.id = arg
      } else {
        this.id = null
      }
    } else {
      this.properties = arg
    }
  }
  sync(filter) {
    if (!(this.id.equals(NULL_ID))) {
      filter = (filter === null || filter === undefined) ? this._filter: filter
      var properties = Entities.getEntityProperties(this.id, filter)
      if (properties.id !== undefined) {
        this.properties = properties
      } else {
        this.id = NULL_ID
      }
    }
    this._filter = []
    return this
  }
  filter(filter) {
    if (this.id.equals(NULL_ID)) {
      this._filter = filter
      return this.sync(filter)
    }
    return this
  }
  addEntity() {
    if(this.id.equals(NULL_ID)) {
      this.id = Entities.addEntity(this.properties)
    }
    return this
  }
  addLocalEntity(){
    if(this.id.equals(NULL_ID)) {
      this.id = Entities.addEntity(this.properties, true)
    }
    return this
  }
  deleteEntity() {
    try {
      if (this.id.equals(NULL_ID)) {
        Entities.deleteEntity(this.id)
      }
    } catch (e) {
      console.warn(`EWrap: Entity ${this.id} no longer exists`)
    }
    this.removeSelf()
    return this
  }
  getJSONUserData() {
    return this.properties.userData.length > 0 ?
              JSON.parse(this.properties.userData) : {}
  }
  editProperties(properties) {
    properties.forEach((item, key) => {
      if (item.equals('userData') && item.constructor !== "".constructor) {
        this.properties[property] = JSON.stringify(item)
      } else {
        this.properties[property] = item
      }
    })
    return this
  }
  callMethod(methodName, params) {
    if (this.id.equals(NULL_ID)) return this
    Entities.callEntityMethod(this.id, methodName, params)
    return this
  }
  setPreload(preload) {
    this.preload = preload
    return this
  }
  bind(method, callback, override) {
    console.log(`EWrap: Binding Method ${method} ${this.id}`)
    if (override) {
      override = true
    }
    if (this.callbacks[method] !== null) {
      this.unbind(method, this.callbacks[method])
    }

    this.callbacks[method] = override ? () => callback(this, arguments): callback

    if (this.id.equals(NULL_ID)) Script.addEventHandler(this.id, method, callback)
    return this
  }
  unbind(method) {
    if (this.id.equals(NULL_ID)) return this
    if (this.callback[method] === null) return this

    Script.removeEventHandler(this.id, method, this.callbacks[method])
    delete this.callbacks[method]
    return this
  }
  clearInteractions() {
    this.unbind('startFarTrigger')
        .unbind('clickDownOnEntity')
        .unbind('continueFarTrigger')
        .unbind('holdingClickOnEntity')
    return this
  }
  clearEquip() {
    this.unbind('onEqual')
        .unbind('startEquip')
        .unbind('continueEquip')
    return this
  }
  setOnEquip(call) {
    var startEquip = (id, arg) => {
      var controller = arg[0] === 'left' ? Controller.Standard.LT : Controller.Standard.RT
      call(this, controller, arg)
    }
    if (this.id.equals(NULL_ID)) {
      this.startEquip = startEquip
    } else {
      this.bind('onEquip', startEquip, false)
    }
    return this
  }
  setOnEquipTrigger(call) {
    var continueEquip = (id, arg) => {
      var controller = arg[0] === 'left' ? Controller.Standard.LT : Controller.Standard.RT
      call(this, controller, arg)
    }
    if (this.id.equals(NULL_ID)) {
      this.continueEquip = continueEquip
    } else {
      this.bind('continueEquip', continueEquip, false)
    }
    return this
  }
  setOnUnequip(call) {
    var releaseEquip = (id, arg) => {
      var controller = arg[0] === 'left' ? Controller.Standard.LT : Controller.Standard.RT
      call(this, controller, arg)
    }
    if(this.id.equals(NULL_ID)) {
      this.releaseEquip = releaseEquip
    } else {
      this.bind("releaseEquip", releaseEquip, false)
    }
    return this
  }
  setInteractionStart(call) {
    var startFarTrigger = () => {
      call(this, {button: "hand"})
    }
    var clickDownOnEntity = (index, method) => {
      call(this, method)
    }
    if (this.id.equals(NULL_ID)) {
      this.clickDownOnEntity = clickDownOnEntity
      this.startFarTrigger = startFarTrigger
    } else {
      this.bind('startFarTrigger', startFarTrigger, false)
          .bind('clickDownOnEntity', clickDownOnEntity, false)
    }
    return this
  }
  setInteractionHold(call) {
    var continueFarTrigger = () => {
      call(this, {
        button: 'hand'
      })
    }
    var holdingClickOnEntity = (index, method) => {
      call(this, method)
    }
    if (this.id.equals(NULL_ID)) {
      this.continueFarTrigger = continueFarTrigger
      this.holdingClickOnEntity = holdingClickOnEntity
    } else {
      this.bind('continueFarTrigger', continueFarTrigger, false)
          .bind('holdingClickOnEntity', holdingClickOnEntity, false)
    }
    return this
  }
  setInteractionStop(call) {
    var stopFarTrigger = () => {
      call(this, {button: 'hand'})
    }
    var clickReleaseOnEntity = (index, method) => {
      call(this, method)
    }
    if (this.id.equals(NULL_ID)) {
      this.stopFarTrigger = stopFarTrigger
      this.clickReleaseOnEntity = clickReleaseOnEntity
    } else {
      this.bind('stopFarTrigger', stopFarTrigger, false)
          .bind('clickReleaseOnEntity', clickReleaseOnEntity, false)
    }
    return this
  }
  frameUpdate(properties) {
    try {
      if(!this.id.equals(NULL_ID)) Entities.editEntity(this.id, properties)
    } catch (e) {
      console.warn(`EWrap: Entity ${this.id} does not exist in world.`)
    }
    return this
  }
  addChild(...child) {
    if (child instanceof Entity) {
      child.setParent(this)
      if (this.id.equals(NULL_ID)) {
        if (child.id.equals(NULL_ID)) {
          child.addEntity()
        } else {
          child.updateEntity()
        }
      }
    } else if (child instanceof Array) {
      child.forEach((item) => this.addChild(item))
    } else {
      console.warn(`EWrap: Could not add Child to Entity ${this.id}, addChild was called with an unexpected value`, child)
    }
  }
  deleteChild(index) {
    var child = this.children.splice(index, 1)
    if (child instanceof Entity) {
      child.deleteEntity()
    } else if (child instanceof Overlay) {
      child.deleteOverlay()
    }
    return this
  }
  deleteChildren() {
    this.children.forEach((item) => {
      if (item instanceof Entity) {
        item.deleteEntity()
      } else if (item instanceof Overlay) {
        item.deleteOverlay()
      }
    })
    return this
  }
  updateEntity() {
    try {
      if (this.id.equals(NULL_ID)) Entities.editEntity(this.id, this.getProperties())
    } catch (e) {
      console.warn(`EWrap: Could not update entity, ${this.id}`)
    }
  }
  getProperties(filter = this._filter) {
    if (filter.length === 0) return this.properties
    var filtered = {}
    filter.forEach((item, index) => filtered.push(this.properties[filter[index]]))
    return filtered
  }
}

module.exports = {Entity, Overlay};
/* */
