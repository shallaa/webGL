/**
 * Created by seonki on 2015-02-18.
 */
;
"use strict";
window.bsGL = (function () {
    var W = window, DOC = document, HEAD = DOC.getElementsByTagName('head')[0];
    W.requestAnimFrame = (function () {
        return W.requestAnimationFrame || W.webkitRequestAnimationFrame || W.mozRequestAnimationFrame || function (loop) {
                W.setTimeout(loop, 17)
            }
    })()
    var gl_list = []
    var ___ERROR = {
        1: '이미 등록된 ID가 존재함'
    }
    // 전체공유 API들
    var API = {
        init: function ($init) {
            var script, list = arguments, i = list.length - 1
            load(list[i])
            function load($src) {
                script ? (script.onload = null, HEAD.removeChild(script)) : 0
                script = DOC.createElement('script')
                script.type = 'text/javascript', script.charset = 'utf-8', script.src = $src
                if (i == 1) script.onload = function () {
                    script.onload = null, HEAD.removeChild(script), $init()
                }
                else script.onload = function () {
                    load(list[i])
                }
                HEAD.appendChild(script)
                i--
            }
        },
        getContext3D: function ($canvas) {
            // bsGL.getContext3D 하면 webGL컨텍스트가 랩핑된 bsGL객체가 들어옴
            var result = new bsContext3D(typeof $canvas == 'string' ? document.getElementById($canvas) : $canvas)
            gl_list.push(result)
            return result
        },
        DETECT: (function () {
            var cvs = document.createElement('canvas'), keys = 'webgl,experimental-webgl,webkit-3d,moz-webgl'.split(','), i = keys.length, result
            while (i--) if (result = cvs.getContext(keys[i])) break
            result ? console.log(keys[i], 'WebGL Enable') : console.log(keys[i], 'WebGL Disable')
            // 디텍팅 결과값을 여기다 저장
            return {contextKEY: keys[i]}
        })(),
        shaderSource: null, baseBuffer: null, renderHead: null, renderTail: null
    }
    ////////////////////////////////////////////////////////
    /* bsGL.getContext3D를 통해서 얻어지는 실제 컨텍스트3D*/
    ////////////////////////////////////////////////////////
    var bsContext3D = function ($cvs) {
        this.cvs = $cvs
        this.ctx = $cvs.getContext(API.DETECT.contextKEY)
        this.VBOS = {}, this.UVBOS = {}, this.IBOS = {}, this.NORMALS = {}, this.PROGRAMS = {}

        this.rotationBuffer = this.ctx.createBuffer()
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.rotationBuffer )


        this.enable = true
        this.setBases()
        this.mode('3d'), this.setSize([600, 600])
        this.children = []
        this.___idTable = {}
        this.___textureTable = {}


    }
    var S = function () {
        //S는 걍 프로토타입 공유
        var i = 0, j = arguments.length, k, v;
        while (i < j) {
            k = arguments[i++];
            if (i == j) {
                if (k == 'this') return this
                else if (k.charAt(0) == '#') return this.getElementById(k)
                else return typeof this[k] == 'function' ? this[k]() : this[k]
            } else {
                v = arguments[i++]
                if (v === null) delete this[k];
                else typeof this[k] == 'function' ? this[k](v) : this[k] = v
            }
        }
        return v
    }
    // 프로토타입과 클래스 메이커
    var prototype = bsContext3D.prototype;
    var fn = prototype.fn = function ($name, $func) {
        prototype[$name] = $func
    }
    var cls = prototype.cls = function ($name, $func) {
        var t0 = $name.toLowerCase()
        prototype[t0.charAt(0).toUpperCase() + t0.substr(1)] = $func
    }
    // 쭉 기초적으로 필요한거 선언
    fn('S', S),
        fn('makeBuffer', function ($name, $data, $size, $type, $bufferType) {
            /* $type : vertexData, uvData,indexData */
            var ctx = this.ctx, buffer = ctx.createBuffer()
            if ($type != 'indexData') {
                ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
                if ($type == 'vertexData') {
                    var temp = []
                    for (var i = 0; i < $data.length / $size; i++) {
                            for (var j = 0; j < $size; j++) {
                                temp.push($data[i * $size + j])
                            }
                    }
                    var data = new Float32Array(temp)
                    ctx.bufferData(ctx.ARRAY_BUFFER, data, $bufferType ? $bufferType : ctx.STATIC_DRAW)
                    //console.log(temp)
                    buffer.data =data
                } else ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array($data), ctx.STATIC_DRAW)
                buffer.size = $size, buffer.num = $data.length / $size, buffer.name = $name
                $type == 'vertexData' ? this.VBOS[$name] = buffer : $type == 'normalData' ? this.NORMALS[$name] = buffer : this.UVBOS[$name] = buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, null)
            } else {
                ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, buffer)
                ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array($data), ctx.STATIC_DRAW)
                buffer.size = $size, buffer.num = $data.length / $size, buffer.name = $name
                this.IBOS[$name] = buffer
                ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null)
            }
            //console.log(buffer)
        }),
        fn('calculateNormals', function (v, i) {
            var x = 0, y = 1, z = 2, j, k, len, mSqt = Math.sqrt, ns = [], v1 = [], v2 = [], n0 = [], n1 = [];
            for (j = 0, len = v.length; j < len; j++) ns[j] = 0.0;
            for (j = 0, len = i.length; j < len; j = j + 3) {
                v1 = [], v2 = [], n0 = [], v1[x] = v[3 * i[j + 1] + x] - v[3 * i[j] + x], v1[y] = v[3 * i[j + 1] + y] - v[3 * i[j] + y], v1[z] = v[3 * i[j + 1] + z] - v[3 * i[j] + z], v2[x] = v[3 * i[j + 2] + x] - v[3 * i[j + 1] + x], v2[y] = v[3 * i[j + 2] + y] - v[3 * i[j + 1] + y], v2[z] = v[3 * i[j + 2] + z] - v[3 * i[j + 1] + z], n0[x] = v1[y] * v2[z] - v1[z] * v2[y], n0[y] = v1[z] * v2[x] - v1[x] * v2[z], n0[z] = v1[x] * v2[y] - v1[y] * v2[x];
                for (k = 0; k < 3; k++) ns[3 * i[j + k] + x] = ns[3 * i[j + k] + x] + n0[x], ns[3 * i[j + k] + y] = ns[3 * i[j + k] + y] + n0[y], ns[3 * i[j + k] + z] = ns[3 * i[j + k] + z] + n0[z]
            }
            for (var i = 0, len = v.length; i < len; i = i + 3) {
                n1 = [], n1[x] = ns[i + x], n1[y] = ns[i + y], n1[z] = ns[i + z];
                var len = mSqt((n1[x] * n1[x]) + (n1[y] * n1[y]) + (n1[z] * n1[z]));
                if (len == 0) len = 0.00001;
                n1[x] = n1[x] / len, n1[y] = n1[y] / len, n1[z] = n1[z] / len, ns[i + x] = n1[x], ns[i + y] = n1[y], ns[i + z] = n1[z];
            }
            return ns;
        }),
        fn('makeProgram', (function () {
            var result = function ($name, $info) {
                var ctx = this.ctx, vertexShader = ctx.createShader(ctx.VERTEX_SHADER), fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER)
                var vStr = $info.shader.vStr, fStr = $info.shader.fStr, vStrVaying = '', temp = ''
                // 버텍스 쉐이더 변수 Str생성
                temp = makeStr(temp, $info.attribute, 'attribute '),
                    temp = makeStr(temp, $info.vUniform, 'uniform '),
                    temp = makeStr(temp, $info.varying, 'varying '),
                    // 버텍스 쉐이더 생성
                    vStr = temp + vStr + "void main(void) {\n" + $info.shader.vMain + '\n}\n',
                    // 프레그먼트 쉐이더 베어링 적용
                    temp = '', temp = makeStr(temp, $info.fUniform, 'uniform '), temp = makeStr(temp, $info.varying, 'varying '),
                    // 프레그먼트 쉐이더 생성
                    fStr = "precision mediump float;\n" + fStr + temp + "void main(void) {\n" + $info.shader.fMain + '\n}\n',
                    console.log(vStr)
                console.log(fStr)
                // 소스입력하고 컴파일
                ctx.shaderSource(vertexShader, vStr), ctx.compileShader(vertexShader),
                    ctx.shaderSource(fragmentShader, fStr), ctx.compileShader(fragmentShader)
                var program = ctx.createProgram()
                ctx.attachShader(program, vertexShader), ctx.attachShader(program, fragmentShader), ctx.linkProgram(program),
                    getLocation(this, program, $info.attribute, 0),
                    getLocation(this, program, $info.vUniform, 1),
                    getLocation(this, program, $info.fUniform, 1),
                    this.PROGRAMS[$name] = program
            }
            // 프로그램 구성정보문자열을 기반으로 생성, 타입이 없으면 버텍스쉐이더에서 베어링과 유니폼 연동으로 설정
            function makeStr($temp, $list, $type) {
                var tArray = $list, max = tArray.length, t0, i
                for (i = 0; i < max; i++)  t0 = tArray[i], $temp += $type + t0[0] + ' ' + t0[1] + ';\n'
                return $temp
            }

            // 로케이션 정보를 가져옴
            function getLocation($context3D, $program, $list, $isUniform) {
                var tArray = $list, max = tArray.length, t0, t1, gl = $context3D.ctx, i
                if ($isUniform) {
                    for (i = 0; i < max; i++) {
                        t0 = tArray[i], t1 = t0[1]
                        if (t1.indexOf('[') > -1) {
                            for (var j = 0; j < $context3D.ctx.getParameter($context3D.ctx.MAX_VERTEX_UNIFORM_VECTORS); j++) {
                                $program[t1.split('[')[0]+"[" + j + "]"] =gl.getUniformLocation($program, t1.split('[')[0]+"[" + j + "]")
                                $program[t1.split('[')[0]] =gl.getUniformLocation($program, t1.split('[')[0])
                            }
                        } else {
                            $program[t1] = gl.getUniformLocation($program, t1)
                        }
                    }


                }
                else for (i = 0; i < max; i++) {
                    t0 = tArray[i], t1 = t0[1], $program[t1] = gl.getAttribLocation($program, t1)
                    $context3D.VBOS['nullBuffer'] ? (gl.bindBuffer(gl.ARRAY_BUFFER, $context3D.VBOS['nullBuffer']), gl.enableVertexAttribArray($program[t1]), gl.vertexAttribPointer($program[t1], $context3D.VBOS['nullBuffer'].size, gl.FLOAT, false, 0, 0) ) : 0
                    $context3D.UVBOS['nullBuffer'] ? (gl.bindBuffer(gl.ARRAY_BUFFER, $context3D.UVBOS['nullBuffer']) , gl.enableVertexAttribArray($program[t1]), gl.vertexAttribPointer($program[t1], $context3D.UVBOS['nullBuffer'].size, gl.FLOAT, false, 0, 0) ) : 0
                    $context3D.NORMALS['nullBuffer'] ? (gl.bindBuffer(gl.ARRAY_BUFFER, $context3D.NORMALS['nullBuffer']), gl.enableVertexAttribArray($program[t1]), gl.vertexAttribPointer($program[t1], $context3D.NORMALS['nullBuffer'].size, gl.FLOAT, false, 0, 0) ) : 0
                }
            }

            return result
        })()),
        fn('setBases', function () {
            console.log('쉐이더를 초기화해야징')
            var t0 = API.baseBuffer, t1, t2, i = t0.length;
            while (i--) {
                t1 = t0[i]
                t1.vertexData ? this.makeBuffer(t1.name, t1.vertexData.data, t1.vertexData.size, 'vertexData') : 0
                t1.indexData ? this.makeBuffer(t1.name, t1.indexData.data, t1.indexData.size, 'indexData') : 0
                t1.uvData ? this.makeBuffer(t1.name, t1.uvData.data, t1.uvData.size, 'uvData') : 0
                var t2 = {
                    data: this.calculateNormals(t1.vertexData.data, t1.indexData.data),
                    size: 3
                }
                this.makeBuffer(t1.name, t2.data, t2.size, 'normalData')
                //console.log(t1.name, this.calculateNormals(t1.vertexData.data, t1.indexData.data))
            }
            for (var k in API.shaderSource)  this.makeProgram(k, API.shaderSource[k])
            this.resetRenderFunction()
        }),
        fn('resetRenderFunction', function () {
            var renderStrs = ''
            for (var k in API.shaderSource) {
                renderStrs += 'case "' + k + '" : \n' +
                ' ' + API.shaderSource[k].render + '\n' +
                'break\n'
            }
            renderStrs = 'switch (tMaterial.programName) {\n' +
            renderStrs + '\n' +
            '}'
            fn('render', new Function('', API.renderHead + renderStrs + API.renderTail))
        }),
        // 주요 클래스 선언
        cls('Mesh', (function () {
            var UUID = 0

            function bsMesh($type, $context3D) {
                this.___UUID = UUID++
                this.___bsContext3D = $context3D
                this.scale = [100, 100, 100]
                this.rotation = [0, 0, 0]
                this.position = [0, 0, 0]
                this.geometryName = $type ? $type : 'rect'
                // 아래쪽은 재질로 가야겠군
                this.material = this.___bsContext3D.Material()
            }

            bsMesh.prototype = {
                S: S,
                id: (function () {
                    return function () {
                        var t = '#' + arguments[0]
                        if (this.___bsContext3D.___idTable[t]) throw new Error(t + '로 ' + ___ERROR[1])
                        this.___bsContext3D.___idTable[this.id = t] = this
                    }
                })()
            }
            return function ($type) {
                var result = ($type != null && $type.charAt(0) == '#') ? this.getElementById($type) : new bsMesh($type, this)
                return result
            }
        })()),
        cls('Material', (function () {
            function bsMaterial() {
            }

            bsMaterial.prototype = {S: S}
            return function ($type) {
                var result = new bsMaterial()
                API.shaderSource[$type ? $type : 'color'].materialInit(result)
                return result
            }
        })()),
        cls('Texture', (function () {
            return function ($src, $magFilter, $minFilter) {
                console.log(this)
                if (this.___textureTable[$src]) return this.___textureTable[$src]
                var ctx = this.ctx
                var texture = ctx.createTexture()
                var minFilter = $minFilter ? $minFilter : ctx.LINEAR_MIPMAP_NEAREST

                texture.img = new Image()
                texture.img.src = $src
                texture.loaded = 0
                texture.img.onload = function () {
                    texture.loaded = 1
                    ctx.bindTexture(ctx.TEXTURE_2D, texture)
                    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
                    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, $magFilter ? $magFilter : ctx.LINEAR);
                    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, minFilter);
                    //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE)
                    //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
                    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture.img);
                    if (minFilter == ctx.LINEAR_MIPMAP_NEAREST) ctx.generateMipmap(ctx.TEXTURE_2D);

                    ctx.bindTexture(ctx.TEXTURE_2D, null)

                }
                this.___textureTable[$src] = texture

                return texture
            }
        })()),
        // 편의용 함수 선언
        fn('mode', function ($mode) {
            this._mode = $mode
            if ($mode.toLowerCase() == '2d') this.pixelMatrix = [
                2 / arguments[1], 0, 0, 0,
                0, 2 / arguments[2], 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 1
            ]
            else {

                var fieldOfViewY = 45 * Math.PI / 180
                var aspectRatio = arguments[1] / arguments[2]
                var zNear = 1
                var zFar = 1000000
                var yScale = 1.0 / Math.tan(fieldOfViewY / 2.0);
                var xScale = yScale / aspectRatio;
                this.pixelMatrix = [
                    xScale, 0, 0, 0,
                    0, -yScale, 0, 0,
                    0, 0, zFar / (zFar - zNear), 1,
                    0, 0, (zNear * zFar) / (zNear - zFar), 1
                ]
                //out, fovy, aspect, near, far
                //var test = mat4.create()
                //mat4.identity(test)
                //mat4.perspective(test,45,aspectRatio,zNear,zFar)
                //this.pixelMatrix =test
                //console.log(this.pixelMatrix )
            }
        }),
        fn('setSize', function () {
            var w = arguments[0][0], h = arguments[0][1]
            this.cvs.width = w
            this.cvs.height = h
            this.cvs.style.width = w + 'px'
            this.cvs.style.height = h + 'px'
            this.mode(this._mode, w, h)
            this.ctx.viewport(0, 0, w, h)

        }),
        fn('getElementById', function () {
            return this.___idTable[arguments[0]]
        }),
        fn('>', function ($t) {
            this.children.push($t)
        }),
        fn('<', function ($t) {
            console.log('구현해야함')
        }),
        // 초기렌더러는 걍 빈렌더러
        fn('render', function () {
        }),
        //setInterval(function () {
        //    var i = gl_list.length
        //    while (i--) gl_list[i].render()
        //}, 16)
        (function animloop() {
            var i = gl_list.length
            while (i--) gl_list[i].render()
            requestAnimFrame(animloop)
        })();
    return API
})()