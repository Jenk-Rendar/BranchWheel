// Code goes here

(function() {

  function createScoreBoard(scene, scale) {
    var billboard = BABYLON.MeshBuilder.CreatePlane("billboard", {width: scale * 20, height: scale * 10}, scene);
  }
  

  $(document).ready(function(){
			var test = "test";
  });

  window.addEventListener('DOMContentLoaded', function() {   

    var canvasId = 'renderCanvas'
    //get the html5 canvas
    var canvas = document.getElementById(canvasId);
    //get the babylon engine
    var engine = new BABYLON.Engine(canvas, true, {
      stencil: true
    });
	var scene = new BABYLON.Scene(engine); 

    var atmList = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}, {id:11}, {id:12}, {id:13}, {id:14}, {id:15}, {id:16}, {id:17}, {id:18}, {id:19}, {id:20}, {id:21}, {id:22}, {id:23}, {id:24} ];    
    var tellerList = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}, {id:11}, {id:12}];

    var branchWheelConfig = new BranchWheelConfig(canvasId, engine, scene, atmList, tellerList);

    var branchWheel = CreateBranchWheel(branchWheelConfig);    

    var camera = new BABYLON.FreeCamera('freeCamera', new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(branchWheel.pillar.position);
    var light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), scene);

    // the canvas/window resize event handler
    window.addEventListener('resize', function() {
      engine.resize();
    });

    //now we define a render loop
    engine.runRenderLoop(function() {
      scene.render();
      updateTubePositions(branchWheel.pillar.bottom, branchWheel.atms, branchWheel.atmTubes);
      updateTubePositions(branchWheel.pillar.top, branchWheel.tellers, branchWheel.tellerTubes);
      //tellers[0].animations[0].pause();
    }); //end engine loop

  }); //end addEventListener

}()); //end iffy