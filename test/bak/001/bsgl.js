/**
 * Created by seonki on 2015-02-18.
 */
;
bsGL = (function () {
    var DOC = document, HEAD = DOC.getElementsByTagName('head')[0];
    var gl_list = []
    // 전체공유 API들
    var API = {
        init: function ($init, $shaderURL, $baseBufferURL) {
            var script = DOC.createElement('script')
            script.type = 'text/javascript', script.charset = 'utf-8', script.src = $shaderURL
            script.onload = function () {
                script.onload = null
                HEAD.removeChild(script)
                script = DOC.createElement('script')
                script.type = 'text/javascript', script.charset = 'utf-8', script.src = $baseBufferURL
                script.onload = function () {
                    $init() , console.log(API.shaderSource), HEAD.removeChild(script)
                }
                HEAD.appendChild(script)
            }
            HEAD.appendChild(script)
        },
        getContext3D: function ($canvas) {
            // bsGL.getContext3D 하면 webGL컨텍스트가 랩핑된 bsGL객체가 들어옴
            var result = new gl(typeof $canvas == 'string' ? document.getElementById($canvas) : $canvas)
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
    var gl = function ($cvs) {
        this.cvs = $cvs
        this.ctx = $cvs.getContext(API.DETECT.contextKEY)
        this.VBOS = {}, this.UVBOS = {}, this.IBOS = {}, this.PROGRAMS = {}
        this.enable = true
        this.mode = '2d'
        this.pixelMatrix = [
            2 / this.cvs.width, 0, 0, 0,
            0, 2 / this.cvs.height, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 1
        ]
        this.children = []
        this.setBases()
    }
    var S = function () {
        //S는 걍 프로토타입 공유
        var i = 0, j = arguments.length, k, v;
        while (i < j) {
            k = arguments[i++];
            if (i == j) {
                if (k == 'this') return this
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
    var prototype = gl.prototype;
    var fn = prototype.fn = function ($name, $func) { prototype[$name] = $func }
    var cls = prototype.cls = function ($name, $func) {
        var t0 = $name.toLowerCase()
        prototype[t0.charAt(0).toUpperCase() + t0.substr(1)] = $func
    }
    // 쭉 기초적으로 필요한거 선언
    fn('S', S),
        fn('makeBuffer', function ($name, $data, $size, $type) {
            /* $type : vbo, uvbo,ibo */
            var gl = this.ctx, buffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array($data), gl.STATIC_DRAW)
            buffer.size = $size, buffer.num = $data.length / $size, buffer.name = $name
            $type == 'vbo' ? this.VBOS[$name] = buffer : this.UVBOS[$name] = buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
        }),
        fn('makeProgram', (function () {
            var result = function ($name, $info) {
                var gl = this.ctx, vertexShader = gl.createShader(gl.VERTEX_SHADER), fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
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
                    fStr = "precision highp float;\n" + fStr + temp + "void main(void) {\n" + $info.shader.fMain + '\n}\n',
                    //console.log(vStr)
                    //console.log(fStr)
                    // 소스입력하고 컴파일
                    gl.shaderSource(vertexShader, vStr), gl.compileShader(vertexShader),
                    gl.shaderSource(fragmentShader, fStr), gl.compileShader(fragmentShader)
                var program = gl.createProgram()
                gl.attachShader(program, vertexShader), gl.attachShader(program, fragmentShader), gl.linkProgram(program),
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
            var t0 = API.baseBuffer, t1, i = t0.length;
            while (i--) t1 = t0[i], this.makeBuffer(t1.name, t1.data, t1.size, t1.type)
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
        fn('mode', function ($mode) { this.mode = $mode }),
        fn('setSize', function () {
            var w = arguments[0][0], h = arguments[0][1]
            this.cvs.width = w
            this.cvs.height = h
            this.cvs.style.width = w + 'px'
            this.cvs.style.height = h + 'px'
            this.pixelMatrix = [
                2 / this.cvs.width, 0, 0, 0,
                0, 2 / this.cvs.height, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 1
            ]
            this.ctx.viewport(0, 0, w, h)
        }),
        fn('>', function ($t) {
            this.children.push($t)
        }),
        // 초기렌더러는 걍 빈렌더러
        fn('render', function () {}),
        cls('Mesh', (function () {
            var UUID = 0
            var meshTable = {}
            function bsMesh($type) {
                this.___UUID = UUID++
                this.scale = [100, Math.random() * 200, 100]
                this.rotation = [0, 0, 0]
                this.position = [0, 0, 0]
                // 음 이건 지오메트리 정본데 걍 둘까..
                this.geometryName = $type ? $type : 'rect'
                this.material = {
                    programName: 'color',
                    color: [Math.random(), Math.random(), Math.random(), 1.0]
                }
                // 아래쪽은 재질로 가야겠군
            }

            bsMesh.prototype = {S: S}
            return function ($type) {
                var result = new bsMesh($type)
                meshTable[result.___UUID] = result
                return
            }
        })()),
        cls('Material', (function () {
            function bsMaterial() {}

            bsMaterial.prototype = {S: S}
            return function () {
                var result = new bsMaterial()
                result.programName = 'color'
                result.color = [Math.random(), Math.random(), Math.random(), 1.0]
                return result
            }
        })())
    function render() {
        var i = gl_list.length
        while (i--) gl_list[i].render()
    }

    setInterval(render, 16)
    return API
})()