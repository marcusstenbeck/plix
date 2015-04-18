define([
], function(
) {
    'use strict';

    var vs = [
        'attribute vec3 vPos;',

        'void main(void) {',
        '    gl_Position = vec4(vPos, 1.0);',
        '}'
    ].join('\n');


    var fs = [
        'precision mediump float;',

        'uniform vec4 uColor;',

        'void main(void) {',
        '    gl_FragColor = vec4(uColor);',
        '}'
    ].join('\n');

    function loadShader(gl, src, type) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, src);

        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
            console.error('Error compiling shader\n', 'Type: ' + type + '\n' , gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    function initShaders(gl, vSrc, fSrc) {
        var vs = loadShader(gl, vSrc, gl.VERTEX_SHADER);        
        var fs = loadShader(gl, fSrc, gl.FRAGMENT_SHADER);      

        var shaderProgram = gl.createProgram();
        
        gl.attachShader(shaderProgram, vs);
        gl.attachShader(shaderProgram, fs);


        gl.linkProgram(shaderProgram);

        if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) && !gl.isContextLost()) {
            console.error('Error linking shader program\n', gl.getProgramInfoLog(shaderProgram));
            gl.deleteProgram(shaderProgram);
            return null;
        }


        gl.validateProgram(shaderProgram);

        if(!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS) && !gl.isContextLost()) {
            console.error('Error validating shader program\n', gl.getProgramInfoLog(shaderProgram));
            gl.deleteProgram(shaderProgram);
            return null;
        }

        return shaderProgram;
    }

    function WebGLRenderer(params) {
        if(!params) params = {};

        this.canvas = params.canvas;

        var gl = this.canvas.getContext('webgl', { antialias: true });

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        // Vertex buffers
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);

        // Shaders
        gl.program = initShaders(gl, vs, fs);
        gl.useProgram(gl.program);

        // Setup shader attribute: vPos
        gl.program.vPos = gl.getAttribLocation(gl.program, 'vPos');
        gl.enableVertexAttribArray(gl.program.vPos);
        gl.vertexAttribPointer(
                gl.program.vPos,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );

        // Setup shader uniform: color
        gl.program.uColor = gl.getUniformLocation(gl.program, 'uColor');
        

        this.context = gl;
    }

    WebGLRenderer.prototype.render = function(scene) {
        var cameraComponent;

        // YOLO: choose the first occurence of the camera
        var entity;
        for(var i = 0; i < scene.entities.length; i++) {
            var entity = scene.entities[i];

            if(entity.components['camera']) {
                cameraComponent = entity.components.camera;
            }
        }

        if(!!cameraComponent) {
            this._renderWithCamera({
                cameraComponent: cameraComponent,
                scene: scene
            });
        } else {
            this._renderWithoutCamera(scene);
        }
    };

    WebGLRenderer.prototype._renderWithCamera = function(options) {
        options || (options = {});

        var scene = options.scene;
        var camPosition = {
            x: options.cameraComponent.entity.transform.position.x - (scene.app.width / 2),
            y: options.cameraComponent.entity.transform.position.y - (scene.app.height / 2)
        }

        var gl = this.context;

        // Wipe the canvas clean
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // width and height will be used to scale coordinates
        var width = scene.app.canvas.width;
        var height = scene.app.canvas.height;

        var pRelToCam;
        scene.entities.forEach(function(entity) {
            
            pRelToCam = {
                x: entity.transform.position.x - camPosition.x,
                y: entity.transform.position.y - camPosition.y
            }   

            var color = entity.components.graphics.graphic.color;
            gl.uniform4fv(gl.program.uColor, new Float32Array(color));

            var verts = [
                // Center cross (x,y) tuples
                pRelToCam.x - 3, pRelToCam.y - 3,
                pRelToCam.x + 3, pRelToCam.y + 3,
                pRelToCam.x + 3, pRelToCam.y - 3,
                pRelToCam.x - 3, pRelToCam.y + 3,
            ];

            if(entity.components.physics) {

                verts = verts.concat([
                    // Bounding box
                    pRelToCam.x - entity.components.physics.body.shape.width/2 + 0.5, pRelToCam.y - entity.components.physics.body.shape.height/2 + 0.5,
                    pRelToCam.x + entity.components.physics.body.shape.width/2 - 0.5, pRelToCam.y - entity.components.physics.body.shape.height/2 + 0.5,
                    
                    pRelToCam.x + entity.components.physics.body.shape.width/2 - 0.5, pRelToCam.y - entity.components.physics.body.shape.height/2 + 0.5,
                    pRelToCam.x + entity.components.physics.body.shape.width/2 - 0.5, pRelToCam.y + entity.components.physics.body.shape.height/2 - 0.5,

                    pRelToCam.x + entity.components.physics.body.shape.width/2 - 0.5, pRelToCam.y + entity.components.physics.body.shape.height/2 - 0.5,
                    pRelToCam.x - entity.components.physics.body.shape.width/2 + 0.5, pRelToCam.y + entity.components.physics.body.shape.height/2 - 0.5,

                    pRelToCam.x - entity.components.physics.body.shape.width/2 + 0.5, pRelToCam.y + entity.components.physics.body.shape.height/2 - 0.5,
                    pRelToCam.x - entity.components.physics.body.shape.width/2 + 0.5, pRelToCam.y - entity.components.physics.body.shape.height/2 + 0.5,
                ]);
            }

            // Translate to GL coordinates
            for(var i = 0; i < verts.length; i += 2) {
                verts[i  ] = (verts[i] / width) * 2 - 1;
                verts[i+1] = ((height - verts[i+1]) / height) * 2 - 1;
            }

            // Upload to buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

            // Draw buffer
            var vPosSize = 2;
            gl.drawArrays(gl.LINES, 0, verts.length/vPosSize);

        });
    };

    WebGLRenderer.prototype._renderWithoutCamera = function(scene) {
        var gl = this.context;

        // Wipe the canvas clean
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // width and height will be used to scale coordinates
        var width = scene.app.canvas.width;
        var height = scene.app.canvas.height;

        scene.entities.forEach(function(entity) {

            var color = entity.components.graphics.graphic.color;
            gl.uniform4fv(gl.program.uColor, new Float32Array(color));

            var verts = [
                // Center cross (x,y) tuples
                entity.transform.position.x - 3, entity.transform.position.y - 3,
                entity.transform.position.x + 3, entity.transform.position.y + 3,
                entity.transform.position.x + 3, entity.transform.position.y - 3,
                entity.transform.position.x - 3, entity.transform.position.y + 3,
            ];

            if(entity.components.physics) {
                verts = verts.concat([
                    // Bounding box
                    entity.transform.position.x - entity.components.physics.body.shape.width/2 + 0.5, entity.transform.position.y - entity.components.physics.body.shape.height/2 + 0.5,
                    entity.transform.position.x + entity.components.physics.body.shape.width/2 - 0.5, entity.transform.position.y - entity.components.physics.body.shape.height/2 + 0.5,
                    
                    entity.transform.position.x + entity.components.physics.body.shape.width/2 - 0.5, entity.transform.position.y - entity.components.physics.body.shape.height/2 + 0.5,
                    entity.transform.position.x + entity.components.physics.body.shape.width/2 - 0.5, entity.transform.position.y + entity.components.physics.body.shape.height/2 - 0.5,

                    entity.transform.position.x + entity.components.physics.body.shape.width/2 - 0.5, entity.transform.position.y + entity.components.physics.body.shape.height/2 - 0.5,
                    entity.transform.position.x - entity.components.physics.body.shape.width/2 + 0.5, entity.transform.position.y + entity.components.physics.body.shape.height/2 - 0.5,

                    entity.transform.position.x - entity.components.physics.body.shape.width/2 + 0.5, entity.transform.position.y + entity.components.physics.body.shape.height/2 - 0.5,
                    entity.transform.position.x - entity.components.physics.body.shape.width/2 + 0.5, entity.transform.position.y - entity.components.physics.body.shape.height/2 + 0.5,
                ]);
            }

            // Translate to GL coordinates
            for(var i = 0; i < verts.length; i += 2) {
                verts[i  ] = (verts[i] / width) * 2 - 1;
                verts[i+1] = ((height - verts[i+1]) / height) * 2 - 1;
            }

            // Upload to buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

            // Draw buffer
            var vPosSize = 2;
            gl.drawArrays(gl.LINES, 0, verts.length/vPosSize);

        });
    };

    return WebGLRenderer;
});