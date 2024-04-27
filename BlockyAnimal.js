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

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events (Shape Type)
  document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function () { g_shapesList = []; clearAll = 1; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function () { g_selectedType = POINT };
  document.getElementById('triButton').onclick = function () { g_selectedType = TRIANGLE };
  document.getElementById('circleButton').onclick = function () { g_selectedType = CIRCLE };


  // Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

  // Size Slider Events
  document.getElementById('angleSlide').addEventListener('mouseup', function () { g_globalAngle = this.value; renderAllShapes(); });
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
  renderAllShapes();
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

function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.5, 0.0);
  body.matrix.scale(0.5, 1, 0.5);
  body.render();

  // Draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0.7, 0, 0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.render();

  var box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix.translate(0, 0, -0.50, 0);
  box.matrix.rotate(-30, 1, 0, 0);
  box.matrix.scale(0.5, 0.5, 0.5);
  box.render();


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

function drawIMG() {
  var snd = new Audio("./resources/audio/omni_speech.mp3");
  snd.play();
  snd.currentTime = 0;

  // White Shirt1
  let x1 = [60 / 100, 0 / 100,
  50 / 100, -100 / 100,
  -60 / 100, 0 / 100];
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 0.3);
  drawTriangle(x1);

  // White Shirt2
  let x1_2 = [-60 / 100, 0 / 100,
  -50 / 100, -100 / 100,
  50 / 100, -100 / 100];
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 0.3);
  drawTriangle(x1_2);

  // Red part of shirt
  let x2 = [-45 / 100, 0 / 100,
  45 / 100, 0 / 100,
  0 / 100, -45 / 100];
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle(x2);

  // General head shape1
  let x3 = [-20 / 100, 0 / 100,
  20 / 100, 0 / 100,
  -20 / 100, 40 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x3);

  // General head shape2
  let x4 = [-20 / 100, 40 / 100,
  20 / 100, 40 / 100,
  20 / 100, 0 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x4);

  // Hair1
  let x5 = [-20 / 100, 30 / 100,
  -20 / 100, 40 / 100,
  -15 / 100, 40 / 100];
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 0.3);
  drawTriangle(x5);

  // Hair2
  let x6 = [20 / 100, 30 / 100,
  20 / 100, 40 / 100,
  15 / 100, 40 / 100];
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 0.3);
  drawTriangle(x6);

  // Hair3
  let x7 = [-20 / 100, 40 / 100,
  -15 / 100, 40 / 100,
  -15 / 100, 50 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x7);

  // Hair4
  let x8 = [20 / 100, 40 / 100,
  15 / 100, 40 / 100,
  15 / 100, 50 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x8);

  // Hair5
  let x9 = [-15 / 100, 40 / 100,
  -15 / 100, 50 / 100,
  15 / 100, 50 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x9);

  // Hair6
  let x10 = [15 / 100, 40 / 100,
  15 / 100, 50 / 100,
  -15 / 100, 40 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x10);

  //Chin1
  let x11 = [-20 / 100, 0 / 100,
  -10 / 100, 0 / 100,
  -10 / 100, -5 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x11);

  //Chin2
  let x12 = [20 / 100, 0 / 100,
  10 / 100, 0 / 100,
  10 / 100, -5 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x12);

  //Chin3
  let x13 = [-10 / 100, 0 / 100,
  -10 / 100, -5 / 100,
  10 / 100, -5 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x13);

  //Chin4
  let x14 = [10 / 100, 0 / 100,
  10 / 100, -5 / 100,
  -10 / 100, 0 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x14);

  //Chin5
  let x15 = [-10 / 100, -5 / 100,
  -7 / 100, -10 / 100,
  7 / 100, -10 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x15);

  //Chin6
  let x16 = [10 / 100, -5 / 100,
  7 / 100, -10 / 100,
  -10 / 100, -5 / 100];
  gl.uniform4f(u_FragColor, 0.94, 0.76, 0.68, 1.0);
  drawTriangle(x16);

  //Eyebrow1
  let x17 = [-5 / 100, 30 / 100,
  -14 / 100, 28 / 100,
  -4 / 100, 27 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x17);

  //Eyebrow2
  let x18 = [5 / 100, 30 / 100,
  14 / 100, 28 / 100,
  4 / 100, 27 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x18);

  //Eyebrow3
  let x19 = [-5 / 100, 30 / 100,
  -7 / 100, 27 / 100,
  -2 / 100, 20 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x19);

  //Eyebrow4
  let x20 = [5 / 100, 30 / 100,
  7 / 100, 27 / 100,
  2 / 100, 20 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x20);

  //Eyeb1
  let x21 = [-11 / 100, 23 / 100,
  -8 / 100, 21 / 100,
  -5 / 100, 23 / 100];
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle(x21);

  //Eye2
  let x22 = [11 / 100, 23 / 100,
  8 / 100, 21 / 100,
  5 / 100, 23 / 100];
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle(x22);

  //Eyeb3
  let x23 = [-11 / 100, 23 / 100,
  -8 / 100, 24 / 100,
  -5 / 100, 23 / 100];
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle(x23);

  //Eye4
  let x24 = [11 / 100, 23 / 100,
  8 / 100, 24 / 100,
  5 / 100, 23 / 100];
  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
  drawTriangle(x24);

  //Mustache1
  let x25 = [-8 / 100, 6 / 100,
  -6 / 100, 10 / 100,
  -6 / 100, 14 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x25);

  //Mustache2
  let x26 = [8 / 100, 6 / 100,
  6 / 100, 10 / 100,
  6 / 100, 14 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x26);

  //Mustache3
  let x27 = [6 / 100, 10 / 100,
  -6 / 100, 10 / 100,
  -6 / 100, 14 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x27);

  //Mustache4
  let x28 = [-6 / 100, 10 / 100,
  6 / 100, 10 / 100,
  6 / 100, 14 / 100];
  gl.uniform4f(u_FragColor, 0.22, 0.22, 0.22, 1.0);
  drawTriangle(x28);

  //Mouth1
  let x29 = [-5 / 100, 7 / 100,
  -5 / 100, 10 / 100,
  5 / 100, 7 / 100];
  gl.uniform4f(u_FragColor, 0.95, 0.60, 0.67, 1.0);
  drawTriangle(x29);

  //Mouth2
  let x30 = [5 / 100, 7 / 100,
  5 / 100, 10 / 100,
  -5 / 100, 10 / 100];
  gl.uniform4f(u_FragColor, 0.95, 0.60, 0.67, 1.0);
  drawTriangle(x30);

  //Mouth3
  let x31 = [-3 / 100, 7 / 100,
  -3 / 100, 10 / 100,
  3 / 100, 10 / 100];
  gl.uniform4f(u_FragColor, 0.87, 0.42, 0.48, 1.0);
  drawTriangle(x31);

  //Mouth4
  let x32 = [3 / 100, 7 / 100,
  3 / 100, 10 / 100,
  -3 / 100, 7 / 100];
  gl.uniform4f(u_FragColor, 0.87, 0.42, 0.48, 1.0);
  drawTriangle(x32);

}