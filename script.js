// Code goes here

//-------------------------------------------------------

  // function randomTypeData (type){
  function randomTypeData (name){
    var newTypeList = new GenericTypeList(name);
    var dataList = [];
    var quantity = getRandomInt(1,50);    
    for (var i = 0; i < quantity; i++) {
      var newStatus = "Status " + getRandomInt(1,5);

      var newId = getUniqueId(1,10000, newTypeList.types.map(function(o) { return o.id; }))
      var newData = new GenericItem(newId, name+"_"+newId, newStatus);

      newTypeList.addTypeData(newStatus,newData);
      

      dataList.push(newData);
    }    

    return newTypeList;
  }

  function randomData (type){
    var quantity = getRandomInt(1,50);
    var dataList = [];
    for (var i = 0; i < quantity; i++) {
      var newData = {
        id: getUniqueId(1,10000, dataList.map(function(o) { return o.id; })),
        type: type,
        status: "Status " + getRandomInt(1,5)
      }
      dataList.push(newData);
    }    
    return dataList;
  }  

  function generateTypeData (type, typeList){
    var typeIdList = typeList.map(function(o) { return o.id; })
    var newType = {
      id: getUniqueId(1,100, typeIdList),
      name: type,
    };
    typeList.push(newType);
    return typeList;
  }  

//-------------------------------------------------------------------------------------


$(document).ready(function(){

  var branchTypes = new GenericTypeList("Branch");

  branchTypes.addTypeData("ATM", randomTypeData("ATM"));
  branchTypes.addTypeData("Teller", randomTypeData("Teller"));

  var atmType = {
    id: getUniqueId(1,100, []),
    name: "ATM",
  };

  var tellerType = {
    id: getUniqueId(1,100, [atmType.id]),
    name: "Teller",
  };
  
  var atmList = randomData("ATM");
  var tellerList = randomData("Teller");

  // var atmList = randomData(atmType);
  // var tellerList = randomData(tellerType);
  var combinedList = tellerList.concat(atmList);

  var combinedPieConfig = {
    locationId: "#combinedPie",
    title: "Branch",
    sortValue: "type",
    dataList: combinedList,
    // dataList: branchTypes,
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

  var branchWheelConfig = new BranchWheelConfig(canvasId, engine, scene, atmList, tellerList);

  var branchWheel = CreateBranchWheel(branchWheelConfig);    

  var camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 0, branchWheel.pillar.position, scene);
  camera.setPosition(new BABYLON.Vector3(0, 5, -10));
  camera.attachControl(canvas, true);
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

  d3.select(".randomize")
    .on("click", function(){
      change(randomData());
    });

}); //end addEventListener