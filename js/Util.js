define([], function() {
    function Util() {}

    Util.intersectRect = function(r1, r2) {
        r1.left = r1.position.x - r1.size.x/2;
        r1.top = r1.position.y - r1.size.y/2;
        r1.right = r1.position.x + r1.size.x/2;
        r1.bottom = r1.position.y + r1.size.y/2;

        r2.left = r2.position.x - r2.size.x/2;
        r2.top = r2.position.y - r2.size.y/2;
        r2.right = r2.position.x + r2.size.x/2;
        r2.bottom = r2.position.y + r2.size.y/2;


        return !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top);
    }

    return Util;
});