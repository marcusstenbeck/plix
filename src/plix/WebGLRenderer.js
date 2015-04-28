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
        '   vec4 color = texture2D(u_t_diffuse, v_tc_diffuse);',
        '   gl_FragColor = vec4(color);',
        '}'
    ].join('\n');


    //////// MESH SHADER   /////////

    var vsMesh = [
        'attribute vec3 vPos;',

        'attribute vec2 a_tc_diffuse;',
        'attribute vec3 a_color;',
        'varying vec2 v_tc_diffuse;',
        'varying vec3 v_color;',

        'uniform float uTime;',
        'uniform vec3 uScale;',
        'uniform vec2 uOffset;',
        'uniform vec2 uDisplaySize;',

// (xPos / dW) * 2 - 1,
// ((dH - yPos) / dH) * 2 - 1

        'void main(void) {',
        '   vec3 position = vec3(uOffset, 0.0) + vec3(vPos * uScale);',
        '   position.x = (position.x / uDisplaySize.x) * 2.0 - 1.0;',
        '   position.y = ((uDisplaySize.y - position.y) / uDisplaySize.y) * 2.0 - 1.0;',

        // TODO: Remove
        '   position.x = position.x + 2.0*sin(3.1419*(2.0*uTime*vPos.x/1000.0))/uDisplaySize.x;',

        '   gl_Position = vec4(position, 1.0);',

        '   v_tc_diffuse = a_tc_diffuse;',
        '   v_color = a_color;',
        '}'
    ].join('\n');


    var fsMesh = [
        'precision highp float;',

        'uniform vec4 uColor;',
        'uniform float uTime;',

        'varying vec2 v_tc_diffuse;',
        'varying vec3 v_color;',

        'void main(void) {',
        '   float red = v_color.r * (1.0 + 0.5*sin(2.0*3.1419*uTime/1000.0));',
        '   float green = v_color.g * (1.0 + 0.5*sin(0.5*3.1419 + 2.3*3.1419*uTime/1000.0));',
        '   float blue = v_color.b * (1.0 + 0.5*sin(1.5*3.1419 + 2.7*3.1419*uTime/1000.0));',
        '   gl_FragColor = vec4(red, green, blue, 1.0);',
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

        // Vertex buffers
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);

        // Index buffer
        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);

        this.shaders = {
            sprite: initShaders(gl, vs, fs),
            mesh: initShaders(gl, vsMesh, fsMesh)
        };
        
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        this.context = gl;
    }

    WebGLRenderer.prototype.bindSpriteProgram = function(gl) {
        // Shaders
        gl.useProgram(this.shaders.sprite);

        gl.disable(gl.DEPTH_TEST);

        // Setup shader attribute: vPos
        this.shaders.sprite.vPos = gl.getAttribLocation(this.shaders.sprite, 'vPos');
        gl.enableVertexAttribArray(this.shaders.sprite.vPos);
        gl.vertexAttribPointer(
                this.shaders.sprite.vPos,
                2,
                gl.FLOAT,
                false,
                16, // sizeof(gl.FLOAT)*4 = 4*4 => 16
                0   // first => 0
            );

        // Setup shader attribute: a_tc_diffuse
        this.shaders.sprite.a_tc_diffuse = gl.getAttribLocation(this.shaders.sprite, 'a_tc_diffuse');
        gl.enableVertexAttribArray(this.shaders.sprite.a_tc_diffuse);
        gl.vertexAttribPointer(
                this.shaders.sprite.a_tc_diffuse,
                2,
                gl.FLOAT,
                false,
                16, // sizeof(gl.FLOAT) * 4 = 4*4 => 16
                8   // sizeof(gl.FLOAT)*2 = 4*2 => 8
            );

        // Setup shader uniform: u_t_diffuse
        this.shaders.sprite.u_t_diffuse = gl.getUniformLocation(this.shaders.sprite, 'u_t_diffuse');

        // Setup shader uniform: color
        this.shaders.sprite.uColor = gl.getUniformLocation(this.shaders.sprite, 'uColor');
    };

    WebGLRenderer.prototype.bindMeshProgram = function(gl) {
        // Shaders
        gl.useProgram(this.shaders.mesh);

        gl.enable(gl.DEPTH_TEST);

        // (vec3(vPos) + vec2(a_tc_diffuse) + vec3(a_color)) * sizeof(gl.FLOAT) = (3+2+3)*4 = 8*4 => 32
        var stride = 32;

        // Setup shader attribute: vPos
        this.shaders.mesh.vPos = gl.getAttribLocation(this.shaders.mesh, 'vPos');
        gl.enableVertexAttribArray(this.shaders.mesh.vPos);
        gl.vertexAttribPointer(
                this.shaders.mesh.vPos,
                3,
                gl.FLOAT,
                false,
                stride,
                0   // first => 0
            );

        // Setup shader attribute: a_tc_diffuse
        this.shaders.mesh.a_tc_diffuse = gl.getAttribLocation(this.shaders.mesh, 'a_tc_diffuse');
        gl.enableVertexAttribArray(this.shaders.mesh.a_tc_diffuse);
        gl.vertexAttribPointer(
                this.shaders.mesh.a_tc_diffuse,
                2,
                gl.FLOAT,
                false,
                stride,
                12   // sizeof(gl.FLOAT)*3 = 4*3 => 12
            );

        // Setup shader attribute: a_color
        this.shaders.mesh.a_color = gl.getAttribLocation(this.shaders.mesh, 'a_color');
        gl.enableVertexAttribArray(this.shaders.mesh.a_color);
        gl.vertexAttribPointer(
                this.shaders.mesh.a_color,
                3,
                gl.FLOAT,
                false,
                stride,
                20   // sizeof(gl.FLOAT)*(3+2) = 4*5 => 20
            );

        // Setup shader uniform: time
        this.shaders.mesh.uTime = gl.getUniformLocation(this.shaders.mesh, 'uTime');

        // Setup shader uniform: color
        this.shaders.mesh.uColor = gl.getUniformLocation(this.shaders.mesh, 'uColor');

        // Setup shader uniform: offset
        this.shaders.mesh.uOffset = gl.getUniformLocation(this.shaders.mesh, 'uOffset');

        // Setup shader uniform: displaySize
        this.shaders.mesh.uDisplaySize = gl.getUniformLocation(this.shaders.mesh, 'uDisplaySize');

        // Setup shader uniform: scale
        this.shaders.mesh.uScale = gl.getUniformLocation(this.shaders.mesh, 'uScale');
    };

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
            if(!entity.components.graphics) return;

            if(entity.components.graphics.graphic.type === 'sprite') {
                this.drawSprite(this.context, entity, { offset: offset });
            } else if(entity.components.graphics.graphic.type === '3d') {
                this.drawMesh(this.context, entity, { offset: offset });
            }

            // this.drawDebug(this.context, entity, {
            //     offset: offset
            // });

        }.bind(this));
    };

    WebGLRenderer.prototype.clear = function(gl) {
        // Wipe the canvas clean
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };

    WebGLRenderer.prototype.drawMesh = function(gl, entity, options) {
        options = options || {};
        
        this.bindMeshProgram(gl);

        // Upload time
        gl.uniform1f(this.shaders.mesh.uTime, entity.scene.app.timeElapsed);

        var color = entity.components.graphics.graphic.color || [1, 1, 1, 1];
        gl.uniform4fv(this.shaders.mesh.uColor, new Float32Array(color));

        var scale = entity.components.graphics.graphic.scale;
        gl.uniform3fv(this.shaders.mesh.uScale, new Float32Array(scale));

        var offset = [entity.transform.position.x, entity.transform.position.y];
        if(options.offset.x) {
            offset[0] -= options.offset.x;
            offset[1] -= options.offset.y;
        }
        gl.uniform2fv(this.shaders.mesh.uOffset, new Float32Array(offset));

        var displaySize = [
            entity.scene.app.canvas.width,
            entity.scene.app.canvas.height
        ];
        gl.uniform2fv(this.shaders.mesh.uDisplaySize, new Float32Array(displaySize));

        // Upload to vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(entity.components.graphics.graphic.shapeData.vertices), gl.DYNAMIC_DRAW);

        // Upload to index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(entity.components.graphics.graphic.shapeData.indices), gl.DYNAMIC_DRAW);

        // Draw buffer
        gl.drawElements(gl.TRIANGLES, entity.components.graphics.graphic.shapeData.indices.length, gl.UNSIGNED_BYTE, 0);
    };

    WebGLRenderer.prototype.drawSprite = function(gl, entity, options) {
        options = options || {};
        
        this.bindSpriteProgram(gl);

        // width and height will be used to scale coordinates
        var width = entity.scene.app.canvas.width;
        var height = entity.scene.app.canvas.height;
        var offset = options.offset;
        var pos = {
            x: entity.transform.position.x - offset.x,
            y: entity.transform.position.y - offset.y
        };

        var color = entity.components.graphics.graphic.color || [1, 1, 1, 1];
        gl.uniform4fv(this.shaders.sprite.uColor, new Float32Array(color));

        var halfWidth = (entity.components.graphics.graphic.shapeData.width * entity.components.graphics.graphic.scale.x) / 2;
        var halfHeight = (entity.components.graphics.graphic.shapeData.height * entity.components.graphics.graphic.scale.y) / 2;

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

            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(this.shaders.sprite.u_t_diffuse, 0);

            // Only create a new texture and load it onto the graphics card if there isn't already one
            if(!entity.components.graphics.graphic._texture) {
                entity.components.graphics.graphic._texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, entity.components.graphics.graphic._texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // gl coordinate system is fucked
                // Give the image to OpenGL
                // texImage2D(target, level, internalfmt, fmt, type, obj)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, entity.components.graphics.graphic.image);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                // gl.bindTexture(gl.TEXTURE_2D, null);
            } else {
                gl.bindTexture(gl.TEXTURE_2D, entity.components.graphics.graphic._texture);
            }
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
        gl.uniform4fv(this.shaders.mesh.uColor, new Float32Array(color));

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