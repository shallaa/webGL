var c, gl;

var color = [];
var indices = [];
var max = 100000
var ext;

function initWebGL() {
    c = document.getElementById("c");
    gl = c.getContext("experimental-webgl");
    ext = gl.getExtension("OES_element_index_uint");
    if (!ext) alert('no! OES_element_index_uint')
    console.log(ext)
    ext = gl.getExtension('ANGLE_instanced_arrays');
    if (!ext) alert('no! ANGLE_instanced_arrays')
    gl.viewport(0, 0, 1280, 800)
}
var p;
function initShaders() {
    p = gl.createProgram();
    var v = document.getElementById("vs").textContent;
    var f = document.getElementById("fs").textContent;
    var vs = gl.createShader(gl.VERTEX_SHADER);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs, v);
    gl.shaderSource(fs, f);
    gl.compileShader(vs);
    gl.compileShader(fs);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.useProgram(p);
    p.aVertexPosition = gl.getAttribLocation(p, "aVertexPosition");

    p.instancePosition = gl.getAttribLocation(p, "instancePosition");
    p.instanceRotation = gl.getAttribLocation(p, "instanceRotation");

    p.color = gl.getAttribLocation(p, "color");

    p.pixelMatrix = gl.getUniformLocation(p, 'pixelMatrix');
    p.uScale = gl.getUniformLocation(p, 'uScale');

    gl.enableVertexAttribArray(p.aVertexPosition);


    gl.enableVertexAttribArray(p.instancePosition);
    gl.enableVertexAttribArray(p.instanceRotation);
    gl.enableVertexAttribArray(p.color);


}
var instancePositions = [];
var instanceRotations = [];
var instanceColors = [];
var offsetPosition = 3;
var offsetRotation = 3;
var offsetColor = 4

var positionBuffer
var rotationBuffer
function initBuffers() {

    var data = [
        -0.5, -0.5, 0.0,
        -0.5, 0.5, 0.0,
        0.5, -0.5, 0.0,
        0.5, 0.5, 0.0
    ];

    indices = [
        0, 1, 2,
        1, 2, 3
    ];


    var pos = 0;

    for (var i = 0; i < max; i++) {

        instancePositions[pos * offsetPosition] = Math.random() * 50000 - 25000;
        instancePositions[pos * offsetPosition + 1] = Math.random() * 50000 - 20500
        instancePositions[pos * offsetPosition + 2] = Math.random() * 50000

        instanceRotations[pos * offsetRotation] = Math.random()
        instanceRotations[pos * offsetRotation + 1] = Math.random()
        instanceRotations[pos * offsetRotation + 2] = Math.random()

        instanceColors[pos * offsetColor] = Math.random()
        instanceColors[pos * offsetColor + 1] = Math.random()
        instanceColors[pos * offsetColor + 2] = Math.random()
        instanceColors[pos * offsetColor + 3] = 0.3;

        pos++;
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instancePositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.instancePosition, 3, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.instancePosition, 1)

    rotationBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, rotationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceRotations), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.instanceRotation, 3, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.instanceRotation, 1)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.color, 4, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.color, 1)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
}
//
function animate() {
    render();
    requestAnimationFrame(animate);
}

var pos = 0;
var time = 0
function render() {
    //gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS)
    //gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)


    time += 0.005

    var a

    for (var i = 0; i < max; i++) {
        a = i * offsetPosition
        instancePositions[a] = time
        instancePositions[a + 1] = i * time * 0.1

        instanceRotations[a+2] +=0.02
    }

    var mtx
    var fieldOfViewY = 45 * Math.PI / 180
    var aspectRatio = 1280 / 800
    var zNear = 1
    var zFar = 10000000
    var yScale = 1.0 / Math.tan(fieldOfViewY / 2.0);
    var xScale = yScale / aspectRatio;
    mtx = [
        xScale, 0, 0, 0,
        0, -yScale, 0, 0,
        0, 0, zFar / (zFar - zNear), 1,
        0, 0, (zNear * zFar) / (zNear - zFar), 1
    ]

    gl.uniform3fv(p.uScale, [64, 64, 1])
    gl.uniformMatrix4fv(p.pixelMatrix, false, mtx)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instancePositions), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(p.instancePosition, 3, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.instancePosition, 1)

    gl.bindBuffer(gl.ARRAY_BUFFER, rotationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceRotations), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(p.instanceRotation, 3, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.instanceRotation, 1)

    ext.drawElementsInstancedANGLE(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0, max);
    //gl.flush();
}

initWebGL();
initShaders();
initBuffers();
animate();
