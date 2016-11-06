/**
Example of a "Personal Space Shield" hud button which when pressed instantly
pushes everyone within a radius away from the user.

Distributed under MIT. see License.

*/

Script.include("../hifi-js-wrap.min.js?" + Math.random());
var Entity;
(function() {
    var toolBar = Toolbars.getToolbar("com.highfidelity.interface.toolbar.system");
    // Gets existing Highfidelity tool bar
    var button = toolBar.addButton({
        objectName: "shield",
        imageURL: Script.resolvePath("icon-shield.svg?fo5x"),
        buttonState: 2,
        defaultState: 1,
        hoverState: 0,
        alpha: 0.9
    });
    // Adds a button to the above toolbar
    // Creates an function
    var triggerShield = function() {
        // When this function is called,
        // Create a bubble sphere thats linked only to its user.
        // Add it to the world
        var shield = new Entity({
            type: "Sphere",
            lifetime: 6,
            name: "Shield" + Math.random(),
            collidesWith: "static,dynamic,kinematic,otherAvatar,",
            owningAvatarID: MyAvatar.sessionUUID,
            dimensions: {
                x: 0.01,
                y: 0.01,
                z: 0.01
            },
            density: 100000,
            position: MyAvatar.position,
            parentID: MyAvatar.sessionUUID
        }).addEntity();
        // Adds the entity to the world.
        // Create a function used in update
        var timer = 0;
        var growShield = function(dt) {
            timer += dt;
            // Store time that has passed, if we get cummulitive
            var size = Vec3.sum(shield.properties.dimensions, {
                x: 100 * dt,
                z: 100 * dt,
                y: 100 * dt
            });
            if (size.x < 5) {
                shield.sync(['dimensions']).editProperties({
                    dimensions: size
                }).updateEntity(); // Edit and update the objects dimensions only.
            }
            if (timer > 4) { // After 500 ms delete self.
                Script.update.disconnect(growShield);
                shield.deleteEntity();
            }
        }
            // Bind function to update thread.
        Script.update.connect(growShield);
    }
        // When the button is pressed, call the function
    button.clicked.connect(triggerShield);

    Script.scriptEnding.connect(function() {
        toolBar.removeButton("shield");
        button.clicked.disconnect(triggerShield);
    })
}());
