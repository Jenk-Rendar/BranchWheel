// function BranchWheel(_canvasId, _engine, _pillar, _scene, _atms, _atmTubes, _tellers, _tellerTubes) {
class BranchWheel {
  constructor(_canvasId, _pillar, _atms, _atmTubes, _tellers, _tellerTubes) {
    this.canvasId = _canvasId;
    //this.engine = _engine;    
    this.pillar = _pillar;
    //this.scene = _scene;
    this.atms = _atms;
    this.atmTubes = _atmTubes;
    this.tellers = _tellers;
    this.tellerTubes = _tellerTubes;
  }

  frameUpdate() {
    for (var i = this.atms.length - 1; i >= 0; i--) {
      this.atms[i].frameUpdate();
    }

    for (var i = this.tellers.length - 1; i >= 0; i--) {
      this.tellers[i].frameUpdate();
    }
  }
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

//abstract base class for ATM & Teller
class CirclingObject {

  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.tube = null;
    this.positions = null;
    this.tubeEndPoint = null;
  }

  setCirclePosition(centerPosition, radius, startingDegree, fps, tubeEndPoint) {
    if (tubeEndPoint === null)
        tubeEndPoint = centerPosition;

    this.tubeEndPoint = tubeEndPoint;


    // calculate positions
    this.positions = calculateCirclingPositions(centerPosition, radius, startingDegree);

    //apply animation for positions
    var animation = new BABYLON.Animation("circlingAnimation" + this.name, "position", fps, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];
    
    for (var p = 0; p < this.positions.length; ++p) {
      keys.push({
        frame: p,
        value: this.positions[p]
      });

    }
    
    animation.setKeys(keys);

    this.mesh.animations = [];
    this.mesh.animations.push(animation);
  }

  startCircling() {
    this.scene.beginAnimation(this.mesh, 0, this.positions.length - 1, true);
  }

  stopCircling() {
    this.scene.stopAnimation(this.mesh);
  }

  // called to update on a new frame.
  frameUpdate() {
    this.tube.updatePath([this.tubeEndPoint, this.mesh.position]);
  }
}

//babylon mesh, local nameplate, babylon.vector3 dimensions, string name
class ATM extends CirclingObject {
  constructor(name, scale, scene, atmMaterial, tubeMaterial) {
    super(scene);
    this.name = name;
    this.scene = scene;

    //create ATM mesh
    var meshBundle = this.createATMMesh(scene, scale, atmMaterial, name);
    this.mesh = meshBundle.mesh;
    this.dimensions = meshBundle.dimensions;
    this.nameplate = this.createATMNameplate(this.mesh, scene, name + "_np", scale, "white");
    //rotate after nameplate for happy geometry
    this.mesh.rotation.y = Math.PI / -2;

    //create tube
    var zeroPath = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero()];
    this.tube = new Tube(tubeMaterial, zeroPath, scene, name + "_atmtube");
    this.tube.startColorAnimation();
  }

  createATMNameplate(atmMesh, scene, name, scale, color) {
    var namePlate = createNamePlate(scene, name, scale, color);
    namePlate.position = new BABYLON.Vector3(scale * 0.02, scale * -0.2, scale * 0.13);
    namePlate.rotation.y = Math.PI / 2;
    namePlate.parent = atmMesh;
    return namePlate;
  }

  createATMMesh(scene, scale, material, name) {
    var lines = [];
    var maxWidth = 0.30;
    var maxHeight = 0.55;
    var maxDepth = 0.25;
    var extrudeScale = scale * 1;

    lines.push(new BABYLON.Vector3(0.00, 0.00, 0.00));
    lines.push(new BABYLON.Vector3(0.00, 0.25, 0.00));
    lines.push(new BABYLON.Vector3(0.10, 0.35, 0.00));
    lines.push(new BABYLON.Vector3(0.10, maxHeight, 0.00));
    lines.push(new BABYLON.Vector3(maxWidth, maxHeight, 0.00));
    lines.push(new BABYLON.Vector3(maxWidth, 0.00, 0.00));
    lines.push(new BABYLON.Vector3(0.00, 0.00, 0.00));
    

    var path = [];
    path.push(new BABYLON.Vector3(0,0,0));
    path.push(new BABYLON.Vector3(0.00, 0.00, maxDepth * scale));
    

    var rotation = 0;
    var atmMesh = BABYLON.Mesh.ExtrudeShape("atmMesh", lines, path, extrudeScale, rotation, BABYLON.Mesh.CAP_ALL, scene, true, 1);
    atmMesh.setPivotMatrix(BABYLON.Matrix.Translation(scale * -0.15, scale * -0.275, scale * -0.125));
    atmMesh.material = material;
    atmMesh.enableEdgesRendering();    
    atmMesh.edgesWidth = 0.70;
    atmMesh.edgesColor = new BABYLON.Color4(0, 0.5, 0, 1);
    
    //--- screen
    var box = BABYLON.MeshBuilder.CreateBox("box", {height: 0.14 * scale, width: 0.17 * scale, depth: 0.014 * scale, updatable: true}, scene);
    box.position = new BABYLON.Vector3(scale * 0.1, scale * 0.45, scale * 0.12);
    box.rotation.y = Math.PI / 2;
    box.material = new BABYLON.StandardMaterial("boxmat", scene);
    box.material.diffuseColor = BABYLON.Color3.Blue();
    box.parent = atmMesh;
    
    return {mesh: atmMesh, dimensions: new BABYLON.Vector3(maxWidth * scale, maxHeight * scale, maxDepth * scale)};
  }
}

class Teller extends CirclingObject {
  constructor(scene, scale, name, tubeMaterial) {
    super(scene);
    this.name = name;
    this.tellerColor = new BABYLON.Color3(18/255, 167/255, 181/255);
    this.bodyHeight = scale * 0.2;
    this.bodyDiameter = scale * 0.15;
    this.dimensions = new BABYLON.Vector3(this.bodyDiameter, this.bodyHeight, this.bodyDiameter);

    //mesh
    this.mesh = this.createTellerMesh(scene, scale, name);
    
    //nameplate
    this.namePlate = this.createTellerNameplate(scene, name + "_np", scale);
    this.namePlate.parent = this.mesh;

    //tube
    var zeroPath = [BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero()];
    this.tube = new Tube(tubeMaterial, zeroPath, scene, name + "_tellertube");
    this.tube.startColorAnimation();
  }

  createTellerMesh(scene, scale, name) {
    var body = createTokenBodyMesh(scene, scale, this.bodyHeight, this.bodyDiameter);
    body.material.diffuseColor = this.tellerColor;
    return body;
  }

  createTellerNameplate(scene, name, scale) {
    var namePlate = createNamePlate(scene, name, scale, BABYLON.Color3.Black().toHexString(), this.tellerColor.toHexString());
    namePlate.position = this.mesh.position.clone();
    namePlate.position.y -= (this.bodyHeight * scale) + .07;
    return namePlate;
  }  
}

class Customer {
  constructor(mesh, dimensions) {
    this.mesh = mesh;
    this.dimensions = dimensions;
  }
}

class Tube {
  constructor(material, path, scene, name) {
    this.radius = 0.015;
    this.tesselation = 3;
    this.name = name;
    this.scene = scene;
    this.maxColorAnimationFrame = 8;

    var tube = BABYLON.MeshBuilder.CreateTube(name, {
      path: path,
      cap: BABYLON.Mesh.NO_CAP,
      radius: this.radius,
      tesselation: this.tesselation,
      updatable: true
      }, 
      this.scene);

    tube.material = material;
    var colorAnimation = new BABYLON.Animation("tubecolorcycle_" + name, "material.diffuseColor", 4, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var colorFrames = [];
    var switchColorDirection =  false;
    //var color = 6;
    var color = material.diffuseColor.clone();

    for (var pos = 0; pos <= this.maxColorAnimationFrame; pos++) {
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
    this.mesh = tube;
  }

  startColorAnimation() {
    this.scene.beginAnimation(this.mesh, 0, this.maxColorAnimationFrame, true);
  }

  stopColorAnimation() {
    this.scene.stopAnimation(this.mesh);
  }

  //takes an array of BABYLON.Vector3 to define the path
  updatePath(newPath) {
      BABYLON.MeshBuilder.CreateTube(null, {
      path: newPath,
      instance: this.mesh,
      cap: BABYLON.Mesh.NO_CAP,
      radius: this.radius,
      tesselation: this.tesselation
    });
  }
} //end class Tube

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
  var customers = [];
  
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
    var atm = new ATM(c.toString(), atmScale, scene, atmMaterial, atmTubeMaterial);
    atm.setCirclePosition(pillar.position, atmDistanceFromCenter, c, atmAnimationSpeed, pillarBottom);
    atm.startCircling();
    atms.push(atm);
  }

  
  // Render Tellers and Spokes
  for (var x = 1; x <=360; x += 360 / numberOfTellers ) {
      var teller = new Teller(scene, tellerScale, x.toString(), tellerTubeMaterial);
    teller.setCirclePosition(pillarTop, tellerDistanceFromCenter, x, tellerAnimationSpeed, pillarTop);
    teller.startCircling();
    tellers.push(teller);
  }

  var pillarData = new BranchWheelPillar(pillar.position, pillarTop, pillarBottom);
  var returnValue = new BranchWheel(canvasId, pillarData, atms, atmTubes, tellers, tellerTubes);

  return returnValue;
}

function isNullOrUndefinedObject(object){
  return object === null || object === undefined;
}

  //textColor & background can be text literals or RGB color codes
  function createNamePlate(scene, name, scale, textColor = "black", background = "transparent") {
    var font = "bold 290px helvetica";
    
    var namePlate = BABYLON.MeshBuilder.CreatePlane("nameplate_" + name, {width: 0.45, height: 0.12}, scene);
    namePlate.material = new BABYLON.StandardMaterial("platemat_" + name, scene);
    //texture size is in pixels
    var textureWidth = 1024;
    var textureHeight = textureWidth / 4;
    var nameTexture = new BABYLON.DynamicTexture("texture_" + name, {width: textureWidth, height: textureHeight } , scene, true);
    namePlate.material.diffuseTexture = nameTexture;
    //namePlate.material.specularcolor = new BABYLON.Color3.Black();
    namePlate.material.backFaceCulling = false;
    
    //formattedName = name.replace("/\r?\n|\r/", ".");
    var yOffset = 256;
    var charWidth = textureWidth / 6;
    var charOffset = charWidth / 2;
    var xOffset = 0;
    if (name.length < 6) {
      xOffset = (6 - name.length) * charOffset;
    }

    //x and y are in pixels
    namePlate.material.diffuseTexture.drawText(name, xOffset, yOffset, font, textColor, background);
    namePlate.material.diffuseTexture.hasAlpha = true;
    return namePlate;
  }


function createTokenBodyMesh(scene, scale, bodyHeight, diameter) {
  var head = BABYLON.MeshBuilder.CreateSphere("head", {diameter: diameter * 0.8 }, scene);
  var body = BABYLON.MeshBuilder.CreateCylinder("body", {height: bodyHeight, diameter: diameter, tessellation: 12}, scene);
  head.parent = body;
  body.position = new BABYLON.Vector3(0,0,0);
  head.position.y += bodyHeight * 0.82 ;
  
  var joinedMesh = BABYLON.Mesh.MergeMeshes([body, head]);

  joinedMesh.material = new BABYLON.StandardMaterial("bodyMat", scene);
  return joinedMesh;
}

function createCustomerMesh(scene, scale)  {
  var bodyHeight = scale * 0.2;
  var bodyDiameter = scale * 0.15;  
  var body = createTokenBodyMesh(scene, scale, bodyHeight, bodyDiameter);
  body.material.diffuseColor = new BABYLON.Color3(201/255,116/255,20/255);
  return new Customer(body, new BABYLON.Vector3(bodyDiameter, bodyHeight, bodyDiameter));
}

//currently ATMs are rotated 90 degrees, so the customer coordinates are z = x & x = z. 
//todo fix that.  probably replace ATM with a model or draw the ATM to LH coordinates
function addCustomer(scene, scale, atm) {
  var customer = createCustomerMesh(scene, scale);
  customer.mesh.position = atm.mesh.position.clone();
  customer.mesh.position.z += atm.dimensions.x * 0.7;
  customer.mesh.position.x -= .1;
  customer.mesh.position.y += customer.dimensions.y / 1;
  customer.mesh.parent = atm.mesh;
  customer.mesh.material.hasAlpha = true;

  //fade in
  var fps = 10;
  var frameCount = 10;
  var valueMin = .1;
  var valueMax = 1;
  var loopAnimation = false;
  BABYLON.Animation.CreateAndStartAnimation("fadein", customer.mesh, 'visibility', fps, frameCount, valueMin, valueMax, loopAnimation);
  return customer;
}

function removeCustomer(scene, customer) {
  //fade out
  var fps = 10;
  var animation = new BABYLON.Animation("fadeout", customer.mesh, fps, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

  var keys = [];
  for (var x = 1; x <= 10; ++x)
    keys.push({ frame: x - 1, value: x / 10 });

  animation.setKeys(keys);
  customer.mesh.animations = [];
  customer.mesh.animations.push(animation);
  var triggerFrame = 9;
  var noLoop = true;
  //destory mesh after fadeout animation
  var endEvent = new BABYLON.AnimationEvent(triggerFrame, function() {customer.mesh.destroy(); customer = null; }, noLoop);
  animation.addEvent(endEvent);
  scene.beginAnimation(customer.mesh, 0, 9, false);
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