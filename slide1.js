var pixels = document.getElementById("pixel-grid");
var GL_SUPPORTED;

size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
pixels.width = size;
pixels.height = size;

setTimeout(function(event) {
	var gl = pixels.getContext("webgl");
	gl = null;
	if (!gl) {
		GL_SUPPORTED = false;
		pixels.parentNode.appendChild(document.getElementById("webgl-unsupported").cloneNode(true));
		pixels.remove();
	} else {
		GL_SUPPORTED = true;
		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, "attribute vec2 pos;void main() {gl_Position = vec4(pos, 0.0, 1.0);}");
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, "precision mediump float;void main() {gl_FragColor = vec4(1.0);}");
		gl.compileShader(fs);

		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(fs));
			return;
		}

		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			alert("Could not link shaders");
			return;
		}

		gl.useProgram(program);

		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.9,-0.9,0,0.9,0.9,-0.9]), gl.STATIC_DRAW);

		gl.viewport(0,0,pixels.width,pixels.height);
		gl.clearColor(0,0,0,1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		var pos = gl.getAttribLocation(program, "pos");
		gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(pos);
		gl.drawArrays(gl.TRIANGLES,0,3);
	}
},0);
