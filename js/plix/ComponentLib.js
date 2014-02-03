define([
	'plix/FsmComponent',
	'plix/GraphicsComponent',
	'plix/PhysicsComponent'
], function(
	FsmComponent,
	GraphicsComponent,
	PhysicsComponent
) {
	
	return {
		fsm: FsmComponent,
		graphics: GraphicsComponent,
		physics: PhysicsComponent
	};
});