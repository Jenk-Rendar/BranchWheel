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

  function mapDataToBranchWheel(genericDataMap){

    var atmData = genericDataMap.getTypeByName("ATM").data[0].types.map(function(t,i){ return t.data.map(function(o,j){ return o;});});
    var tellerData = genericDataMap.getTypeByName("Teller").data[0].types.map(function(t,i){ return t.data.map(function(o,j){ return o;});});

    var atms = [].concat.apply([], atmData);
    var tellers = [].concat.apply([], tellerData);

    var newBranchWheelData = {
      id: genericDataMap.id,
      name: genericDataMap.name,
      atms: atms,
      tellers: tellers,
    }

    return newBranchWheelData;
  }

//-------------------------------------------------------------------------------------


$(document).ready(function(){

  var branchTypes = new GenericTypeList("Branch");

  branchTypes.addTypeData("Teller", randomTypeData("Teller"));
  branchTypes.addTypeData("ATM", randomTypeData("ATM"));

  var combinedPieConfig = {
    locationId: "#combinedPie",
    title: "Branch",
    sortValue: "name", // default is "name"
    dataList: branchTypes,
    curvedLabel: true 
  };
  GenerateD3Pie(combinedPieConfig);

  var tellerPieConfig = {
    locationId: "#tellerPie",
    title: "Teller Status",
    sortValue: "name", // default is "name"
    dataList: branchTypes.getTypeByName("Teller"),
    curvedLabel: true
  };
  GenerateD3Pie(tellerPieConfig);

  var atmPieConfig = {
    locationId: "#atmPie",
    title: "Machine Status",
    sortValue: "name", // default is "name"
    dataList: branchTypes.getTypeByName("ATM"),
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

  var branchWheelData = mapDataToBranchWheel(branchTypes);

  var branchWheelConfig = new BranchWheelConfig(canvasId, engine, scene, branchWheelData.atms, branchWheelData.tellers);  

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