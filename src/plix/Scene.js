requirejs.config({
    //By default load any module IDs from ../../src
//    baseUrl: '../../src',
    //except, if the module ID starts with "app",
    //load it from the ./examples directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: '../../lib'
    }
});
define([
], function(
) {
	'use strict';

	function Scene() {
		this.entities = [];

		this.app = undefined;
	}

	Scene.prototype.getEntityByType = function(type) {
		for(var i = 0; i < this.entities.length; i++) {
			if(this.entities[i].type == type) return this.entities[i];
		}

		return;
	};

	Scene.prototype.attachEntity = function(ent) {
		this.entities.push(ent);
		ent.scene = this;
		return this;
	};

	Scene.prototype.update = function(tpf) {
		if(this._physicsWorld) this._physicsWorld.update(tpf);
			
		this.entities.forEach(function(entity) {
			if(typeof entity.script === 'function') entity.script(entity);
			if(entity.components.physics) {
				entity.transform.position.x = entity.components.physics.body.pos.x;
				entity.transform.position.y = entity.components.physics.body.pos.y;
			}
		});
	};

	Scene.prototype.broadcastMessage = function(message) {
        this.entities.forEach(function(ent) {
        	ent.broadcastMessage(message);
        });
    };

    return Scene;
});