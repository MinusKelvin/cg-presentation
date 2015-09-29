var pixels = document.getElementById("pixel-grid");

size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
pixels.width = size;
pixels.height = size;

setTimeout(function(event) {
	var gl = pixels.getContext("webgl");
	if (!gl) {
		gl = pixels.getContext("experimental-webgl");
	}
	if (!gl) {
		pixels.parentNode.appendChild(document.getElementById("webgl-unsupported").cloneNode(true));
		pixels.remove();
	} else {
		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, "attribute vec2 pos;varying vec2 tex;void main() {gl_Position = vec4(pos*2.0-1.0, 0.0, 1.0);tex=pos;}");
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, "precision mediump float;uniform sampler2D textur;varying lowp vec2 tex;void main() {gl_FragColor = texture2D(textur, tex);}");
		gl.compileShader(fs);

		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(fs));
			return;
		}

		var texProgram = gl.createProgram();
		gl.attachShader(texProgram, vs);
		gl.attachShader(texProgram, fs);
		gl.linkProgram(texProgram);

		if (!gl.getProgramParameter(texProgram, gl.LINK_STATUS)) {
			alert("Could not link shaders");
			return;
		}

		gl.useProgram(texProgram);

		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, "attribute vec2 pos;uniform mat4 proj;void main() {gl_Position = proj*vec4(pos, 0.0, 1.0);}");
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, "precision mediump float;uniform vec4 color;void main() {gl_FragColor = color;}");
		gl.compileShader(fs);

		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(fs));
			return;
		}

		var colorProgram = gl.createProgram();
		gl.attachShader(colorProgram, vs);
		gl.attachShader(colorProgram, fs);
		gl.linkProgram(colorProgram);

		if (!gl.getProgramParameter(colorProgram, gl.LINK_STATUS)) {
			alert("Could not link shaders");
			return;
		}

		gl.useProgram(colorProgram);

		var grid = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, grid);
		var ary = [];
		for (var i = 0; i <= 25; i++) {
			ary.push(0);
			ary.push(i);
			ary.push(25);
			ary.push(i);
			ary.push(i);
			ary.push(0);
			ary.push(i);
			ary.push(25);
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ary), gl.STATIC_DRAW);

		var point1 = {x:4.5,y:19.5};
		var point2 = {x:16.5,y:6.5};
		var point3 = {x:20.5,y:16.5};

		var tri = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, tri);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			point1.x, point1.y, point2.x, point2.y, point3.x, point3.y,
		]), gl.STATIC_DRAW);

		var quad = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0,0,
			1,0,
			0,1,
			1,1
		]), gl.STATIC_DRAW);

		var matrix = new Float32Array([
			2/25,  0,     0,     0,
			0,     2/25,  0,     0,
			0,     0,     1,     0,
			-1,    -1,    0,     1,
		]);

		var textarget = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, textarget);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 25, 25, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		var fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textarget, 0);

		gl.uniformMatrix4fv(gl.getUniformLocation(colorProgram, "proj"), false, matrix);

		var colorloc = gl.getUniformLocation(colorProgram, "color");

		var pos = gl.getAttribLocation(colorProgram, "pos");
		var pos2 = gl.getAttribLocation(texProgram, "pos");

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		function render() {
			// Triangle to offscreen FBO
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
			gl.viewport(0,0,25,25);

			gl.clearColor(1,1,1,1);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(colorProgram);
			gl.uniform4f(colorloc, 1,0,0,1);

			gl.bindBuffer(gl.ARRAY_BUFFER, tri);
			gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
			gl.enableVertexAttribArray(pos);

			gl.drawArrays(gl.TRIANGLES, 0, 3);

			// Init for normal screen
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0,0,pixels.width,pixels.height);

			// Triangle onto screen
			gl.useProgram(texProgram);
			gl.bindTexture(gl.TEXTURE_2D, textarget);

			gl.bindBuffer(gl.ARRAY_BUFFER, quad);
			gl.vertexAttribPointer(pos2,2,gl.FLOAT,false,0,0);
			gl.disableVertexAttribArray(pos);
			gl.enableVertexAttribArray(pos2);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			// Gridlines
			gl.useProgram(colorProgram);
			gl.uniform4f(colorloc, 0,0,0,1);

			gl.bindBuffer(gl.ARRAY_BUFFER, grid);
			gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
			gl.disableVertexAttribArray(pos2);
			gl.enableVertexAttribArray(pos);

			gl.lineWidth(size/500);

			gl.drawArrays(gl.LINES,0,ary.length/2);

			// Triangle edges
			gl.bindBuffer(gl.ARRAY_BUFFER, tri);
			gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

			gl.lineWidth(size/100);
			gl.uniform4f(colorloc, 0,0,1,0.75);

			gl.drawArrays(gl.LINE_LOOP,0,3);
		}

		window.addEventListener("resize", function(e) {
			size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
			pixels.width = size;
			pixels.height = size;
			render();
		});

		setInterval(render, 16);
	}
},0);
setTimeout(function(){document.getElementById("right").click()},0);
