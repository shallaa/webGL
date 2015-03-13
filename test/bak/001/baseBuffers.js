/**
 * Created by seonki on 2015-02-21.
 */


bsGL.baseBuffer = [
    {
        name: 'nullBuffer', size: 3, type: 'vbo',
        data: [
            -0.5, -0.5, 0.0
        ]
    },
    {
        name: 'triangle', size: 3, type: 'vbo',
        data: [
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0
        ]

    },
    {
        name: 'rect', size: 3, type: 'vbo',
        data: [
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0,
            0.5, 0.5, 0.0
        ]
    },
    {
        name: 'rect', size: 2, type: 'uv',
        data: [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ]
    },
    {
        name: 'triangle', size: 2, type: 'uv',
        data: [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0
        ]
    }
]
