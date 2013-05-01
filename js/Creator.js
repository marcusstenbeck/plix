define([
    'Entity',
    'PhysicsComponent',
    'GraphicsComponent',
    'ScriptComponent'
], function(
    Entity,
    PhysicsComponent,
    GraphicsComponent,
    ScriptComponent
) {

    function Creator() {}

    Creator.createEntity = function(parameters) {
        var type = parameters.type || null;

        switch(type) {
            case 'player':
                return this._createPlayerEntity(parameters);
            case 'obstacle':
                return this._createObstacleEntity(parameters);
            default:
                return null;
        }
    };

    Creator._createPlayerEntity = function(parameters) {
        var playerEntity = new Entity(parameters.world);

        playerEntity.type = parameters.type;

        playerEntity.size = {
            x: parameters.size.x || 1,
            y: parameters.size.y || 1
        };

        playerEntity.position = {
            x: parameters.position.x || 0,
            y: parameters.position.y || 0
        };



        var physics = new PhysicsComponent();
        playerEntity.setComponent(physics);


        var graphics = new GraphicsComponent();
        playerEntity.setComponent(graphics);


        var script = new ScriptComponent();
        script.scripts.push({
            run: function(entity) {

                var theVel = {
                    x: 0,
                    y: 0
                };

                var speed = 0.5;


                if(entity.world.input.keyboard.LEFT) {
                    theVel.x -= speed;
                }

                if(entity.world.input.keyboard.RIGHT) {
                    theVel.x += speed;
                }

                if(entity.world.input.keyboard.UP) {
                    theVel.y -= speed;
                }

                if(entity.world.input.keyboard.DOWN) {
                    theVel.y += speed;
                }

                entity.components.physicsComponent.body.velocity = theVel;

            }
        });
        playerEntity.setComponent(script);

        return playerEntity;

    };

    Creator._createObstacleEntity = function(parameters) {
        var obstacleEntity = new Entity(parameters.world);

        obstacleEntity.type = parameters.type;

        obstacleEntity.size = {
            x: parameters.size.x || 1,
            y: parameters.size.y || 1
        };

        obstacleEntity.position = {
            x: parameters.position.x || 0,
            y: parameters.position.y || 0
        };

        obstacleEntity.draw = function(ctx) {
            if(this.state == 'dead')
                ctx.fillStyle = 'rgb(255, 127, 127)';
            else
                ctx.fillStyle = 'rgb(0, 0, 0)';

            ctx.fillRect(this.position.x - this.size.x/2, this.position.y - this.size.y/2, this.size.x, this.size.y);
        };

        obstacleEntity.update = function() {
            if(this.intersect.length && this.intersect.length > 0) {
                for(var i = 0; i < this.intersect.length; i++) {
                    if(this.intersect[i].type == 'player') {
                        this.state = 'dead';
                    }
                }
            }

        };

        return obstacleEntity;
    };

    return Creator;
});