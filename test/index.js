var mocha = require('mocha');
var chai = require('chai');

var World = require('./World');
var EntitiesModule = require('./Entities');
var OverlaysModule = require('./Overlays');

var TestWorld = new World();

var Entities = new EntitiesModule(TestWorld);
var Overlays = new OverlaysModule(TestWorld);

var {Entity, Overlay} = require('../src/wrap');

var assert = require('assert');
chai.should();

describe("Utility", function () {
  var test, entity, worldEntity;
  before(function() {
    Entities.addEntity({type:"Cylinder"})
    Overlays.addOverlay({type: "Cube"})
    Entities.addEntity({type:"Sphere"})
    Overlays.addOverlay({type: "Cube"})
    Entities.addEntity({type:"Cylinder"})
    Overlays.addOverlay({type: "Sphere"})
    Entities.addEntity({type:"Sphere"})

    entityKey = Entities.addEntity({type:"Box"});

    localEntityKey = Entities.addEntity({type:"Box", userData:"localExample"}, true);
    overlayKey = Overlays.addOverlay({type:"Line3d", userData: "overlayTest"});

    Overlays.addOverlay({type: "Cube", userData: "blub"})
    Entities.addEntity({type:"Cylinder"})
    Overlays.addOverlay({type: "Cube"})
    Overlays.addOverlay({type: "Cube"})
    Entities.addEntity({type:"Sphere"})
  });

  describe("#World", function () {
    it("should successfully add objects to world", function () {
      let world = new World();
      world.add({});
      world.add({});
      world.add({});
      world.count().should.be.above(2);
    })
    it("should successfully remove ", function () {
      let world = new World();
      world.add({userData: "TestWorld"});
      var keep = world.add({userData: "keepTester"});
      world.add({userData: "agb"});
      var id = world.add({userData: "bda"});
      world.add({userData: "98319831"});
      var id2 = world.add({userData: "asdfasdf"});
      world.add({userData: "hasdfnx"});

      world.remove(id);
      world.remove(id2);
      world.count().should.be.equal(5);
      world.get(keep).userData.should.equal("keepTester");
    })
    it("should succesfully modify", function () {
      let world = new World();
      world.add({userData: "TestWorld"});
      var id = world.add({userData: "keepTester"});
      world.add({userData: "agb"});
      world.get(id).userData = "modifier tester";
      world.get(id).userData.should.equal("modifier tester");
    })
  });

  describe("#Entities", function () {
    it("should not mix Overlays", function () {
      let entity = Overlays.getOverlayProperties(entityKey);
      entity.should.deep.equal({});
    })
    it("should add Entities", function () {
      let entity = Entities.getEntityProperties(entityKey);
      entity.id.should.equal(entityKey);
      entity.type.should.equal('Box');
      entity.worldType.should.equal('Entity');
    });
    it("should add Local Entities", function () {
      let entity = Entities.getEntityProperties(localEntityKey);
      entity.id.should.equal(localEntityKey);
      entity.userData.should.equal("localExample");
      entity.type.should.equal('Box');
      entity.worldType.should.equal('Entity');
    });
    it("should add delete test", function () {
      let existEntity = Entities.getEntityProperties(entityKey);
      Entities.deleteEntity(entityKey);
      let removedEntity = Entities.getEntityProperties(entityKey);
      removedEntity.should.deep.equal({});
    })
  });
  describe("#Overlays", function () {
    it("should add Overlays", function () {
      let overlay = Overlays.getOverlayProperties(overlayKey);
      overlay.userData.should.equal("overlayTest")
    });
    it("should not mix Entities", function () {
      let overlay = Entities.getEntityProperties(overlayKey);
      overlay.should.deep.equal({});
    })

  });
})
