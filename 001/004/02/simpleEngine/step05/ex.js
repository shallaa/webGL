/**
 * Created by redcamel on 2015-04-19.
 */
'use strict'
;
(function () {
    bsGL.setBase = function () {
        // 베이스 버퍼
        var data = [
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0,
            0.5, 0.5, 0.0
        ]
        var index = [0, 1, 2, 1, 2, 3]
        var uv = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]
        bsGL.makeBuffer('VBOS', 'rect', data, 3)
        bsGL.makeBuffer('IBOS', 'rect', index, 1)
        bsGL.makeBuffer('UVBOS', 'rect', uv, 2)
        bsGL.makeBuffer('VBOS', 'null', [-0.5, -0.5, 0.0], 3)
        // 사이즈
        var body = document.body, html = document.documentElement;
        bsGL.setSize(document.body.clientWidth, Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight))
        // 베이스 쉐이더
        bsGL.shaderParser()
    }
    bsGL.shaderParser = function () {
        console.log('쉐이더파서!')
        console.log(bsGL.SHADER_SOURCES)
        var gl = bsGL.gl, vShader, fShader, program
        for (var k in bsGL.SHADER_SOURCES) {
            var t = bsGL.SHADER_SOURCES[k]
            vShader = gl.createShader(gl.VERTEX_SHADER)
            gl.shaderSource(vShader, t.vertex), gl.compileShader(vShader)
            fShader = gl.createShader(gl.FRAGMENT_SHADER)
            gl.shaderSource(fShader, t.fragment), gl.compileShader(fShader)
            program = gl.createProgram()
            gl.attachShader(program, vShader), gl.attachShader(program, fShader)
            gl.linkProgram(program)
            vShader.name = k + '_vertex', fShader.name = k + '_fragment', program.name = k

            gl.useProgram(program)
            var i = 0, list = t.attribs.split(','), max = list.length, key
            for (i; i < max; i++) {
                key = list[i]
                program[key] = gl.getAttribLocation(program, key);
                console.log(key, program[key])
                gl.bindBuffer(gl.ARRAY_BUFFER, bsGL.VBOS['null'])

                gl.vertexAttribPointer(program[key], bsGL.VBOS['null'].itemSize, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(program[key]);

            }
            list = t.uniforms.split(','), max = list.length
            for (i = 0; i < max; i++) {
                key = list[i]
                program[key] = gl.getUniformLocation(program, key);
            }
            bsGL.PROGRAMS[k] = program

            console.log(vShader)
            console.log(fShader)
            console.log(program)
        }
    }

    bsGL.makeBuffer = function ($type, $name, $data, $itemSize, $drawType) {
        var gl = bsGL.gl
        // $type : IBOS, ....
        var buffer = bsGL[$type][$name], bufferType, arrayType
        if (buffer) return buffer
        buffer = gl.createBuffer()
        bufferType = $type == 'IBOS' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
        arrayType = $type == 'IBOS' ? Uint16Array : Float32Array
        gl.bindBuffer(bufferType, buffer)
        gl.bufferData(bufferType, new arrayType($data), $drawType ? $drawType : gl.STATIC_DRAW)
        buffer.name = $name, buffer.type = $type
        buffer.itemSize = $itemSize
        buffer.numItem = $data.length / $itemSize
        bsGL[$type][$name] = buffer
        console.log(bsGL[$type][$name])
    }

    bsGL.makeTexture = function ($src) {
        var gl = bsGL.gl
        var texture = bsGL.TEXTURES[$src]
        if (texture) return texture
        texture = gl.createTexture() // 텍스쳐 생성
        texture.img = new Image()
        texture.img.src = $src
        texture.loaded = 0
        texture.img.onload = function () {
            texture.loaded = 1
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D)
            gl.bindTexture(gl.TEXTURE_2D, null)
        }
        bsGL.TEXTURES[$src] = texture
        return texture
    }

    bsGL.Mesh = function () {
        var result = {
            vbo: bsGL.VBOS['rect'],
            ibo: bsGL.IBOS['rect'],
            uvbo: bsGL.UVBOS['rect'],
            position: new Float32Array([0, 0, 0]),
            rotation: new Float32Array([0, 0, 0]),
            scale: new Float32Array([100, 100, 1]),
            alpha: 1,
            material: new bsGL.Material('color'),
            children: []
        }
        return result
    }

    bsGL.Material = function ($type) {
        var result
        switch ($type) {
            case 'color' :
                result = new Float32Array([Math.random(), Math.random(), Math.random()])
                result.program = bsGL.PROGRAMS['color']
                break
            case 'bitmap' :
                result = bsGL.makeTexture(arguments[1])
                result.program = bsGL.PROGRAMS['bitmap']
                break
        }
        return result
    }

    var prevVBO, prevUVBO, prevIBO
    var render = 0
    bsGL.render = function () {
        var gl = bsGL.gl
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        var children = bsGL.children
        for (var k in bsGL.PROGRAMS) {
            var tProgram = bsGL.PROGRAMS[k]
            gl.useProgram(tProgram)
            gl.uniformMatrix4fv(tProgram.uPixelMatrix, false, bsGL.uPixelMatrix)
        }
        prevVBO = prevUVBO = prevIBO = render = 0
        draw(children)
    }
    function draw($list) {
        var gl = bsGL.gl
        var i = $list.length
        var tObject, tProgram, tVBO, tIBO, tUVBO;

        while (i--) {
            render = 0
            tObject = $list[i]
            tProgram = tObject.material.program
            tVBO = tObject.vbo
            tIBO = tObject.ibo
            tUVBO = tObject.uvbo
            gl.useProgram(tProgram)

            if (prevVBO != tVBO) {
                gl.bindBuffer(gl.ARRAY_BUFFER, tVBO);
                gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.itemSize, gl.FLOAT, false, 0, 0);
            }

            gl.uniform3fv(tProgram.uRotation, tObject.rotation)
            gl.uniform3fv(tProgram.uPosition, tObject.position)
            gl.uniform3fv(tProgram.uScale, tObject.scale)

            switch (tProgram.name) {
                case 'bitmap' :
                    if (tObject.material.loaded) {
                        if (prevUVBO != tUVBO) {
                            gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO);
                            gl.vertexAttribPointer(tProgram.aUV, tUVBO.itemSize, gl.FLOAT, false, 0, 0);

                        }
                        gl.bindTexture(gl.TEXTURE_2D, tObject.material);
                        gl.uniform1i(tProgram.uSampler, 0)
                        render = 1
                    }
                    break
                case 'color' :
                    gl.uniform3fv(tProgram.uColor, tObject.material)
                    render = 1
                    break
            }

            if (render) {
                if (prevIBO != tIBO) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO)
                gl.drawElements(gl.TRIANGLES, tIBO.numItem, gl.UNSIGNED_SHORT, 0);
            }
            tObject.children.length > 0 ? draw(tObject.children) : 0

        }

    }
})();
