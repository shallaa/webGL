/**
 * Created by seonki on 2015-02-21.
 */
bsGL.renderHead = '' +
'var gl = this.ctx \n' +
'       if (this.enable) { \n' +
'               var i = this.children.length, target, max = this.children.length - 1 \n' +
'               gl.clearColor(0, 0, 0, 1) \n' +
'               gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) \n' +
'               while (i--) { \n' +
'                   target = this.children[max - i] \n' +
'                   var tMaterial = target.material \n' +
'                   var tProgram = this.PROGRAMS[tMaterial.programName] \n' +
'                   var tVBO = this.VBOS[target.geometryName] \n' +
'                   if (tProgram) { \n' +
'                       gl.useProgram(tProgram) \n' +
'                       gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS) \n' +
'                       gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) \n' +
'                       gl.uniformMatrix4fv(tProgram.uPixelMatrix, false, this.pixelMatrix) \n' +
'                       gl.bindBuffer(gl.ARRAY_BUFFER, tVBO); \n' +
'                       gl.vertexAttribPointer(tProgram.aVertexPosition, tVBO.size, gl.FLOAT, false, 0, 0); \n' +
'                       gl.uniform3fv(tProgram.uScale, target.scale) \n' +
'                       gl.uniform3fv(tProgram.uRotation, target.rotation) \n' +
'                       gl.uniform3fv(tProgram.uPosition, target.position) \n' +
'                       target.rotation[0] += 0.01 \n' +
'                       target.rotation[1] += 0.01 \n' +
'                       target.rotation[2] += 0.01 \n'
bsGL.renderTail = '' +
'                   } \n' +
'               } \n' +
'           } \n'
bsGL.shaderSource = {
    color: {
        attribute: [
            ['vec3', 'aVertexPosition']
        ],
        vUniform: [
            ['mat4', 'uPixelMatrix'],
            ['vec3', 'uScale'],
            ['vec3', 'uRotation'],
            ['vec3', 'uPosition'],
            ['vec4', 'uColor']
        ],
        varying: [
            // ['타입', '베어링변수명', '연관 유니폼명']
            ['vec4', 'vColor']
        ],
        fUniform: [],
        shader: {
            vStr: 'mat4 scaleMTX(vec3 t)' +
            '{' +
            '   return mat4( t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);\n' +
            '}' +
            'mat4 rotationMTX(vec3 t)' +
            '{' +
            '   float s = sin(t[0]);float c = cos(t[0]);\n' +
            '   mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);\n' +
            '   mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);\n' +
            '   mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);\n' +
            '   return m3*m2*m1;\n' +
            '}' +
            'mat4 positionMTX(vec3 t)' +
            '{' +
            '   return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);\n' +
            '}',
            fStr: '',
            vMain: ' ' +
            ' vColor = uColor;\n' +
            ' mat4 position =uPixelMatrix*positionMTX(uPosition)*rotationMTX(uRotation)*scaleMTX(uScale);\n' +
            ' gl_Position = position*vec4(aVertexPosition, 1.0);\n',
            fMain: ' gl_FragColor = vec4(vColor[0],vColor[1],vColor[2], vColor[3]);\n'
        },
        render: '' +
        ' gl.uniform4fv(tProgram.uColor, tMaterial.color) \n' +
        '     var tIBO = this.IBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO) \n' +
        '     gl.drawElements(gl.TRIANGLES, tIBO.num, gl.UNSIGNED_SHORT, 0); \n',
        materialInit: function ($target) {
            $target.programName = 'color'
            $target.color = [Math.random(), Math.random(), Math.random(), 1.0]
        }
    },
    bitmap: {
        attribute: [
            ['vec3', 'aVertexPosition'],
            ['vec2', 'aVertexUV']
        ],
        vUniform: [
            ['mat4', 'uPixelMatrix'],
            ['vec3', 'uScale'],
            ['vec3', 'uRotation'],
            ['vec3', 'uPosition']
        ],
        fUniform: [
            ['sampler2D', 'uSampler'],
        ],
        varying: [
            // ['타입', '베어링변수명', '연관 유니폼명']
            ['vec2', 'vUV']
        ],
        shader: {
            vStr: 'mat4 scaleMTX(vec3 t)' +
            '{' +
            '   return mat4( t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);\n' +
            '}' +
            'mat4 rotationMTX(vec3 t)' +
            '{' +
            '   float s = sin(t[0]);float c = cos(t[0]);\n' +
            '   mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);\n' +
            '   mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);\n' +
            '   mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);\n' +
            '   return m3*m2*m1;\n' +
            '}' +
            'mat4 positionMTX(vec3 t)' +
            '{' +
            '   return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);\n' +
            '}',
            fStr: '',
            vMain: ' ' +
            ' vUV = aVertexUV;\n' +
            ' mat4 position =uPixelMatrix*positionMTX(uPosition)*rotationMTX(uRotation)*scaleMTX(uScale);\n' +
            ' gl_Position = position*vec4(aVertexPosition, 1.0);\n',
            fMain: '' +
            ' gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t));\n'
        },
        render: '' +
        ' var tTexture = tMaterial.texture \n' +
        ' if (tTexture.loaded) { \n' +
        '     var tUVBO = this.UVBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) \n' +
        '     gl.vertexAttribPointer(tProgram.aVertexUV, tUVBO.size, gl.FLOAT, false, 0, 0) \n' +
        '     gl.activeTexture(gl.TEXTURE0); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture); \n' +
        '     gl.uniform1i(tProgram.uSampler, 0); \n' +
        '     var tIBO = this.IBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO) \n' +
        '     gl.drawElements(gl.TRIANGLES, tIBO.num, gl.UNSIGNED_SHORT, 0); \n' +
        ' } \n',
        materialInit: function ($target) {
            $target.programName = 'bitmap'
            $target.texture = null
        }
    }
    ,
    bitmapLight: {
        attribute: [
            ['vec3', 'aVertexPosition'],
            ['vec3', 'aVertexNormal'],
            ['vec2', 'aVertexUV']
        ],
        vUniform: [
            ['mat4', 'uPixelMatrix'],
            ['vec3', 'uScale'],
            ['vec3', 'uRotation'],
            ['vec3', 'uPosition']
        ],
        fUniform: [
            ['sampler2D', 'uSampler'],
        ],
        varying: [
            ['vec2', 'vUV'],
            ['float', 'vLambertDirection']
        ],
        shader: {
            vStr: 'mat4 scaleMTX(vec3 t)' +
            '{' +
            '   return mat4( t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);\n' +
            '}' +
            'mat4 rotationMTX(vec3 t)' +
            '{' +
            '   float s = sin(t[0]);float c = cos(t[0]);\n' +
            '   mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);\n' +
            '   mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);\n' +
            '   mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);\n' +
            '   return m3*m2*m1;\n' +
            '}' +
            'mat4 positionMTX(vec3 t)' +
            '{' +
            '   return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);\n' +
            '}',
            fStr: '',
            vMain: ' ' +
            ' vUV = aVertexUV;\n' +
            ' mat4 position =uPixelMatrix*positionMTX(uPosition)*rotationMTX(uRotation)*scaleMTX(uScale);\n' +
            ' vec3 LD = normalize(vec3(0,1,-1));\n' +
            ' vec3 N = normalize(vec3(position *  vec4(aVertexNormal, 0.0)));\n' +
            ' gl_Position = position*vec4(aVertexPosition, 1.0);\n' +
            ' vLambertDirection = clamp(dot(N,-LD),0.0,1.0);\n',
            fMain: '' +
            ' float test = vLambertDirection;\n' +
            ' vec4 src  = texture2D(uSampler, vec2(vUV.s, vUV.t));\n' +
            ' float alpha = src.a;\n' +
            ' vec4 ia = vec4(0.0, 0.0, 0.0, 0.0);\n' +
            ' vec4 id = vec4(0.0, 0.0, 0.0, 0.0);\n' +
            ' vec4 is = vec4(0.0, 0.0, 0.0, 0.0);\n' +
            ' ia =src*vec4(0,0,0,1)*vLambertDirection;\n' +
            ' id =src*vec4(1,1,1,1)*vLambertDirection;\n' +
            ' is =vec4(1,1,1,1)*vLambertDirection;\n' +
            ' src = ia+id+is;\n' +
            ' gl_FragColor =  src;\n'
        },
        render: '' +
        ' var tTexture = tMaterial.texture \n' +
        ' if (tTexture.loaded) { \n' +
        '     var tUVBO = this.UVBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) \n' +
        '     gl.vertexAttribPointer(tProgram.aVertexUV, tUVBO.size, gl.FLOAT, false, 0, 0) \n' +
        '     gl.bindBuffer(gl.ARRAY_BUFFER, this.NORMALS[target.geometryName]) \n' +
        '     gl.vertexAttribPointer(tProgram.aVertexNormal, this.NORMALS[target.geometryName].size, gl.FLOAT, false, 0, 0) \n' +
        '     gl.activeTexture(gl.TEXTURE0); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture); \n' +
        '     gl.uniform1i(tProgram.uSampler, 0); \n' +
        '     var tIBO = this.IBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO) \n' +
        '     gl.drawElements(gl.TRIANGLES, tIBO.num, gl.UNSIGNED_SHORT, 0); \n' +
        ' } \n',
        materialInit: function ($target) {
            $target.programName = 'bitmapLight'
            $target.texture = null
        }
    }
}
