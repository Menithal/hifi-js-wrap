# Wrapper for Entities and Overlays
For [High Fidelity Metaverse's](https://highfidelity.io) JS-Scripting Language
to work alike to JS OOP.

## Note that this is still work in progress.

Allows for JS Chain notation over the Default High Fidelity settings.

In Laymans, This means that you can create and control an entity using just a JS Object with out calling "Entities".

# Entity Manipulation

```
var e = new Entity("uuid")
```
Would bind a High Fidelity Entity into the JS variable `e`.
`e.properties` would contain everything Hifi's `Entities.getEntityProperties`
would return for the uuid from the last sync.

Now `e.properties` does not currently stay uptodate automatically, its only
last time a `sync` was called.

By Default, calling the uuid constructor of `Entity` will call `sync`.

To sync the entity instance later on in the code, we call
```
e.sync()
```  
this makes sure that the entity instance is up-to-date to the one in the world.

Note that `sync`, `filter`, and all `*Entity` functions will always return the instance of the JS Object,
so you can do some chaining, if you so wish:

Forexample:

```
var anewVar = new Entity("uuid")
anewVar.filter(["position"])
       .editProperties({position: Vec3.sum({x:0,z:0,y:1},anewVar.properties.position)})
       .updateEntity()
```
The above would first find uuid and set it to `anewVar`.
it would then be connected to the instance.

Calling `filter(["position"])` sets what we will update to just "position"
edit the position one unit up, and then update it in world. the instance is
then set to the anewVar

# Entity creation

Now, most of the time one isn't looking for an existing entity or overlay
that already exists. You actually are creating them.

Expanding on this, you may want to create a custom object that's not in the world
```
var e = new Entity({properties})
e.addEntity()
```
In this, We create a new `Entity` bound to `entity` then we add this instance of
`entity` to the world via `entity.addEntity()`

# Basic Entity Interaction

Basic Interactions for an entity can be bound with a single callback line
```
e.setInteractionStart(function(instance,event){ print("Interaction")})
```
This binds both hand controllers AND mouse to a single callback.
The event being an [MouseEvent](https://github.com/highfidelity/hifi/blob/master/libraries/script-engine/src/MouseEvent.h)
Instance is the Wrapper Entity, that allows you to manipulate the object.

For Example:
```
var hopper = new Entity({type:"Box", position:MyAvatar.position, name:"Hopper", color:{red:0,blue:0,green:255},dynamic: true, gravity: {x:0,y:-2,z:0}}).addEntity();
hopper.setInteractionStart(function(instance, event){
  instance.filter(["velocity"])
          .editProperties({velocity: {x:0,z:0,y:5}})
          .updateEntity();
})
```

Similarly, interactions can be bound to `setInteractionHold` and `setInteractionStop`

When setInteraction is called, both the Mouse
 AND hand controller interactions are bound to the object.

to clear all interactions, simply call,

```
e.clearInteractions()
```

# Advanced Entity Interaction
