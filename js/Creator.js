define([
    'plix/Entity',
    'plix/PhysicsComponent',
    'plix/GraphicsComponent',
    'plix/ScriptComponent',
    'plix/Util'
], function(
    Entity,
    PhysicsComponent,
    GraphicsComponent,
    ScriptComponent,
    Util
) {

    function Creator() {}

    Creator.createEntity = function(parameters) {
        var type = parameters.type || null;

        switch(type) {
            case 'player':
                return this._createPlayerEntity(parameters);
            case 'bomb':
                return this._createBombEntity(parameters);
            case 'enemy':
                return this._createEnemyEntity(parameters);
            default:
                console.log('No factory for entity type:', type);
                return null;
        }
    };

    Creator._createPlayerEntity = function(parameters) {
        var playerEntity = new Entity(parameters.scene);

        playerEntity.type = parameters.type;

        playerEntity.position = {
            x: parameters.position.x || 0,
            y: parameters.position.y || 0
        };



        var physics = new PhysicsComponent();
        playerEntity.setComponent(physics);


        var graphics = new GraphicsComponent();
        var image = new Image();
        image.src = 'image/robot.png';
        graphics.graphic = {
            type: 'sprite',
            spriteData: image
        };
        playerEntity.setComponent(graphics);


        var script = new ScriptComponent();
        script.scripts.push({
            run: function(entity, tpf) {

                var theVel = {
                    x: 0,
                    y: 0
                };




                if(entity.scene.input.keyboard.LEFT || entity.scene.input.keyboard.A) {
                    theVel.x -= 1;
                }

                if(entity.scene.input.keyboard.RIGHT || entity.scene.input.keyboard.D) {
                    theVel.x += 1;
                }

                if(entity.scene.input.keyboard.UP || entity.scene.input.keyboard.W) {
                    theVel.y -= 1;
                }

                if(entity.scene.input.keyboard.DOWN || entity.scene.input.keyboard.S) {
                    theVel.y += 1;
                }

                var magnitudeSquared = theVel.x*theVel.x + theVel.y*theVel.y;

                if(magnitudeSquared > 1) {
                    theVel.x *= 0.707;
                    theVel.y *= 0.707;
                }


                var speed = 0.1 * tpf;
                theVel.x *= speed;
                theVel.y *= speed;

                entity.components.physicsComponent.body.velocity = theVel;


                if(typeof this.CAN_PLACE_BOMB === 'undefined')
                    this.CAN_PLACE_BOMB = true;

                // Place bomb if space bar is pressed
                if(entity.scene.input.keyboard.SPACE) {
                    if(this.CAN_PLACE_BOMB) {
                        console.log('Placed bomb... regenerating bomb.');
                        this.CAN_PLACE_BOMB = false;

                        // Create bomb entity
                        var bomb = Creator.createEntity({
                            type: 'bomb',
                            position: {
                                x: entity.position.x,
                                y: entity.position.y
                            },
                            scene: entity.scene
                        });
                        bomb.addToScene();


                        var that = this;
                        setTimeout(function() {
                            console.log('Bomb regenerated.');
                            that.CAN_PLACE_BOMB = true;
                        }, 2000);
                    }
                }



                entity.broadcastMessage('Pants!');
            }
        });
        playerEntity.setComponent(script);

        return playerEntity;

    };

    Creator._createBombEntity = function(parameters) {
        var entity = new Entity(parameters.scene);

        entity.type = parameters.type;

        entity.position = {
            x: parameters.position.x || 0,
            y: parameters.position.y || 0
        };


        var physics = new PhysicsComponent();
        entity.setComponent(physics);


        var graphics = new GraphicsComponent();
        var image = new Image();
        image.src = 'image/bomb.png';
        graphics.graphic = {
            type: 'sprite',
            spriteData: image
        };
        entity.setComponent(graphics);


        var script = new ScriptComponent();
        script.scripts.push({
            run: function(entity, tpf) {

                if(typeof this.timeLeft === 'undefined') this.timeLeft = 1000;
                this.timeLeft -= tpf;


                if(this.timeLeft <= 0) {

                    for(var i = 0; i < entity.scene.entities.length; i++)
                    {
                        if(Util.intersectRect(entity, entity.scene.entities[i])) {
                            if(entity.scene.entities[i] == entity) continue;
                            entity.scene.entities[i].broadcastMessage('damage');
                        }
                    }

                    entity.destroy();
                }
            }
        });
        entity.setComponent(script);

        return entity;
    };

    Creator._createEnemyEntity = function(parameters) {
        var entity = new Entity(parameters.scene);

        entity.type = parameters.type;

        entity.position = {
            x: parameters.position.x || 0,
            y: parameters.position.y || 0
        };



        var physics = new PhysicsComponent();
        entity.setComponent(physics);


        var graphics = new GraphicsComponent();
        var image = new Image();
        image.src = 'image/enemy.png';
        graphics.graphic = {
            type: 'sprite',
            spriteData: image
        };
        entity.setComponent(graphics);

        entity.playerRef = entity.scene.getEntityByType('player');
        console.log(entity.playerRef);

        var script = new ScriptComponent();
        script.scripts.push({
            run: function(entity, tpf, messages) {

                for(var i = 0; i < messages.length; i++) {
                    console.log(messages[i]);
                }

                var theVel = {
                    x: 0,
                    y: 0
                };

                var angle = Util.angleToPoint(entity.position, entity.playerRef.position);


                var speed = 0.07 * tpf;

                entity.components.physicsComponent.body.velocity.x = Math.cos(angle) * speed;
                entity.components.physicsComponent.body.velocity.y = Math.sin(angle) * speed;
            }
        });
        entity.setComponent(script);

        return entity;
    };

    return Creator;
});