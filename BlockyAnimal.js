// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Consants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events (Shape Type)
  document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function () { g_shapesList = []; clearAll = 1; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function () { g_selectedType = POINT };
  document.getElementById('triButton').onclick = function () { g_selectedType = TRIANGLE };
  document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE };

  document.getElementById('animationYellowOnButton').onclick = function () { g_yellowAnimation = true; }
  document.getElementById('animationYellowOffButton').onclick = function () { g_yellowAnimation = false; }


  document.getElementById('yellowSlide').addEventListener('mousemove', function () { g_yellowAngle = this.value; renderAllShapes(); });

  document.getElementById('magentaSlide').addEventListener('mousemove', function () { g_magentaAngle = this.value; renderAllShapes(); });

  // Size Slider Events
  // document.getElementById('angleSlide').addEventListener('mouseup', function () { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });

}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up the GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();


  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click; 
  canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // renderAllShapes();
  requestAnimationFrame(tick);
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {

  // Save the current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  // // Print some debug information so we know we are running
  // console.log(performance.now());

  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);

}



var g_shapesList = [];


function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  let = [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  }
  else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  }
  else {
    point = new Circle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);


  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();

}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return ([x, y]);
}

function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45 * Math.sin(g_seconds));
  }
}

function renderAllShapes() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Check the time at the start of this function
  var startTime = performance.now();

  var scale = 0.4; // To simulate camera moving away

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).scale(scale, scale, scale);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>





  // Main body
  var bmo1 = new Cube();
  bmo1.color = [112 / 255, 170 / 255, 153 / 255, 1.0];
  bmo1.matrix.scale(2, 2.4, 1.4);
  bmo1.matrix.translate(-0.5, -0.5, -0.5);
  bmo1.render();

  var bodyCoord = new Matrix4(bmo1.matrix);

  // Face-Screen
  var bmo2 = new Cube();
  bmo2.matrix = bodyCoord;
  bmo2.color = [215 / 255, 254 / 255, 221 / 255, 1.0];
  bmo2.matrix.scale(.9, .5, .1);
  bmo2.matrix.translate(.05, .9, -0.01);
  bmo2.render();

  // We do this every time between blocks to make sure a copy is being made.
  // Probably not super efficient


  // Speaker on left side of BMO
  var bmo3 = new Cube();
  bmo3.matrix = new Matrix4(bmo1.matrix);
  bmo3.color = [0, 0, 0, 1];
  bmo3.matrix.scale(.1, .02, .04);
  bmo3.matrix.translate(9.05, 40, 10);
  bmo3.render();
  var bmo4 = new Cube();
  bmo4.matrix = new Matrix4(bmo1.matrix);
  bmo4.color = [0, 0, 0, 1];
  bmo4.matrix.scale(.1, .02, .04);
  bmo4.matrix.translate(9.05, 40, 15);
  bmo4.render();
  var bmo5 = new Cube();
  bmo5.matrix = new Matrix4(bmo1.matrix);
  bmo5.color = [0, 0, 0, 1];
  bmo5.matrix.scale(.1, .02, .04);
  bmo5.matrix.translate(9.05, 35, 8);
  bmo5.render();
  var bmo6 = new Cube();
  bmo6.matrix = new Matrix4(bmo1.matrix);
  bmo6.color = [0, 0, 0, 1];
  bmo6.matrix.scale(.1, .02, .04);
  bmo6.matrix.translate(9.05, 35, 12.5);
  bmo6.render();
  var bmo7 = new Cube();
  bmo7.matrix = new Matrix4(bmo1.matrix);
  bmo7.color = [0, 0, 0, 1];
  bmo7.matrix.scale(.1, .02, .04);
  bmo7.matrix.translate(9.05, 35, 17);
  bmo7.render();
  var bmo8 = new Cube();
  bmo8.matrix = new Matrix4(bmo1.matrix);
  bmo8.color = [0, 0, 0, 1];
  bmo8.matrix.scale(.1, .02, .04);
  bmo8.matrix.translate(9.05, 30, 10);
  bmo8.render();
  var bmo9 = new Cube();
  bmo9.matrix = new Matrix4(bmo1.matrix);
  bmo9.color = [0, 0, 0, 1];
  bmo9.matrix.scale(.1, .02, .04);
  bmo9.matrix.translate(9.05, 30, 15);
  bmo9.render();


  // Speaker on right side of BMO
  var bmo10 = new Cube();
  bmo10.matrix = new Matrix4(bmo1.matrix);
  bmo10.color = [0, 0, 0, 1];
  bmo10.matrix.scale(.1, .02, .04);
  bmo10.matrix.translate(-0.05, 40, 10);
  bmo10.render();
  var bmo11 = new Cube();
  bmo11.matrix = new Matrix4(bmo1.matrix);
  bmo11.color = [0, 0, 0, 1];
  bmo11.matrix.scale(.1, .02, .04);
  bmo11.matrix.translate(-0.05, 40, 15);
  bmo11.render();
  var bmo12 = new Cube();
  bmo12.matrix = new Matrix4(bmo1.matrix);
  bmo12.color = [0, 0, 0, 1];
  bmo12.matrix.scale(.1, .02, .04);
  bmo12.matrix.translate(-0.05, 35, 8);
  bmo12.render();
  var bmo13 = new Cube();
  bmo13.matrix = new Matrix4(bmo1.matrix);
  bmo13.color = [0, 0, 0, 1];
  bmo13.matrix.scale(.1, .02, .04);
  bmo13.matrix.translate(-0.05, 35, 12.5);
  bmo13.render();
  var bmo14 = new Cube();
  bmo14.matrix = new Matrix4(bmo1.matrix);
  bmo14.color = [0, 0, 0, 1];
  bmo14.matrix.scale(.1, .02, .04);
  bmo14.matrix.translate(-0.05, 35, 17);
  bmo14.render();
  var bmo15 = new Cube();
  bmo15.matrix = new Matrix4(bmo1.matrix);
  bmo15.color = [0, 0, 0, 1];
  bmo15.matrix.scale(.1, .02, .04);
  bmo15.matrix.translate(-0.05, 30, 10);
  bmo15.render();
  var bmo16 = new Cube();
  bmo16.matrix = new Matrix4(bmo1.matrix);
  bmo16.color = [0, 0, 0, 1];
  bmo16.matrix.scale(.1, .02, .04);
  bmo16.matrix.translate(-0.05, 30, 15);
  bmo16.render();

  
  // Game-Slot
  var bmo17 = new Cube();
  bmo17.matrix = new Matrix4(bmo1.matrix);
  bmo17.color = [21 / 255, 46 / 255, 38 / 255, 1];
  bmo17.matrix.scale(.5, .06, .1);
  bmo17.matrix.translate(0.1, 6, -0.05);
  bmo17.render();

  // Yellow-buttons
  var bmo18 = new Cube();
  bmo18.matrix = new Matrix4(bmo1.matrix);
  bmo18.color = [247 / 255, 218 / 255, 80 / 255, 1];
  bmo18.matrix.scale(.06, .15, .1);
  bmo18.matrix.translate(3, 1, -.4);
  bmo18.render();
  var bmo19 = new Cube();
  bmo19.matrix = new Matrix4(bmo1.matrix);
  bmo19.color = [247 / 255, 218 / 255, 80 / 255, 1];
  bmo19.matrix.scale(.2, .06, .1);
  bmo19.matrix.translate(0.555, 3.3, -.4);
  bmo19.render();
  


  var bmo20 = new Cube();
  bmo20.matrix = new Matrix4(bmo1.matrix);
  bmo20.color = [5 / 255, 14 / 255, 113 / 255, 1];
  bmo20.matrix.scale(.15, .03, .1);
  bmo20.matrix.translate(0.3, 2, -0.15);
  bmo20.render();

  var bmo21 = new Cube();
  bmo21.matrix = new Matrix4(bmo1.matrix);
  bmo21.color = [5 / 255, 14 / 255, 113 / 255, 1];
  bmo21.matrix.scale(.15, .03, .1);
  bmo21.matrix.translate(1.6, 2, -0.15);
  bmo21.render();



  var bmo22 = new Cone();
  bmo22.color = [1.0, 0.0, 0.0, 1.0];
  bmo22.matrix.translate(0, 0, -2);
  bmo22.matrix.rotate(90, 1, 0, 0);
  bmo22.render();






  // var body = new Cube();
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.matrix.translate(-0.25, -0.75, 0.0);
  // body.matrix.rotate(-5, 1, 0, 0);
  // body.matrix.scale(0.5, 0.3, 0.5);
  // body.render();

  // // Draw a left arm
  // var leftArm = new Cube();
  // leftArm.color = [1, 1, 0, 1];
  // leftArm.matrix.setTranslate(0, -0.5, 0.0);
  // leftArm.matrix.rotate(-5, 1, 0, 0);
  // leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);


  // var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  // leftArm.matrix.scale(0.25, 0.7, 0.5);
  // leftArm.matrix.translate(-0.5, 0, 0);
  // leftArm.render();

  // var box = new Cube();
  // box.color = [1, 0, 1, 1];
  // box.matrix = yellowCoordinatesMat;
  // box.matrix.translate(0, 0.65, 0);
  // box.matrix.rotate(g_magentaAngle, 0, 0, 1);
  // box.matrix.scale(0.3, 0.3, 0.3);
  // box.matrix.translate(-0.5, 0, -0.001);
  // // box.matrix.scale(0.2, 0.4, 0.2);
  // box.render();


  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000 / duration) / 10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}