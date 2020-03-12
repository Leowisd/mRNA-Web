// Setup to load data from rawgit
NGL.DatasourceRegistry.add(
    "data", new NGL.StaticDatasource( "//cdn.rawgit.com/arose/ngl/v2.0.0-dev.32/data/" )
);

// Create NGL Stage object
var stage = new NGL.Stage( "viewport" );

// Handle window resizing
window.addEventListener( "resize", function( event ){
    stage.handleResize();
}, false );


// Code for example: interactive/annotation

stage.loadFile("data://3SN6.cif").then(function (o) {
  o.addRepresentation("cartoon", { color: "chainname" })

  var chainData = {
    "A": { text: "alpha subunit", color: "firebrick" },
    "B": { text: "beta subunit", color: "orange" },
    "G": { text: "gamma subunit", color: "khaki" },
    "R": { text: "beta 2 adrenergic receptor", color: "skyblue" },
    "N": { text: "nanobody", color: "royalblue" }
  }

  var ap = o.structure.getAtomProxy()
  o.structure.eachChain(function (cp) {
    ap.index = cp.atomOffset + Math.floor(cp.atomCount / 2)
    var elm = document.createElement("div")
    elm.innerText = chainData[ cp.chainname ].text
    elm.style.color = "black"
    elm.style.backgroundColor = chainData[ cp.chainname ].color
    elm.style.padding = "8px"
    o.addAnnotation(ap.positionToVector3(), elm)
  }, new NGL.Selection("polymer"))

  o.autoView()

  var pa = o.structure.getPrincipalAxes()
  var q = pa.getRotationQuaternion()
  q.multiply(o.quaternion.clone().inverse())
  stage.animationControls.rotate(q, 0)
  stage.animationControls.move(o.getCenter(), 0)
})





var selectionObject = new NGL.Selection(selection);

var labelText = {};
structure.eachAtom(function(atomProxy) {
  // if you don't want a label and can't be more specific with the selection
  // set `labelText[atomProxy.index] = ""`
  labelText[atomProxy.index] = "Hello " + atomProxy.qualifiedName();
}, selectionObject);

structureComponent.addRepresentation(
  'label',
  {
    sele: selection,
    color: '#111111',
    name: 'myLabel',
    labelType: 'text',
    labelText: labelText
  }
);

