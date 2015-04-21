define([
], function(
) {
    'use strict';

    var vs = [
        'attribute vec2 vPos;',

        'attribute vec2 a_tc_diffuse;',
        'varying vec2 v_tc_diffuse;',

        'void main(void) {',
        '   v_tc_diffuse = a_tc_diffuse;',
        '   gl_Position = vec4(vPos, 0.0, 1.0);',
        '}'
    ].join('\n');


    var fs = [
        'precision mediump float;',

        'uniform vec4 uColor;',

        'uniform sampler2D u_t_diffuse;',
        'varying vec2 v_tc_diffuse;',

        'void main(void) {',
        '   vec4 color = texture2D(u_t_diffuse, v_tc_diffuse) + vec4(0.1, 0.1, 0.1, 0.0);',
        '   gl_FragColor = vec4(color);',
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
        // gl.enable(gl.DEPTH_TEST);

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
                16, // sizeof(gl.FLOAT)*4 = 4*4 => 16
                0   // first => 0
            );

        // Setup shader attribute: a_tc_diffuse
        gl.program.a_tc_diffuse = gl.getAttribLocation(gl.program, 'a_tc_diffuse');
        gl.enableVertexAttribArray(gl.program.a_tc_diffuse);
        gl.vertexAttribPointer(
                gl.program.a_tc_diffuse,
                2,
                gl.FLOAT,
                false,
                16, // sizeof(gl.FLOAT) * 4 = 4*4 => 16
                8   // sizeof(gl.FLOAT)*2 = 4*2 => 8
            );

        // Setup shader uniform: u_t_diffuse
        gl.program.u_t_diffuse = gl.getUniformLocation(gl.program, 'u_t_diffuse');

        // Setup shader uniform: color
        gl.program.uColor = gl.getUniformLocation(gl.program, 'uColor');
        
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        this.context = gl;
    }

    WebGLRenderer.prototype.render = function(scene) {

        // YOLO: choose the first occurence of the camera
        var entity;
        var cameraComponent;
        for(var i = 0; i < scene.entities.length; i++) {
            entity = scene.entities[i];

            if(!!entity.components.camera) {
                cameraComponent = entity.components.camera;
            }
        }

        this._render({
            cameraComponent: cameraComponent,
            scene: scene
        });
    };

    WebGLRenderer.prototype._render = function(options) {
        options = options || {};

        var scene = options.scene;

        var offset = { x:0, y:0 };

        if(!!options.cameraComponent) {
            offset.x = options.cameraComponent.entity.transform.position.x - (scene.app.width / 2);
            offset.y = options.cameraComponent.entity.transform.position.y - (scene.app.height / 2);
        }

        /**
         *  Clear canvas
         */
        this.clear(this.context);


        /**
         *  Draw entities
         */
        scene.entities.forEach(function(entity) {

            this.drawSprite(this.context, entity, {
                offset: offset
            });

            this.drawDebug(this.context, entity, {
                offset: offset
            });

        }.bind(this));
    };

    WebGLRenderer.prototype.clear = function(gl) {
        // Wipe the canvas clean
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    WebGLRenderer.prototype.drawSprite = function(gl, entity, options) {
        options = options || {};

        if(!entity.components.graphics) return;
        
        // width and height will be used to scale coordinates
        var width = entity.scene.app.canvas.width;
        var height = entity.scene.app.canvas.height;
        var offset = options.offset;
        var pos = {
            x: entity.transform.position.x - offset.x,
            y: entity.transform.position.y - offset.y
        };

        var color = entity.components.graphics.graphic.color || [1, 1, 1, 1];
        gl.uniform4fv(gl.program.uColor, new Float32Array(color));

        var halfWidth = entity.components.graphics.graphic.shapeData.width/2;
        var halfHeight = entity.components.graphics.graphic.shapeData.height/2;

        var verts = [
            // Tri 1
            pos.x - halfWidth, pos.y - halfHeight, 0, 1,
            pos.x - halfWidth, pos.y + halfHeight, 0, 0,
            pos.x + halfWidth, pos.y + halfHeight, 1, 0,


            // Tri 2
            pos.x - halfWidth, pos.y - halfHeight, 0, 1, 
            pos.x + halfWidth, pos.y - halfHeight, 1, 1,
            pos.x + halfWidth, pos.y + halfHeight, 1, 0,
        ];

        // Translate to GL coordinates
        for(var i = 0; i < verts.length; i += 4) {
            verts[i  ] = (verts[i] / width) * 2 - 1;
            verts[i+1] = ((height - verts[i+1]) / height) * 2 - 1;
        }

        // Upload to buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);


        if(entity.components.graphics.graphic.type === 'sprite' && !!entity.components.graphics.graphic.image.isLoaded) {
            var texture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            // Give the image to OpenGL
            // texImage2D(target, level, internalfmt, fmt, type, obj)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, entity.components.graphics.graphic.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            // gl.bindTexture(gl.TEXTURE_2D, null);


            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(gl.program.u_t_diffuse, 0);
        }






        // Draw buffer
        var vPosSize = 4;
        gl.drawArrays(gl.TRIANGLES, 0, verts.length/vPosSize);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    WebGLRenderer.prototype.drawDebug = function(gl, entity, options) {
        options = options || {};

        // width and height will be used to scale coordinates
        var width = entity.scene.app.canvas.width;
        var height = entity.scene.app.canvas.height;
        var offset = options.offset;
        var pos = {
            x: entity.transform.position.x - offset.x,
            y: entity.transform.position.y - offset.y
        };

        var color = entity.components.graphics.graphic.color || [1, 1, 1, 1];
        gl.uniform4fv(gl.program.uColor, new Float32Array(color));

        var verts = [
            // Center cross (x,y) tuples
            pos.x - 3, pos.y - 3, 0, 0,
            pos.x + 3, pos.y + 3, 0, 0,
            pos.x + 3, pos.y - 3, 0, 0,
            pos.x - 3, pos.y + 3, 0, 0,
        ];

        if(entity.components.physics) {

            verts = verts.concat([
                // Bounding box
                pos.x - entity.components.physics.body.shape.width/2 + 0.5, pos.y - entity.components.physics.body.shape.height/2 + 0.5, 0, 0,
                pos.x + entity.components.physics.body.shape.width/2 - 0.5, pos.y - entity.components.physics.body.shape.height/2 + 0.5, 0, 0,

                pos.x + entity.components.physics.body.shape.width/2 - 0.5, pos.y - entity.components.physics.body.shape.height/2 + 0.5, 0, 0,
                pos.x + entity.components.physics.body.shape.width/2 - 0.5, pos.y + entity.components.physics.body.shape.height/2 - 0.5, 0, 0,

                pos.x + entity.components.physics.body.shape.width/2 - 0.5, pos.y + entity.components.physics.body.shape.height/2 - 0.5, 0, 0,
                pos.x - entity.components.physics.body.shape.width/2 + 0.5, pos.y + entity.components.physics.body.shape.height/2 - 0.5, 0, 0,

                pos.x - entity.components.physics.body.shape.width/2 + 0.5, pos.y + entity.components.physics.body.shape.height/2 - 0.5, 0, 0,
                pos.x - entity.components.physics.body.shape.width/2 + 0.5, pos.y - entity.components.physics.body.shape.height/2 + 0.5, 0, 0,
            ]);
        }

        // Translate to GL coordinates
        for(var i = 0; i < verts.length; i += 4) {
            verts[i  ] = (verts[i] / width) * 2 - 1;
            verts[i+1] = ((height - verts[i+1]) / height) * 2 - 1;
        }

        // Upload to buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

        // Draw buffer
        var vPosSize = 4;
        gl.drawArrays(gl.LINES, 0, verts.length/vPosSize);
    };

    return WebGLRenderer;
});