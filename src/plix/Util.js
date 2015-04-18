define([], function() {
    'use strict';

    function Util() {}

    Util.intersectRect = function(r1, r2) {
        r1.left = r1.position.x - r1.components.physicsComponent.body.size.x/2;
        r1.top = r1.position.y - r1.components.physicsComponent.body.size.y/2;
        r1.right = r1.position.x + r1.components.physicsComponent.body.size.x/2;
        r1.bottom = r1.position.y + r1.components.physicsComponent.body.size.y/2;

        r2.left = r2.position.x - r2.components.physicsComponent.body.size.x/2;
        r2.top = r2.position.y - r2.components.physicsComponent.body.size.y/2;
        r2.right = r2.position.x + r2.components.physicsComponent.body.size.x/2;
        r2.bottom = r2.position.y + r2.components.physicsComponent.body.size.y/2;


        return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    };

    Util.angleToPoint = function(from, to) {
        var distToPoint = {
            x: to.x - from.x,
            y: to.y - from.y
        };

        var angle = Math.atan(distToPoint.y/distToPoint.x);

        return angle + (distToPoint.x < 0 ? Math.PI : 0);
    };

    Util.keyMap = {
        37: 'LEFT',
        65: 'A',
        38: 'UP',
        39: 'RIGHT',
        68: 'D',
        40: 'DOWN',
        32: 'SPACE',
        87: 'W',
        83: 'S',
        75: 'K',
        76: 'L'
    };

    Util.keyForCode = function(keyCode) {
        return Util.keyMap[keyCode];
    };

    return Util;
});