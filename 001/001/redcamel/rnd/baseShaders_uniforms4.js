/**
 * Created by seonki on 2015-02-21.
 */
'use strict'

var imsi = []
var imsi2 = []
bsGL.renderHead = '' +
'var time=0;\n' +
'var gl = this.ctx \n' +
'       if (this.enable) { \n' +
'var maxUniform  = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) \n' +
'if (imsi.length<maxUniform){ \n' +
'for (var i = 0; i < maxUniform; i++) { \n' +
'imsi.push([Math.random() * 5000 - 2500, Math.random() * 5000 - 2500, Math.random() * 5000 - 2500]) \n' +
'imsi2.push([Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]) \n' +
'} \n' +
'} \n' +

'               var i = this.children.length, target, max = this.children.length - 1 \n' +
'               gl.clearColor(0.0, 0.0, 0.0, 1.0) \n' +
'               gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LESS) \n' +
'               gl.enable(gl.CULL_FACE);\n' +
'               gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) \n' +

//'gl.enable(gl.POLYGON_OFFSET_FILL);\n'+
//'gl.polygonOffset(10.0, 1.0);\n'+
'time+=0.1\n' +

//'               gl.enable(gl.BLEND), gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) \n' +
'               while (i--) { \n' +

'                   target = this.children[max - i] \n' +
'                   var tMaterial = target.material \n' +
'                   var tProgram = this.PROGRAMS[tMaterial.programName] \n' +
'                   var tVBO = this.VBOS[target.geometryName] \n' +
'                   if (tProgram) { \n' +
'                       gl.useProgram(tProgram) \n' +
'                       gl.uniformMatrix4fv(tProgram.uPixelMatrix, false, this.pixelMatrix) \n' +
'                       gl.bindBuffer(gl.ARRAY_BUFFER, tVBO); \n' +
'                       gl.vertexAttribPointer(tProgram.aVertexPosition, 4, gl.FLOAT, false, 5*Float32Array.BYTES_PER_ELEMENT, 0*Float32Array.BYTES_PER_ELEMENT); \n' +
'                       gl.vertexAttribPointer(tProgram.aUniformID, 1, gl.FLOAT, false,5*Float32Array.BYTES_PER_ELEMENT, 4*Float32Array.BYTES_PER_ELEMENT); \n' +
'                       gl.uniform3fv(tProgram.uScale, target.scale) \n' +
'                       var t,t2;\n' +
'                       var j=maxUniform\n' +
'                       while(j--){\n' +
'                           t = imsi[j]\n' +
'                           t2 = imsi2[j]\n' +
'                           gl.uniform3fv(tProgram["uPositions["+j+"]"], t) \n' +
'                           t2[0] += 0.01 \n' +
'                           t2[1] += 0.01 \n' +
'                           t2[2] += 0.01 \n' +
'                           gl.uniform3fv(tProgram["uRotations["+j+"]"], t2) \n' +
'                       }\n' +
'                       gl.uniform3fv(tProgram.uPosition, target.position) \n' +
'                       gl.uniform3fv(tProgram.uRotation, target.rotation) \n' +
'target.rotation[0]+=0.001\n' +
'target.rotation[1]+=0.001\n' +
'target.rotation[2]+=0.001\n'

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
        '     gl.uniform4fv(tProgram.uColor, tMaterial.color) \n' +
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
            ['vec4', 'aVertexPosition'],
            ['vec2', 'aVertexUV'],
            ['float', 'aUniformID']
        ],
        vUniform: [
            ['mat4', 'uPixelMatrix'],
            ['vec3', 'uScale'],
            ['vec3', 'uRotations[500]'],
            ['vec3', 'uPositions[500]'],
            ['vec3', 'uRotation'],
            ['vec3', 'uPosition']
        ],
        fUniform: [
            ['sampler2D', 'uSampler0'],
            ['sampler2D', 'uSampler1'],
            ['sampler2D', 'uSampler2'],
            ['sampler2D', 'uSampler3'],
            ['sampler2D', 'uSampler4'],
            ['sampler2D', 'uSampler5'],
            ['sampler2D', 'uSampler6']
        ],
        varying: [
            // ['타입', '베어링변수명', '연관 유니폼명']
            ['vec2', 'vUV'],
            ['float', 'vTextureIDX']
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
            ' mat4 position ;\n' +
            ' vTextureIDX = aVertexPosition[3];\n' +
            ' int test = int(aUniformID);\n' +
            ' position =uPixelMatrix*positionMTX(uPosition)*rotationMTX(uRotation)*positionMTX(uPositions[test])*rotationMTX(uRotations[test])*scaleMTX(uScale);\n' +
            ' gl_Position = position*vec4(aVertexPosition.xyz, 1.0);\n',
            fMain: '' +
            ' vec4 result;\n' +
            ' if(vTextureIDX >= 0.06){\n' +
            '   result =  texture2D(uSampler6, vec2(vUV.s, vUV.t));\n' +
            ' } else if(vTextureIDX >= 0.05){\n' +
            '   result =  texture2D(uSampler5, vec2(vUV.s, vUV.t));\n' +
            ' } else if(vTextureIDX >= 0.04){\n' +
            '   result =  texture2D(uSampler4, vec2(vUV.s, vUV.t));\n' +
            ' } else if(vTextureIDX >= 0.03){\n' +
            '   result =  texture2D(uSampler3, vec2(vUV.s, vUV.t));\n' +
            ' } else if(vTextureIDX >= 0.02){\n' +
            '   result =  texture2D(uSampler2, vec2(vUV.s, vUV.t));\n' +
            ' } else if(vTextureIDX >= 0.01){\n' +
            '   result =  texture2D(uSampler1, vec2(vUV.s, vUV.t));\n' +
            ' } else {\n' +
            '   result =  texture2D(uSampler0, vec2(vUV.s, vUV.t));\n' +
            ' }' +
            '   gl_FragColor =  result;\n'

        },
        render: '' +
        ' var tTexture0 = tMaterial.texture \n' +
        ' var tTexture1 = target.material2.texture \n' +
        ' var tTexture2 = target.material3.texture \n' +
        ' var tTexture3 = target.material4.texture \n' +
        ' var tTexture4 = target.material5.texture \n' +
        ' var tTexture5 = target.material6.texture \n' +
        ' var tTexture6 = target.material7.texture \n' +

        ' if (tTexture0.loaded && tTexture1.loaded && tTexture2.loaded && tTexture3.loaded && tTexture4.loaded && tTexture5.loaded && tTexture6.loaded ) { \n' +
        '     var tUVBO = this.UVBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) \n' +
        '     gl.vertexAttribPointer(tProgram.aVertexUV, tUVBO.size, gl.FLOAT, false, 0, 0) \n' +

        '     gl.activeTexture(gl.TEXTURE0); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture0); \n' +
        '     gl.uniform1i(tProgram.uSampler0, 0); \n' +

        '     gl.activeTexture(gl.TEXTURE1); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture1); \n' +
        '     gl.uniform1i(tProgram.uSampler1, 1); \n' +
            //
        '     gl.activeTexture(gl.TEXTURE2); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture2); \n' +
        '     gl.uniform1i(tProgram.uSampler2, 2); \n' +

        '     gl.activeTexture(gl.TEXTURE3); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture3); \n' +
        '     gl.uniform1i(tProgram.uSampler3, 3); \n' +

        '     gl.activeTexture(gl.TEXTURE4); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture4); \n' +
        '     gl.uniform1i(tProgram.uSampler4, 4); \n' +

        '     gl.activeTexture(gl.TEXTURE5); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture5); \n' +
        '     gl.uniform1i(tProgram.uSampler5, 5); \n' +

        '     gl.activeTexture(gl.TEXTURE6); \n' +
        '     gl.bindTexture(gl.TEXTURE_2D, tTexture6); \n' +
        '     gl.uniform1i(tProgram.uSampler6, 6); \n' +

        '     var tIBO = this.IBOS[target.geometryName] \n' +
        '     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO) \n' +
        '     gl.drawElements(gl.TRIANGLES, tIBO.num, gl.UNSIGNED_SHORT, 0); \n' +
        ' } \n',
        materialInit: function ($target) {
            $target.programName = 'bitmap'
            $target.texture = null
        }
    }
    //,
    //bitmapLight: {
    //    attribute: [
    //        ['vec3', 'aVertexPosition'],
    //        ['vec3', 'aVertexPosition2'],
    //        ['vec3', 'aVertexNormal'],
    //        ['vec2', 'aVertexUV']
    //    ],
    //    vUniform: [
    //        ['mat4', 'uPixelMatrix'],
    //        ['vec3', 'uScale'],
    //        ['vec3', 'uRotation'],
    //        ['vec3', 'uPosition']
    //    ],
    //    fUniform: [
    //        ['sampler2D', 'uSampler'],
    //    ],
    //    varying: [
    //        ['vec2', 'vUV'],
    //        ['float', 'vLambertDirection']
    //    ],
    //    shader: {
    //        vStr: 'mat4 scaleMTX(vec3 t)' +
    //        '{' +
    //        '   return mat4( t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);\n' +
    //        '}' +
    //        'mat4 rotationMTX(vec3 t)' +
    //        '{' +
    //        '   float s = sin(t[0]);float c = cos(t[0]);\n' +
    //        '   mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);\n' +
    //        '   mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);\n' +
    //        '   mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);\n' +
    //        '   return m3*m2*m1;\n' +
    //        '}' +
    //        'mat4 positionMTX(vec3 t)' +
    //        '{' +
    //        '   return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);\n' +
    //        '}',
    //        fStr: '',
    //        vMain: ' ' +
    //        ' vUV = aVertexUV;\n' +
    //        ' vec3 test = aVertexPosition2;\n' +
    //        ' mat4 position =uPixelMatrix*positionMTX(uPosition)*rotationMTX(uRotation)*scaleMTX(uScale);\n' +
    //        ' vec3 LD = normalize(vec3(0,1,-1));\n' +
    //        ' vec3 N = normalize(vec3(position *  vec4(aVertexNormal, 0.0)));\n' +
    //        ' gl_Position = position*vec4(aVertexPosition, 1.0);\n' +
    //        ' vLambertDirection = clamp(dot(N,-LD),0.0,1.0);\n',
    //        fMain: '' +
    //        ' float test = vLambertDirection;\n' +
    //        ' vec4 src  = texture2D(uSampler, vec2(vUV.s, vUV.t));\n' +
    //        ' float alpha = src.a;\n' +
    //        ' vec4 ia = vec4(0.0, 0.0, 0.0, 0.0);\n' +
    //        ' vec4 id = vec4(0.0, 0.0, 0.0, 0.0);\n' +
    //        ' vec4 is = vec4(0.0, 0.0, 0.0, 0.0);\n' +
    //        ' ia =src*vec4(0,0,0,1)*vLambertDirection;\n' +
    //        ' id =src*vec4(1,1,1,1)*vLambertDirection;\n' +
    //        ' is =vec4(1,1,1,1)*vLambertDirection;\n' +
    //        ' src = ia+id+is;\n' +
    //        ' gl_FragColor =  src;\n'
    //    },
    //    render: '' +
    //    ' var tTexture = tMaterial.texture \n' +
    //    ' if (tTexture.loaded) { \n' +
    //    '     var tUVBO = this.UVBOS[target.geometryName] \n' +
    //    '     gl.bindBuffer(gl.ARRAY_BUFFER, tUVBO) \n' +
    //    '     gl.vertexAttribPointer(tProgram.aVertexUV, tUVBO.size, gl.FLOAT, false, 0, 0) \n' +
    //    '     gl.bindBuffer(gl.ARRAY_BUFFER, this.NORMALS[target.geometryName]) \n' +
    //    '     gl.vertexAttribPointer(tProgram.aVertexNormal, this.NORMALS[target.geometryName].size, gl.FLOAT, false, 0, 0) \n' +
    //    '     gl.activeTexture(gl.TEXTURE0); \n' +
    //    '     gl.bindTexture(gl.TEXTURE_2D, tTexture); \n' +
    //    '     gl.uniform1i(tProgram.uSampler, 0); \n' +
    //    '     var tIBO = this.IBOS[target.geometryName] \n' +
    //    '     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIBO) \n' +
    //    '     gl.drawElements(gl.TRIANGLES, tIBO.num, gl.UNSIGNED_SHORT, 0); \n' +
    //    ' } \n',
    //    materialInit: function ($target) {
    //        $target.programName = 'bitmapLight'
    //        $target.texture = null
    //    }
    //}
}
