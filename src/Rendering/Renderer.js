/*
 * Params:
 *
 * canvas - the HTML canvas element
*/
CLAIRVOYANCE.Renderer = function Renderer(canvas) {
	var gl,
		shaderProgram,
		vertexShaderSource = ["attribute vec3 aVertexPosition;",
						
						    "uniform mat4 uMVMatrix;",
						    "uniform mat4 uPMatrix;",
						
						    "void main(void) {",
						        "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
						    "}"].join('\n'),
		fragmentShaderSource = ["#ifdef GL_ES",
								"precision highp float;",
								"#endif",
							
								"void main(void) {",
									"gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
								"}"].join('\n');
	
	this.gl = function() {
		return gl;
	};
	
	this.shaderProgram = function() {
		return shaderProgram;
	};					   

	function createShader(gl, source, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}
	
	this.createVertexIndexBuffer = function(vertexIndices) {
		var vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
		vertexIndexBuffer.itemSize = 1;
		vertexIndexBuffer.numItems = vertexIndices.length;
		return vertexIndexBuffer;
	};
	
	function initGL() {
		try {
			gl = canvas.getContext("experimental-webgl");
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
		} 
		catch (e) {
			if (!gl) {
				throw CLAIRVOYANCE.Renderer.errors.WebGLNotSupported;
			}
		}
	}

	function initShaders() {
		var vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER),
			fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		gl.useProgram(shaderProgram);

		shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	}

	initGL();
	initShaders();
};

CLAIRVOYANCE.Renderer.errors = {
	WebGLNotSupported : "Error.Renderer.WebGLNotSupported"
};