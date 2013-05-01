define([
    'Entity'
], function(
    Entity
) {
    function Creator() {

    }

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

        playerEntity.velocity = {
            x: 0,
            y: 0
        };

        playerEntity.draw = function(ctx) {
            if(this.intersect) ctx.fillStyle = 'rgb(255,125,125)';
            else ctx.fillStyle = 'rgb(0,0,0)';
            ctx.fillRect(this.position.x - this.size.x/2, this.position.y - this.size.y/2, this.size.x, this.size.y);
        };

        playerEntity.update = function() {
            var acc = 0.01;
            var topSpeed = 1;


            var theVel = {
                x: 0,
                y: 0
            };

            var speed = 0.5;

            if(this.world.input.keyboard.LEFT) {
                theVel.x -= speed;
            }

            if(this.world.input.keyboard.RIGHT) {
                theVel.x += speed;
            }

            if(this.world.input.keyboard.UP) {
                theVel.y -= speed;
            }

            if(this.world.input.keyboard.DOWN) {
                theVel.y += speed;
            }

            this.velocity = theVel;

            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        };

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