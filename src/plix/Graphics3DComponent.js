define([
    'plix/Component',
    'lib/vendor/gl-matrix/dist/gl-matrix'
], function(
    Component,
    glm
) {
    'use strict';

    function Graphics3DComponent(params) {
        Component.call(this, params);
        if(!params) params = {};

        this.type = 'graphics';

        var img = new Image();
        img.src = params.imagePath;
        img.onload = function () {
            img.isLoaded = true;
            console.log('loaded image');
        };

        this.graphic = {
            type: '3d',
            image: img,
            isLoaded: false,
            scale: params.scale || [1, 1, 1],
            _matrix: glm.mat4.create(),
            shapeData: {
                type: 'cube',
                vertices: [
                    // x,    y,    z,     nx,   ny,   nz,     tx,   ty,      r,    g,    b,
                    // Front face
                    -0.5, -0.5,  0.5,   -0.5, -0.5,  0.5,    0.0,  1.0,    1.0,  0.0,  0.0,
                     0.5, -0.5,  0.5,    0.5, -0.5,  0.5,    0.0,  1.0,    0.0,  1.0,  0.0,
                     0.5,  0.5,  0.5,    0.5,  0.5,  0.5,    0.0,  1.0,    0.0,  0.0,  1.0,
                    -0.5,  0.5,  0.5,   -0.5,  0.5,  0.5,    0.0,  1.0,    1.0,  1.0,  0.0,

                    // Back face
                    -0.5, -0.5, -0.5,   -0.5, -0.5, -0.5,    0.0,  1.0,    0.0,  0.0,  1.0,
                    -0.5,  0.5, -0.5,   -0.5,  0.5, -0.5,    0.0,  1.0,    1.0,  1.0,  0.0,
                     0.5,  0.5, -0.5,    0.5,  0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  1.0,
                     0.5, -0.5, -0.5,    0.5, -0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  0.0,

                    // Top face
                    -0.5,  0.5, -0.5,   -0.5,  0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  1.0,
                    -0.5,  0.5,  0.5,   -0.5,  0.5,  0.5,    0.0,  1.0,    0.0,  0.0,  1.0,
                     0.5,  0.5,  0.5,    0.5,  0.5,  0.5,    0.0,  1.0,    0.0,  1.0,  0.0,
                     0.5,  0.5, -0.5,    0.5,  0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  1.0,

                    // Bottom face
                    -0.5, -0.5, -0.5,   -0.5, -0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  0.0,
                     0.5, -0.5, -0.5,    0.5, -0.5, -0.5,    0.0,  1.0,    1.0,  1.0,  0.0,
                     0.5, -0.5,  0.5,    0.5, -0.5,  0.5,    0.0,  1.0,    1.0,  0.0,  1.0,
                    -0.5, -0.5,  0.5,   -0.5, -0.5,  0.5,    0.0,  1.0,    0.0,  0.0,  1.0,

                    // Right face
                     0.5, -0.5, -0.5,    0.5, -0.5, -0.5,    0.0,  1.0,    0.0,  1.0,  0.0,
                     0.5,  0.5, -0.5,    0.5,  0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  0.0,
                     0.5,  0.5,  0.5,    0.5,  0.5,  0.5,    0.0,  1.0,    0.0,  0.0,  1.0,
                     0.5, -0.5,  0.5,    0.5, -0.5,  0.5,    0.0,  1.0,    1.0,  0.0,  1.0,

                    // Left face
                    -0.5, -0.5, -0.5,   -0.5, -0.5, -0.5,    0.0,  1.0,    1.0,  0.0,  0.0,
                    -0.5, -0.5,  0.5,   -0.5, -0.5,  0.5,    0.0,  1.0,    0.0,  0.0,  1.0,
                    -0.5,  0.5,  0.5,   -0.5,  0.5,  0.5,    0.0,  1.0,    1.0,  0.0,  1.0,
                    -0.5,  0.5, -0.5,   -0.5,  0.5, -0.5,    0.0,  1.0,    1.0,  1.0,  0.0,
                ],
                indices: [
                     0,  1,  2,    0,  2,  3,  // Front face
                     4,  5,  6,    4,  6,  7,  // Back face
                     8,  9, 10,    8, 10, 11,  // Top face
                    12, 13, 14,   12, 14, 15,  // Bottom face
                    16, 17, 18,   16, 18, 19,  // Right face
                    20, 21, 22,   20, 22, 23   // Left face
                ]
            }
        };
    }
    Graphics3DComponent.prototype = Object.create(Component.prototype);

    Graphics3DComponent.prototype.receiveMessage = function() {};

    return Graphics3DComponent;
});