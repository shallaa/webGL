/**
 * Created by redcamel on 2015-04-19.
 */
'use strict'
var bsGL = (function () {
    var W = window, DOC = document, HEAD = DOC.getElementsByTagName('head')[0];
    W.requestAnimFrame = (function () {
        return W.requestAnimationFrame || W.webkitRequestAnimationFrame || W.mozRequestAnimationFrame || function (loop) {
                W.setTimeout(loop, 16)
            }
    })()
    var gl
    var API = {
        gl: null, cvs: null,
        VBOS: {}, UVBOS: {}, IBOS: {}, PROGRAMS: {}, TEXTURES: {}, LOOPS: {},
        SHADER_SOURCES: {},
        children: [],
        init: function ($cvs, $func) {
            var script, list = arguments, i = list.length - 1
            //스크립트부터 다로딩한다!
            load(list[i])
            function load($src) {
                script ? (script.onload = null, HEAD.removeChild(script)) : 0
                script = DOC.createElement('script')
                script.type = 'text/javascript', script.charset = 'utf-8', script.src = $src
                if (i == 2) script.onload = function () {
                    script.onload = null, HEAD.removeChild(script)
                    API.getGL($cvs)
                    API.setBase()
                    $func();
                    (function animloop() {
                        for (var k in API.LOOPS) API.LOOPS[k]()
                        API.render()
                        requestAnimFrame(animloop)
                    })()
                }
                else script.onload = function () {
                    load(list[i])
                }
                HEAD.appendChild(script)
                i--
            }
        },
        render: function () {},
        setBase: function () {},
        getGL: function ($cvs) {
            var cvs = typeof $cvs == 'string' ? DOC.getElementById($cvs) : $cvs;
            var keys = 'webgl,experimental-webgl,webkit-3d,moz-webgl'.split(','), i = keys.length
            while (i--) if (gl = cvs.getContext(keys[i])) break
            console.log(gl ? 'webgl 초기화 성공!' : console.log('webgl 초기화 실패!!'))
            API.gl = gl, API.cvs = cvs
        },

        setSize: function (w, h) {
            API.uPixelMatrix = [
                2 / w, 0, 0, 0,
                0, -2 / h, 0, 0,
                0, 0, 0, 0,
                -1, 1, 0, 1
            ]
            var cvs = API.cvs
            if (cvs)  cvs.width = w, cvs.height = h
            console.log('!!!!!!!!!!',w, h)
            gl.viewport(0, 0, w, +h);
        }
    }
    return API
})();
