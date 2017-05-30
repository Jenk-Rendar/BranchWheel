// function BranchWheel(_canvasId, _engine, _pillar, _scene, _atms, _atmTubes, _tellers, _tellerTubes) {
  function BranchWheel(_canvasId, _pillar, _atms, _atmTubes, _tellers, _tellerTubes) {
  this.canvasId = _canvasId;
  //this.engine = _engine;    
  this.pillar = _pillar;
  //this.scene = _scene;
  this.atms = _atms;
  this.atmTubes = _atmTubes;
  this.tellers = _tellers;
  this.tellerTubes = _tellerTubes;
}

function BranchWheelPillar(_position, _pillarTop, _pillarBottom) {
  this.position = _position;  
  this.top = _pillarTop;
  this.bottom = _pillarBottom;    
}

function BranchWheelConfig(_canvasId, _engine, _scene, _atmList, _tellerList) {
  this.canvasId = _canvasId;
  this.engine = _engine;  
  this.scene = _scene;  
  this.atmList = _atmList;
  this.tellerList = _tellerList;
}

/// function CreateBranchWheel(config)
///config parameter required contents 
// canvasId - ?  Maybe not if we pass in the engin from the out side
// engine - Babylon Engine
// tellerList - list of tellers in branch
// atmList - list of atms list of atms in branch
/// returns BranchWheel Json Object Containing 
// engine - ? needed if we don't pass it in 
// scene - the scene that contains the Branch Wheel
// pillar - a BranchWheelPillar so we can know where to point the camera
function CreateBranchWheel(config){        

  // passed in params from the config object
  var canvasId = config.canvasId;
  var engine = config.engine;
  var scene = config.scene;

  var atmList = !isNullOrUndefinedObject(config.atmList)? config.atmList : [];
  var numberOfAtms = atmList.length;
  
  var tellerList = !isNullOrUndefinedObject(config.tellerList)? config.tellerList : [];
  var numberOfTellers = tellerList.length;

  // configurable params for rendering the Branch Wheel
  var atms = [];
  var atmTubes = [];
  var tellers = [];
  var tellerTubes = [];
  
  var pillarHeight = 1.5;//0.5; 

  var atmScale = 0.65;    
  var atmAnimationSpeed = 5;
  var atmDistanceFromCenter = 3;    
  var atmPillarOffset = -(pillarHeight / 2); // Bottom of pillar

  var tellerScale = 1;
  var tellerAnimationSpeed = 3;
  var tellerDistanceFromCenter = atmDistanceFromCenter * 0.75;    
  var tellerPillarOffset = pillarHeight * 0.95;    // Top of pillar

  var pillar = createPillar(scene, pillarHeight, getPillarMaterial(scene));
  var pillarBottom = pillar.position.clone();
  pillarBottom.y += atmPillarOffset;
  //pillarBottom.y -= pillarHeight /2;    
  var pillarTop = pillarBottom.clone();  
  pillarTop.y += tellerPillarOffset;
  //pillarTop.y += pillarHeight * 0.95;

  hilightMesh(pillar, scene, "pillar");
  
  var atmTubeMaterial = getTubeMaterial(scene);
  var tellerTubeMaterial = getTellerTubeMaterial(scene);
  var atmMaterial = getAtmMaterial(scene);
  
  // Render Atms and Spokes
  for (var c = 1; c <= 360; c += 360 / numberOfAtms ) {
    var circlePositions = calculateCirclingPositions(pillar.position, atmDistanceFromCenter, c);
    var atm = createATMMesh(scene, atmScale, atmMaterial);
    var tube = createTube(scene, c, atmTubeMaterial);
    setPillarAnimation(atm, circlePositions, atmAnimationSpeed);
    scene.beginAnimation(atm, 0, 360, true);
    scene.beginAnimation(tube, 0, 9, true);
    atms.push(atm);
    atmTubes.push(tube);
  }
  
  // Render Tellers and Spokes
  for (var x = 1; x <=360; x += 360 / numberOfTellers ) {
    var tellerPositions = calculateCirclingPositions(pillarTop, tellerDistanceFromCenter, x);
    var teller = createTellerMesh(scene, tellerScale);
    var tellerTube = createTube(scene, x, tellerTubeMaterial);
    setPillarAnimation(teller, tellerPositions, tellerAnimationSpeed);
    scene.beginAnimation(teller, 0, 360, true);
    scene.beginAnimation(tellerTube, 0, 9, true);
    tellers.push(teller);
    tellerTubes.push(tellerTube);
  }

  var pillarData = new BranchWheelPillar(pillar.position, pillarTop, pillarBottom);
  var returnValue = new BranchWheel(canvasId, pillarData, atms, atmTubes, tellers, tellerTubes);

  return returnValue;
}

function isNullOrUndefinedObject(object){
  return object === null || object === undefined;
}

function createATMMesh(scene, scale, material) {
  var lines = [];
  lines.push(new BABYLON.Vector3(0.00, 0.00, 0.00));
  lines.push(new BABYLON.Vector3(0.00, 0.25, 0.00));
  lines.push(new BABYLON.Vector3(0.10, 0.35, 0.00));
  lines.push(new BABYLON.Vector3(0.10, 0.55, 0.00));
  lines.push(new BABYLON.Vector3(0.30, 0.55, 0.00));
  lines.push(new BABYLON.Vector3(0.30, 0.00, 0.00));
  lines.push(new BABYLON.Vector3(0.00, 0.00, 0.00));
  

  var path = [];
  path.push(new BABYLON.Vector3(0,0,0));
  path.push(new BABYLON.Vector3(0.00, 0.00, scale * 0.25));
  
  var extrudeScale = scale * 1;
  var rotation = 0;
  var atmMesh = BABYLON.Mesh.ExtrudeShape("atmMesh", lines, path, extrudeScale, rotation, BABYLON.Mesh.CAP_ALL, scene, true, 1);
  atmMesh.setPivotMatrix(BABYLON.Matrix.Translation(scale * -0.15, scale * -0.275, scale * -0.125));
  atmMesh.rotation.y = Math.PI / -2;
  atmMesh.material = material;
  atmMesh.enableEdgesRendering();    
  atmMesh.edgesWidth = 0.70;
  atmMesh.edgesColor = new BABYLON.Color4(0, 0.5, 0, 1);
  
  var box = BABYLON.MeshBuilder.CreateBox("box", {height: 0.14 * scale, width: 0.17 * scale, depth: 0.014 * scale, updatable: true}, scene);
  box.position = new BABYLON.Vector3(scale * 0.0, scale * 0.50, scale * 0.12);
  box.rotation.y = Math.PI / 2;
  box.material = new BABYLON.StandardMaterial("boxmat", scene);
  box.material.diffuseColor = BABYLON.Color3.Blue();
  box.parent = atmMesh;

  return atmMesh;
}

function createTokenBodyMesh(scene, scale) {
  //head
  var bodyHeight = scale * 0.2;
  var diameter = scale * 0.15;
  
  var head = BABYLON.MeshBuilder.CreateSphere("head", {diameter: diameter * 0.8 }, scene);
  var body = BABYLON.MeshBuilder.CreateCylinder("body", {height: bodyHeight, diameter: diameter, tessellation: 12}, scene);
  head.parent = body;
  body.position = new BABYLON.Vector3(0,1,0);
  head.position.y += bodyHeight * 0.82 ;
  
  body.material = new BABYLON.StandardMaterial("bodyMat", scene);
  head.material = body.material;
  return body;
}

function createTellerMesh(scene, scale) {
  var body = createTokenBodyMesh(scene, scale);
  body.material.diffuseColor = new BABYLON.Color3(18/255, 167/255, 181/255);
  return body;
}

function createCustomerMesh(scene, scale)  {
  var body = createTokenBodyMesh(scene, scale);
  body.material.diffuseColor = new BABYLON.Color3(201/255,116/255,20/255);
  return body;
}

function getAtmMaterial(scene) {
  var material = new BABYLON.StandardMaterial("atmMeshMaterial", scene);
  material.diffuseColor = new BABYLON.Color3(0.06,0.35,0.1);
  material.specularColor = BABYLON.Color3.Black();
  return material;
}

function getSphereMaterial(scene) {
  var sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
  sphereMaterial.alpha = 1;
  sphereMaterial.diffuseColor = new BABYLON.Color3.Red();
  return sphereMaterial;
}

function getTellerTubeMaterial(scene) {
  var tubeMaterial = new BABYLON.StandardMaterial("tellerTubeMaterial", scene);
  tubeMaterial.alpha = 1;
  tubeMaterial.backFaceCulling = false;
  tubeMaterial.diffuseColor = new BABYLON.Color3(18/255, 167/255, 181/255);
  tubeMaterial.specularColor = new BABYLON.Color3.Black();
  return tubeMaterial;    
}

function getTubeMaterial(scene) {
  var tubeMaterial = new BABYLON.StandardMaterial("tubeMaterial", scene);
  tubeMaterial.alpha = 1;
  tubeMaterial.backFaceCulling = false;
  tubeMaterial.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
  tubeMaterial.specularColor = new BABYLON.Color3(0,0.2,0);
  return tubeMaterial;
}

function getPillarMaterial(scene) {
  var pillarMaterial = new BABYLON.StandardMaterial("pillarMaterial", scene);
  pillarMaterial.alpha = 1;
  pillarMaterial.diffuseColor = new BABYLON.Color3.White();
  return pillarMaterial;
}

function createPillar(scene, height, material) {
  var pillar = BABYLON.MeshBuilder.CreateCylinder("cone", {
    height: height,
    diameter: 0.25,
    tessellation: 15
  }, scene);
  pillar.material = material;
  pillar.position = new BABYLON.Vector3(0,0,0);

  return pillar;
}

function createTube(scene, name, material) {
  var tube = BABYLON.MeshBuilder.CreateTube("tube_" + name, {
    path: [new BABYLON.Vector3.Zero(), new BABYLON.Vector3.Zero()],
    cap: BABYLON.Mesh.CAP_ALL,
    radius: 0.010,
    tesselation: 3,
    updatable: true
  }, scene);
  tube.material = material;
  var colorAnimation = new BABYLON.Animation("tubecolorcycle", "material.diffuseColor", 4, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
  colorFrames = [];
  var switchColorDirection =  false;
  //var color = 6;
  var color = material.diffuseColor.clone();
        for (var pos = 0; pos < 9; pos++) {
          colorFrames.push( { frame: (pos), value: color.clone()});
          
          if (pos === 4)
            switchColorDirection = true;
          
          if (switchColorDirection) {
           color = color.scale(0.9);
          }
          else {
            color = color.scale(1.1);
          }
        }
        
  colorAnimation.setKeys(colorFrames);
  tube.animations = [];
  tube.animations.push(colorAnimation);
  return tube;
}

function setPillarAnimation(circlingObject, positions, fps) {
  if (positions.length === 0)
    throw "sphere positions empty";
  var animation = new BABYLON.Animation("circlingAnimation", "position", fps, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
  var keys = [];

  for (var p = 0; p < positions.length; ++p) {
    keys.push({
      frame: p,
      value: positions[p]
    });
  }
  
  animation.setKeys(keys);
  circlingObject.animations = [];
  circlingObject.animations.push(animation);
}

function calculateCirclingPositions(centerPosition, radius, startingDegree) {
  var yPos = centerPosition.y;
  var xPos, zPos;
  var positions = [];
  for (var x = startingDegree; x <= 360 + startingDegree; x++) {
    xPos = radius * Math.cos(x * Math.PI / 180) + centerPosition.x;
    var centerObjectBottom = 0.125;
    zPos = radius * Math.sin(x * Math.PI / 180) + centerPosition.z;
    positions.push(new BABYLON.Vector3(xPos, yPos, zPos));
  }

  return positions;
}

function hilightMesh(mesh, scene, name) {
  var hilight = new BABYLON.HighlightLayer("glow" + name, scene);
  hilight.addMesh(mesh, mesh.material.diffuseColor);
  var alpha = 0;
  scene.registerBeforeRender(() => {
    alpha += 0.06;
    hilight.blurHorizontalSize = 0.15 + Math.cos(alpha) * 0.1 + 0.1;
    hilight.blurVerticalSize = 0.15 + Math.sin(alpha) * 0.1 + 0.1;
  });
}

function updateTubePositions(centerPosition, spheres, tubes) {
  if (spheres.length != tubes.length)
    throw "spheres and tubes must have the same count";

  var updatedTubes = [];
  for (var p = 0; p < spheres.length; ++p) {
    var newPath = [centerPosition, spheres[p].position];
    var updatedTube = BABYLON.MeshBuilder.CreateTube(null, {
      path: newPath,
      instance: tubes[p],
      cap: BABYLON.Mesh.CAP_ALL,
      radius: 0.015,
      tesselation: 3
    });
  }
}