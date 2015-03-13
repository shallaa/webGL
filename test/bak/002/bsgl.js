/**
 * Created by seonki on 2015-02-18.
 */
;
"use strict";
window.bsGL = (function () {
    var DOC = document, HEAD = DOC.getElementsByTagName('head')[0];
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
                if (i == 1) script.onload = function () {script.onload = null, HEAD.removeChild(script), $init() }
                else script.onload = function () {load(list[i])}
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
        this.VBOS = {}, this.UVBOS = {}, this.IBOS = {}, this.PROGRAMS = {}
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
    var fn = prototype.fn = function ($name, $func) { prototype[$name] = $func }
    var cls = prototype.cls = function ($name, $func) {
        var t0 = $name.toLowerCase()
        prototype[t0.charAt(0).toUpperCase() + t0.substr(1)] = $func
    }
    // 쭉 기초적으로 필요한거 선언
    fn('S', S),
        fn('makeBuffer', function ($name, $data, $size, $type) {
            /* $type : vertexData, uvData,indexData */
            var ctx = this.ctx, buffer = ctx.createBuffer()
            if ($type != 'indexData') {
                ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer)
                ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array($data), ctx.STATIC_DRAW)
                buffer.size = $size, buffer.num = $data.length / $size, buffer.name = $name
                $type == 'vertexData' ? this.VBOS[$name] = buffer : this.UVBOS[$name] = buffer
                ctx.bindBuffer(ctx.ARRAY_BUFFER, null)
            } else {
                ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, buffer)
                ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array($data), ctx.STATIC_DRAW)
                buffer.size = $size, buffer.num = $data.length / $size, buffer.name = $name
                this.IBOS[$name] = buffer
                ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null)
            }
        }),
        fn('makeProgram', (function () {
            var result = function ($name, $info) {
                var ctx = this.ctx, vertexShader = ctx.createShader(ctx.VERTEX_SHADER), fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER)
                var vStr = $info.shader.vStr, fStr = $info.shader.fStr, vStrVaying = '', temp = ''
                // 버텍스 쉐이더 변수 Str생성
                temp = makeStr(temp, $info.attribute, 'attribute '),
                    temp = makeStr(temp, $info.vUniform, 'uniform '),
                    temp = makeStr(temp, $info.varying, 'varying '),
                    // 버텍스 쉐이더 베어링 변수생성
                    vStrVaying = makeStr(vStrVaying, $info.varying),
                    // 버텍스 쉐이더 생성
                    vStr = temp + vStr + "void main(void) {\n" + vStrVaying + $info.shader.vMain + '\n}\n',
                    // 프레그먼트 쉐이더 베어링 적용
                    temp = '', temp = makeStr(temp, $info.fUniform, 'uniform '), temp = makeStr(temp, $info.varying, 'varying '),
                    // 프레그먼트 쉐이더 생성
                    fStr = "precision mediump float;\n" + fStr + temp + "void main(void) {\n" + $info.shader.fMain + '\n}\n',
                    //console.log(vStr)
                    //console.log(fStr)
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
                if ($type) for (i = 0; i < max; i++)  t0 = tArray[i], $temp += $type + t0[0] + ' ' + t0[1] + ';\n'
                else for (i = 0; i < max; i++)  t0 = tArray[i], $temp += t0[1] + ' = ' + t0[2] + ';\n'
                return $temp
            }

            // 로케이션 정보를 가져옴
            function getLocation($context3D, $program, $list, $isUniform) {
                var tArray = $list, max = tArray.length, t0, gl = $context3D.ctx, i
                if ($isUniform) for (i = 0; i < max; i++) t0 = tArray[i], $program[t0[1]] = gl.getUniformLocation($program, t0[1])
                else for (i = 0; i < max; i++) {
                    t0 = tArray[i], $program[t0[1]] = gl.getAttribLocation($program, t0[1])
                    gl.bindBuffer(gl.ARRAY_BUFFER, $context3D.VBOS['nullBuffer'])
                    gl.vertexAttribPointer($program[t0[1]], $context3D.VBOS['nullBuffer'].size, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray($program[t0[1]]);
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
                this.scale = [100, Math.random() * 200, 100]
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
            function bsMaterial() {}

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
                this.texture = texture
                texture.img = new Image()
                texture.img.src = $src
                texture.loaded = 0
                texture.img.onload = function () {
                    texture.loaded = 1
                    ctx.bindTexture(ctx.TEXTURE_2D, texture)
                    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture.img);
                    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, $magFilter ? $magFilter : ctx.LINEAR);
                    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, minFilter);
                    if (minFilter == ctx.LINEAR_MIPMAP_NEAREST) ctx.generateMipmap(ctx.TEXTURE_2D);
                    ctx.bindTexture(ctx.TEXTURE_2D, null)
                    console.log($src, '로딩완료', texture)
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
                var aspectRatio = 1
                var zNear = 0.1
                var zFar = 10000
                var yScale = 1.0 / Math.tan(fieldOfViewY / 2.0);
                var xScale = yScale / aspectRatio;
                this.pixelMatrix = [
                    xScale, 0, 0, 0,
                    0, yScale, 0, 0,
                    0, 0, zFar / (zFar - zNear), 1,
                    0, 0, (zNear * zFar) / (zNear - zFar), 1
                ]
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
        fn('getElementById', function () { return this.___idTable[arguments[0]] }),
        fn('>', function ($t) { this.children.push($t) }),
        fn('<', function ($t) {
            console.log('구현해야함')
        }),
        // 초기렌더러는 걍 빈렌더러
        fn('render', function () {}),
        setInterval(function () {
            var i = gl_list.length
            while (i--) gl_list[i].render()
        }, 16)
    return API
})()