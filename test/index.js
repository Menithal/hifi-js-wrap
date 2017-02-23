// Entity Test
// Overlay Test

var mocha = require('mocha');
var chai = require('chai');

mocha.setup("bdd");
chai.should();


var Entities = require('./Entities');
var Overlays = require('./Overlays');
var {Entity, Overlay} = require('../src/wrap');

console.log("Test");
