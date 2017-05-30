// Code goes here

//-------------------------------------------------------
  var color = d3.scale.ordinal()
    .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  function randomData (type){
    var quantity = getRandomInt(1,50);
    var dataList = [];
    for (var i = 0; i < quantity; i++) {
        var newData = {
          id: getRandomInt(1,10000),
          type: type,
          status: "Status " + getRandomInt(1,5)
      }
      dataList.push(newData);
    }    
    return dataList;
  }

  // function getRandomInt(min, max) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   var randNum = Math.floor(Math.random() * (max - min)) + min;
  //   return randNum;
  // }

//-------------------------------------------------------------------------------------


$(document).ready(function(){
  
  var atmList = randomData("ATM");
  var tellerList = randomData("Teller");
  var combinedList = tellerList.concat(atmList);

  var combinedPieConfig = {
    locationId: "#combinedPie",
    title: "Branch",
    sortValue: "type",
    dataList: combinedList,
    curvedLabel: true
  };
  GenerateD3Pie(combinedPieConfig);

  var tellerPieConfig = {
    locationId: "#tellerPie",
    title: "Teller Status",
    sortValue: "status",
    dataList: tellerList,
    curvedLabel: true
  };
  GenerateD3Pie(tellerPieConfig);

  var atmPieConfig = {
    locationId: "#atmPie",
    title: "Machine Status",
    sortValue: "status",
    dataList: atmList,
    curvedLabel: true
  };  
  GenerateD3Pie(atmPieConfig);

  var canvasId = 'renderCanvas'
  //get the html5 canvas
  var canvas = document.getElementById(canvasId);
  //get the babylon engine
  var engine = new BABYLON.Engine(canvas, true, {
    stencil: true
  });
  var scene = new BABYLON.Scene(engine); 

  // var atmList = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}, {id:11}, {id:12}, {id:13}, {id:14}, {id:15}, {id:16}, {id:17}, {id:18}, {id:19}, {id:20}, {id:21}, {id:22}, {id:23}, {id:24} ];    
  // var tellerList = [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}, {id:6}, {id:7}, {id:8}, {id:9}, {id:10}, {id:11}, {id:12}];

  var branchWheelConfig = new BranchWheelConfig(canvasId, engine, scene, atmList, tellerList);

  var branchWheel = CreateBranchWheel(branchWheelConfig);    

  var camera = new BABYLON.FreeCamera('freeCamera', new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(branchWheel.pillar.position);
  var light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), scene);

  // the canvas/window resize event handler
  $(window).resize(function() {
    engine.resize();
  });

  //now we define a render loop
  engine.runRenderLoop(function() {
    scene.render();
    updateTubePositions(branchWheel.pillar.bottom, branchWheel.atms, branchWheel.atmTubes);
    updateTubePositions(branchWheel.pillar.top, branchWheel.tellers, branchWheel.tellerTubes);
    //tellers[0].animations[0].pause();
  }); //end engine loop

  //---------------------------------------------

  // d3.select(".randomize")
  //   .on("click", function(){
  //     change(randomData());
  //   });

}); //end addEventListener