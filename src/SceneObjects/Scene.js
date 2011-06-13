/*
 * Acts as the root level node
 *
 * Params:
 * renderer - a Renderer object
*/

CLAIRVOYANCE.Scene = function Scene(renderer) {
	var self = this,
		node = new CLAIRVOYANCE.Node({renderer: renderer}),
		currentCamera,
		pMatrix = mat4.create(),
		rotationMatrix = mat4.create();
		
	exposeProperties(self, node);
	
	this.pMatrix = function() {
		return pMatrix;
	};

	function draw() {
		var gl = renderer.gl();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.identity(self.mvMatrix());
		
		//TODO: apply the rotation to the camera
		mat4.multiply(self.mvMatrix(), rotationMatrix);
		
		gl.uniformMatrix4fv(renderer.shaderProgram().pMatrixUniform, false, pMatrix);
		
		node.draw();
	}
	
	function tick() {
		requestAnimFrame(tick);
		draw();
	}
	
	function createMeshes(data) {
		var i, mesh;
		for(i = 0;i < data.meshes.length;i++) {
			mesh = new CLAIRVOYANCE.Node(data.meshes[i]);
			currentCamera.addChild(mesh);
		}
	}
	
	function onSceneLoaded(data) {
		// always picking first camera
		currentCamera = new CLAIRVOYANCE.Camera(data.cameras[0], self);
		self.addChild(currentCamera);
		
		createMeshes(data);

		tick();
	}

	this.load = function(filePath){
		var request = new XMLHttpRequest();
		request.open("GET", filePath);
		request.onreadystatechange = function() {
		  if (request.readyState === 4) {
			onSceneLoaded(JSON.parse(request.responseText));
		  }
		};
		request.send();
	};
	
	this.rotate = function(rotationM) {
		mat4.multiply(rotationM, rotationMatrix, rotationMatrix);
	};
	
	(function() {
		mat4.identity(rotationMatrix);
	
		self.onEnter();
	}());
};