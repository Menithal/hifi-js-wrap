(function(){
  var anim_3_3 = {
    RightArm: Quat.normalize({x:-0.22283199429512024,y:0.663441002368927,z:-0.4608187973499298,w:0.545745313167572}),
    RightShoulder: Quat.normalize({x:0.42289280891418457,y:-0.5406121015548706,z:0.37785103917121887,w:0.6213927865028381}),
    RightForeArm: Quat.normalize({x:-0.012346295639872551,y:-0.00012805779988411814,z:-0.06197546795010567,w:0.9980013370513916}),
    RightHand: Quat.normalize({x:0.04635884240269661,y:-0.06893610954284668,z:-0.010296350345015526,w:0.9964901804924011}),
    RightHandThumb2: Quat.normalize({x:-0.059378717094659805,y:0.07334964722394943,z:0.009868349879980087,w:0.9954881072044373}),
    RightHandIndex1: Quat.normalize({x:0.0078886104747653,y:-0.01792127639055252,z:-0.07539831101894379,w:0.996961236000061}),
    RightHandThumb3: Quat.normalize({x:0.03647269681096077,y:-0.049250852316617966,z:0.006315910257399082,w:0.9981002807617188}),
    RightHandIndex2: Quat.normalize({x:0.04053489491343498,y:-0.0013417272130027413,z:-0.029080618172883987,w:0.9987540245056152}),
    RightHandIndex3: Quat.normalize({x:-0.0081720519810915,y:0.00017584461602382362,z:-0.02144680730998516,w:0.9997366070747375}),
    RightHandMiddle1: Quat.normalize({x:0.17015065252780914,y:-0.025653786957263947,z:-0.04509977996349335,w:0.9840511679649353}),
    RightHandMiddle2: Quat.normalize({x:-0.04662312939763069,y:-0.0006936897989362478,z:0.01529431901872158,w:0.9987953305244446}),
    RightHandMiddle3: Quat.normalize({x:0.042676087468862534,y:-0.0027603167109191418,z:-0.0644962415099144,w:0.9970012307167053}),
    RightHandRing1: Quat.normalize({x:0.14328953623771667,y:-0.012951306067407131,z:0.03328491002321243,w:0.9890361428260803}),
    RightHandRing2: Quat.normalize({x:-0.0017193981911987066,y:-0.00009072078682947904,z:0.04001656919717789,w:0.9991975426673889}),
    RightHandRing3: Quat.normalize({x:0.02036294713616371,y:0.0011778242187574506,z:-0.05565362051129341,w:0.9982417821884155}),
    RightHandPinky1: Quat.normalize({x:0.2154386192560196,y:0.01685698702931404,z:0.15309691429138184,w:0.9642942547798157}),
    RightHandPinky2: Quat.normalize({x:-0.054941266775131226,y:0.0013747852062806487,z:-0.02644159458577633,w:0.9981384873390198}),
    RightHandPinky3: Quat.normalize({x:0.0832923874258995,y:0.002528530778363347,z:0.030239582061767578,w:0.9960630536079407})
  };
  /*
    unbind("startFarTrigger")
      .unbind("clickDownOnEntity")
      .unbind("continueFarTrigger")
  */
  var s = -1;
  var playAnimation = function(set) {
    var list = Object.keys(set);

    list.forEach( function (item, index) {
      var jointIndex = MyAvatar.getJointIndex(item);
      MyAvatar.setJointRotation(jointIndex, set[item]);
    });
  };

  var Hand= function () {};
  Hand.prototype = {
    holdingClickOnEntity: function (id, e) {
      playAnimation(anim_3_3);
      if( s !== -1)
        Script.clearTimeout(s);

      s = Script.setTimeout(function (){
          MyAvatar.clearJointsData();
          var skel = MyAvatar.skeletonModelURL;
          MyAvatar.skeletonModelURL = "";
          MyAvatar.skeletonModelURL = skel;
      },2000)
    }
  };
  return new Hand();
})
