var c, gl;

var color = [];
var indices = [];
var max = 3
var ext;

function initWebGL() {
    c = document.getElementById("c");
    gl = c.getContext("experimental-webgl");
    ext = gl.getExtension("OES_element_index_uint");
    console.log(ext)
    ext = gl.getExtension('ANGLE_instanced_arrays');
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
    p.color = gl.getAttribLocation(p, "color");

    p.pixelMatrix = gl.getUniformLocation(p, 'pixelMatrix');
    p.uScale = gl.getUniformLocation(p, 'uScale');

    gl.enableVertexAttribArray(p.aVertexPosition);


    gl.enableVertexAttribArray(p.instancePosition);
    gl.enableVertexAttribArray(p.color);


}
var instancePositions = [];
var instanceColors = [];
var offsetPosition = 3;
var offsetColor = 4
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
        instancePositions[pos * offsetPosition] = 0;
        instancePositions[pos * offsetPosition + 1] = 0
        instancePositions[i * offsetPosition + 2] = 2500-500*i
        if(i==0){
            instanceColors[pos * offsetColor] = 1
            instanceColors[pos * offsetColor + 1] = 1
            instanceColors[pos * offsetColor + 2] = 0.5
            instanceColors[pos * offsetColor + 3] = 1.0;
        }else if(i==1){
            instanceColors[pos * offsetColor] = 1
            instanceColors[pos * offsetColor + 1] = 0.5
            instanceColors[pos * offsetColor + 2] = 1
            instanceColors[pos * offsetColor + 3] = 1.0;
        }else{
            instanceColors[pos * offsetColor] = 1
            instanceColors[pos * offsetColor + 1] = 1
            instanceColors[pos * offsetColor + 2] = 1
            instanceColors[pos * offsetColor + 3] = 1.0;
        }

        pos++;
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instancePositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.instancePosition, 3, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.instancePosition, 1)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.color, 4, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.color, 1)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
}

function animate() {
    render();
    requestAnimationFrame(animate);
}

var pos = 0;
var time = 0
function render() {
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, 800, 800)



    time += 0.005
    for (var i = 0; i < max; i++) {

        //instancePositions[i * offsetPosition] = time;
        //instancePositions[i * offsetPosition + 1] =
        //instancePositions[i * offsetPosition + 2] = 0
        instancePositions[i * offsetPosition] =  time;
        instancePositions[i * offsetPosition + 1] = i*time/10

    }

    var mtx
    var fieldOfViewY = 45 * Math.PI / 180
    var aspectRatio = 800/800
    var zNear = 1
    var zFar = 1000000
    var yScale = 1.0 / Math.tan(fieldOfViewY / 2.0);
    var xScale = yScale / aspectRatio;
    mtx= [
        xScale, 0, 0, 0,
        0, -yScale, 0, 0,
        0, 0, zFar / (zFar - zNear), 1,
        0, 0, (zNear * zFar) / (zNear - zFar), 1
    ]

    gl.uniform3fv(p.uScale, [128, 128, 1])
    gl.uniformMatrix4fv(p.pixelMatrix, false, mtx)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instancePositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(p.instancePosition, 3, gl.FLOAT, false, 0, 0);
    ext.vertexAttribDivisorANGLE(p.instancePosition, 1)


    ext.drawElementsInstancedANGLE(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0, max);

}

initWebGL();
initShaders();
initBuffers();
animate();
