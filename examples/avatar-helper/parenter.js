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
        objectName: "parenting-button",
        imageURL: Script.resolvePath("icon-shield.svg?fo5x"),
        buttonState: 2,
        defaultState: 1,
        hoverState: 0,
        alpha: 0.9
    });
    // Adds a button to the above toolbar
    // Creates an function
    var parentUI = null;
    var belowAvatar = function(){
      var ray = {origin: MyAvatar.position, direction: {x:0,y:-1,z:0}};
      var trace = Entities.findRayIntersection(ray, true, [],  MyAvatar.sessionUUID);
      if(trace.intersects && trace.distance < 2){
        return trace.entityID;
      }
      return null;
    };
    var triggerParenting = function() {
      if (parentUI) {
        parentUI = null;
      } else {
        parentUI = belowAvatar();
        print("parented", parentUI);
      }
      if(!parentUI) MyAvatar.orientation = Quat.ZERO;
      MyAvatar.setParentID(parentUI);
    }
        // When the button is pressed, call the function
    button.clicked.connect(triggerParenting);

    Script.scriptEnding.connect(function() {
      toolBar.removeButton("shield");
      button.clicked.disconnect(triggerParenting);
    })
}());
