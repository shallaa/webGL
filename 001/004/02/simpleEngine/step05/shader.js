/**
 * Created by redcamel on 2015-04-19.
 */
'use strict'
;
(function () {
    bsGL.SHADER_SOURCES['color'] = {
        vertex: "\n" +
        "attribute vec3 aVertexPosition;\n" +
        "uniform mat4 uPixelMatrix;\n" +
        "uniform vec3 uRotation;\n" +
        "uniform vec3 uPosition;\n" +
        "uniform vec3 uScale;\n" +
        "uniform vec3 uColor;\n" +
        "varying vec3 vColor;\n" +
            ///////////////////////////////////////
        "mat4 positionMTX(vec3 t)" +
        "{\n" +
        "   return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);\n" +
        "}\n" +
        'mat4 scaleMTX(vec3 t)' +
        '{\n' +
        '   return mat4( t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);\n' +
        '}\n' +
        'mat4 rotationMTX(vec3 t)' +
        '{\n' +
        '   float s = sin(t[0]);float c = cos(t[0]);\n' +
        '   mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);\n' +
        '   mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);\n' +
        '   mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);\n' +
        '   return m3*m2*m1;\n' +
        '}\n' +
            ///////////////////////////////////////
        "void main(void) {\n" +
        "   gl_Position = \n" +
        "   uPixelMatrix * \n" +
        "   positionMTX(uPosition) * \n" +
        "   rotationMTX(uRotation) * \n" +
        "   scaleMTX(uScale) * \n" +
        "   vec4(aVertexPosition, 1.0);\n" +
        "   vColor = uColor;\n" +
        "}",
        fragment: "\n" +
        "precision mediump float;\n" +
        "varying vec3 vColor;\n" +
        "void main(void) {\n" +
        "   gl_FragColor = vec4(vColor, 1.0);\n" +
        "}",
        attribs: 'aVertexPosition', // 사용한 버퍼
        uniforms: 'uPixelMatrix,uRotation,uPosition,uScale,uColor' // 사용한 유니폼
    },
    bsGL.SHADER_SOURCES['bitmap'] = {
        vertex: "\n" +
        "attribute vec3 aVertexPosition;\n" +
        "attribute vec2 aUV;\n" +
        "varying vec2 vUV;\n" +
        "uniform mat4 uPixelMatrix;\n" +
        "uniform vec3 uRotation;\n" +
        "uniform vec3 uPosition;\n" +
        "uniform vec3 uScale;\n" +
            ///////////////////////////////////////
        "mat4 positionMTX(vec3 t)" +
        "{\n" +
        "   return mat4( 1,0,0,0, 0,1,0,0, 0,0,1,0, t[0],t[1],t[2],1);\n" +
        "}\n" +
        'mat4 scaleMTX(vec3 t)' +
        '{\n' +
        '   return mat4( t[0],0,0,0, 0,t[1],0,0, 0,0,t[2],0, 0,0,0,1);\n' +
        '}\n' +
        'mat4 rotationMTX(vec3 t)' +
        '{\n' +
        '   float s = sin(t[0]);float c = cos(t[0]);\n' +
        '   mat4 m1 = mat4( 1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1);s = sin(t[1]);c = cos(t[1]);\n' +
        '   mat4 m2 = mat4(c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1);s = sin(t[2]);c = cos(t[2]);\n' +
        '   mat4 m3 = mat4(c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1);\n' +
        '   return m3*m2*m1;\n' +
        '}\n' +
            ///////////////////////////////////////
        "void main(void) {\n" +
        "   gl_Position = \n" +
        "   uPixelMatrix * \n" +
        "   positionMTX(uPosition) * \n" +
        "   rotationMTX(uRotation) * \n" +
        "   scaleMTX(uScale) * \n" +
        "   vec4(aVertexPosition, 1.0);\n" +
        "   vUV = aUV;\n" +
        "}",
        fragment: "\n" +
        "precision mediump float;\n" +
        'uniform sampler2D uSampler;' +
        "varying vec2 vUV;\n" +
        "void main(void) {\n" +
        "gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t));\n" +
        "}",
        attribs: 'aVertexPosition,aUV', // 사용한 버퍼
        uniforms: 'uPixelMatrix,uRotation,uPosition,uScale,uSampler' // 사용한 유니폼
    }
})();
