define([
    'lib/vendor/gl-matrix/dist/gl-matrix'
], function(
    glm
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
        '#define PI       3.1415926536',

        'uniform float u_time;',

        'uniform mat4 u_M;',
        'uniform mat3 u_Mnormal;',
        'uniform mat4 u_V;',
        'uniform mat4 u_P;',
        'uniform vec3 u_lPos;',

        'attribute vec3 a_pos;',
        'attribute vec3 a_n;',
        'attribute vec2 a_tc_diffuse;',
        'attribute vec3 a_color;',
        
        'varying vec3 v_pos;',
        'varying vec3 v_n;',
        'varying vec2 v_tc_diffuse;',
        'varying vec3 v_color;',
        'varying vec3 v_lPos;',


        'void main(void) {',
            // Export the varyings
        '   v_tc_diffuse = a_tc_diffuse;',
        '   v_color = a_color;',
        '   v_n = mat3(u_V) * u_Mnormal * a_n;',

        '   vec4 position = u_P * u_V * u_M * vec4(a_pos, 1.0);',
        
        '   v_pos = vec3(u_V * u_M * vec4(a_pos, 1.0)).xyz;',
        '   v_lPos = vec3(u_V * vec4(u_lPos, 1.0)).xyz;',

        '   gl_Position = vec4(position);',
        '}'
    ].join('\n');


    var fsMesh = [
        '#define PI       3.1415926536',
        
        'precision highp float;',
        
        'uniform vec4 u_color;',
        'uniform float u_time;',
        'uniform float u_lIntensity;',

        'varying vec3 v_pos;',
        'varying vec3 v_n;',
        'varying vec2 v_tc_diffuse;',
        'varying vec3 v_color;',
        'varying vec3 v_lPos;',

        'vec3 calculateLight(vec3 diffuse, vec3 specular) {',

        '   vec3 n = normalize(v_n);',
        '   vec3 v = normalize(-v_pos);',
        '   vec3 Lout = vec3(0.0);',
        
        '   float Li = u_lIntensity;',  // Intensity

        '   vec3 l = normalize(v_lPos - v_pos);',  // Point-to-light
        '   vec3 h = normalize(v + l);',  // Half vector
        '   float cosTh = max(0.0, dot(n, h));',  // specular shenagiggiian, NdotHV
        '   float cosTi = max(0.0, dot(n, l));',  // cos(theta_incident), NdotL
        
        // Attenuation
        '   float dist = length(v_lPos - v_pos);',
        '   float constantAttenuation = 1.0;',
        '   float linearAttenuation = 0.01 ;',
        '   float quadraticAttenuation = 0.0001;',
        '   float attenuation = 1.0 / (constantAttenuation + (linearAttenuation * dist) + (quadraticAttenuation * dist * dist));',
        
        '   float m = 30.0;',  // Smoothness from Real-Time Rendering
        '   vec3 Kd = diffuse / PI;',
        '   vec3 Ks = specular * ((m + 8.0) / (8.0 * PI));', // Specular not affected by attenuation

        '   vec3 Ka = mix(vec3(0.1), vec3(0.0), cosTh * 0.5 + 0.5);',

        '   Lout += vec3( Kd + (Ks * pow(cosTh, m)) ) * Li * cosTi * attenuation + Ka;',

        '   return Lout;',
        '}',

        'void main(void) {',
        '   gl_FragColor = vec4(calculateLight(u_color.rgb, vec3(0.01)), 1.0);',
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

    WebGLRenderer.prototype.resize = function() {
        var gl = this.context;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

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

        // (vec3(a_pos) + vec3(a_n) + vec2(a_tc_diffuse) + vec3(a_color)) * sizeof(gl.FLOAT)
        // = (3+3+2+3)*4 = 11*4 => 44
        var stride = 44;

        // Setup shader attribute: a_pos
        this.shaders.mesh.a_pos = gl.getAttribLocation(this.shaders.mesh, 'a_pos');
        gl.enableVertexAttribArray(this.shaders.mesh.a_pos);
        gl.vertexAttribPointer(
                this.shaders.mesh.a_pos,
                3,
                gl.FLOAT,
                false,
                stride,
                0   // first => 0
            );

        // Setup shader attribute: a_n
        this.shaders.mesh.a_n = gl.getAttribLocation(this.shaders.mesh, 'a_n');
        gl.enableVertexAttribArray(this.shaders.mesh.a_n);
        gl.vertexAttribPointer(
                this.shaders.mesh.a_n,
                3,
                gl.FLOAT,
                false,
                stride,
                12   // sizeof(gl.FLOAT)*3 = 4*3 => 12
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
                24   // sizeof(gl.FLOAT)*(3+3) = 4*6 => 24
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
                32   // sizeof(gl.FLOAT)*(3+3+2) = 4*8 => 32
            );

        // Setup shader uniform: time
        this.shaders.mesh.u_time = gl.getUniformLocation(this.shaders.mesh, 'u_time');

        // Setup shader uniform: color
        this.shaders.mesh.u_color = gl.getUniformLocation(this.shaders.mesh, 'u_color');

        // Setup shader uniform: u_M
        this.shaders.mesh.u_M = gl.getUniformLocation(this.shaders.mesh, 'u_M');

        // Setup shader uniform: u_Mnormal
        this.shaders.mesh.u_Mnormal = gl.getUniformLocation(this.shaders.mesh, 'u_Mnormal');

        // Setup shader uniform: u_V
        this.shaders.mesh.u_V = gl.getUniformLocation(this.shaders.mesh, 'u_V');

        // Setup shader uniform: u_P
        this.shaders.mesh.u_P = gl.getUniformLocation(this.shaders.mesh, 'u_P');

        // Setup shader uniform: u_lPos
        this.shaders.mesh.u_lPos = gl.getUniformLocation(this.shaders.mesh, 'u_lPos');

        // Setup shader uniform: u_lIntensity
        this.shaders.mesh.u_lIntensity = gl.getUniformLocation(this.shaders.mesh, 'u_lIntensity');
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
            offset.x = options.cameraComponent.entity.transform.position.x;
            offset.y = options.cameraComponent.entity.transform.position.y;
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

        // Time
        gl.uniform1f(this.shaders.mesh.u_time, entity.scene.app.timeElapsed);

        // Constant color
        var color = entity.components.graphics.graphic.color || [1, 1, 1, 1];
        gl.uniform4fv(this.shaders.mesh.u_color, new Float32Array(color));

        // Light stuff
        var lightPosition = [options.offset.x, options.offset.y + 100, 150];
        gl.uniform3fv(this.shaders.mesh.u_lPos, new Float32Array(lightPosition));
        var lightIntensity = [entity.scene._lightIntensity] || [20];
        gl.uniform1fv(this.shaders.mesh.u_lIntensity, new Float32Array(lightIntensity));

        // Model matrix
        var scale = entity.components.graphics.graphic.scale;
        var matM = glm.mat4.create();
        glm.mat4.translate(matM, matM, glm.vec3.fromValues(entity.transform.position.x, entity.transform.position.y, 0));
        glm.mat4.scale(matM, matM, glm.vec3.fromValues(scale[0], scale[1], scale[2]));
        gl.uniformMatrix4fv(this.shaders.mesh.u_M, false, new Float32Array(matM));

        // Normal matrix
        var matMn = glm.mat3.create();
        glm.mat3.fromMat4(matMn, matM);
        glm.mat3.invert(matMn, matMn);
        glm.mat3.transpose(matMn, matMn);
        gl.uniformMatrix3fv(this.shaders.mesh.u_Mnormal, false, new Float32Array(matMn));


        // View matrix
        var matV = glm.mat4.create();
        if(options.offset.x) {
            glm.mat4.translate(matV, matV, glm.vec3.fromValues(-options.offset.x, -options.offset.y, 0));
        }
        glm.mat4.translate(matV, matV, glm.vec3.fromValues(0, 0, -400));
        gl.uniformMatrix4fv(this.shaders.mesh.u_V, false, new Float32Array(matV));

        // Perspective
        var matP = glm.mat4.create();
        glm.mat4.perspective(matP, Math.PI/3, gl.drawingBufferWidth/gl.drawingBufferHeight, 0.1, 100000);
        gl.uniformMatrix4fv(this.shaders.mesh.u_P, false, new Float32Array(matP));

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
        var width = gl.drawingBufferWidth;
        var height = gl.drawingBufferHeight;
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
        var width = gl.drawingBufferWidth;
        var height = gl.drawingBufferHeight;
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