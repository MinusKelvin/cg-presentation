var slide1obj = {};
slide1obj.slideprogress = 0;

slide1obj.init = (function(event) {
	var pixels = document.getElementById("pixel-grid");
	var coords = document.getElementById("coordinates");

	size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
	pixels.width = size;
	pixels.height = size;

	var gl = pixels.getContext("webgl");
	if (!gl) {
		gl = pixels.getContext("experimental-webgl");
	}
	if (!gl) {
		pixels.parentNode.appendChild(document.getElementById("webgl-unsupported").cloneNode(true));
		pixels.remove();
	} else {
		// Texture shader
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

		// Color shader
		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, "attribute vec2 pos;uniform mat4 proj;uniform vec3 trans;attribute vec4 color;varying vec4 col;void main() {gl_Position = proj*vec4(pos*trans.z+trans.xy, 0.0, 1.0);col=color;}");
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, "precision mediump float;varying vec4 col;void main() {gl_FragColor = col;}");
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

		point1 = {x:4.5,y:19.5,hover:false,drag:false,offx:0,offy:0};
		var point2 = {x:16.5,y:6.5,hover:false,drag:false,offx:0,offy:0};
		var point3 = {x:20.5,y:16.5,hover:false,drag:false,offx:0,offy:0};

		var tri = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, tri);
		var triverts = new Float32Array([point1.x, point1.y, point2.x, point2.y, point3.x, point3.y]);
		gl.bufferData(gl.ARRAY_BUFFER, triverts, gl.STATIC_DRAW);

		var quad = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0,0,
			1,0,
			0,1,
			1,1
		]), gl.STATIC_DRAW);

		var circle = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, circle);
		var circlepoints = [];
		for (var i = 0; i < 15; i++) {
			var a = Math.PI * i/7.5;
			circlepoints.push(Math.cos(a));
			circlepoints.push(Math.sin(a));
		}
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circlepoints), gl.STATIC_DRAW);

		var colors = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colors);
		gl.bufferData(gl.ARRAY_BUFFER, new Int8Array([255,0,0,255,0,255,0,255,0,0,255,255]), gl.STATIC_DRAW);

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

		var colorloc = gl.getAttribLocation(colorProgram, "color");
		var trans = gl.getUniformLocation(colorProgram, "trans");

		var pos = gl.getAttribLocation(colorProgram, "pos");
		var pos2 = gl.getAttribLocation(texProgram, "pos");

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		function render() {
			triverts[0] = point1.x;
			triverts[1] = point1.y;
			triverts[2] = point2.x;
			triverts[3] = point2.y;
			triverts[4] = point3.x;
			triverts[5] = point3.y;
			gl.bindBuffer(gl.ARRAY_BUFFER, tri);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, triverts);

			// Triangle to offscreen FBO
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
			gl.viewport(0,0,25,25);

			gl.clearColor(1,1,1,1);
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.useProgram(colorProgram);
			gl.vertexAttrib4f(colorloc, 1,0,0,1);
			gl.uniform3f(trans, 0, 0, 1);

			gl.bindBuffer(gl.ARRAY_BUFFER, tri);
			gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
			gl.enableVertexAttribArray(pos);

			gl.bindBuffer(gl.ARRAY_BUFFER, colors);
			gl.vertexAttribPointer(colorloc, 4, gl.UNSIGNED_BYTE, true, 0, 0);
			if (slide1obj.slideprogress == 5)
				gl.enableVertexAttribArray(colorloc);

			gl.lineWidth(1);
			if (slide1obj.slideprogress == 1)
				gl.drawArrays(gl.LINES, 0, 2);
			else if (slide1obj.slideprogress > 1)
				gl.drawArrays(gl.TRIANGLES, 0, 3);

			if (slide1obj.slideprogress == 5)
				gl.disableVertexAttribArray(colorloc);

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
			gl.vertexAttrib4f(colorloc, 0,0,0,1);

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
			gl.vertexAttrib4f(colorloc, 0,0,1,0.75);

			if (slide1obj.slideprogress == 1)
				gl.drawArrays(gl.LINES, 0, 2);
			else if (slide1obj.slideprogress > 1)
				gl.drawArrays(gl.LINE_LOOP,0,3);

			// Triangle vertices
			gl.bindBuffer(gl.ARRAY_BUFFER, circle);
			gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
			var innersize = 0.22;
			var middlesize = 0.3;
			var outersize = 0.37;

			if (slide1obj.slideprogress > 0) {
				// Point 1
				if (slide1obj.slideprogress != 3 && slide1obj.slideprogress != 4) {
					gl.uniform3f(trans, point1.x, point1.y, outersize);
					if (point1.hover) gl.vertexAttrib4f(colorloc, 0.25,0.85,0.25,1);
					else gl.vertexAttrib4f(colorloc, 0.25,0.25,1,1);
					gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Outer circle

					gl.uniform3f(trans, point1.x, point1.y, middlesize);
					gl.vertexAttrib4f(colorloc, 1,1,1,1);
					gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Middle circle
				}

				gl.uniform3f(trans, point1.x, point1.y, innersize);
				if (point1.drag) gl.vertexAttrib4f(colorloc, 0.25,0.85,0.25,1);
				else gl.vertexAttrib4f(colorloc, 0.25,0.25,1,1);
				gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Inner circle

				// Point 2
				if (slide1obj.slideprogress != 3 && slide1obj.slideprogress != 4) {
					gl.uniform3f(trans, point2.x, point2.y, outersize);
					if (point2.hover) gl.vertexAttrib4f(colorloc, 0.25,0.85,0.25,1);
					else gl.vertexAttrib4f(colorloc, 0.25,0.25,1,1);
					gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Outer circle

					gl.uniform3f(trans, point2.x, point2.y, middlesize);
					gl.vertexAttrib4f(colorloc, 1,1,1,1);
					gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Middle circle
				}

				gl.uniform3f(trans, point2.x, point2.y, innersize);
				if (point2.drag) gl.vertexAttrib4f(colorloc, 0.25,0.85,0.25,1);
				else gl.vertexAttrib4f(colorloc, 0.25,0.25,1,1);
				gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Inner circle
			}

			// Point 3
			if (slide1obj.slideprogress > 1) {
				if (slide1obj.slideprogress != 3 && slide1obj.slideprogress != 4) {
					gl.uniform3f(trans, point3.x, point3.y, outersize);
					if (point3.hover) gl.vertexAttrib4f(colorloc, 0.25,0.85,0.25,1);
					else gl.vertexAttrib4f(colorloc, 0.25,0.25,1,1);
					gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Outer circle

					gl.uniform3f(trans, point3.x, point3.y, middlesize);
					gl.vertexAttrib4f(colorloc, 1,1,1,1);
					gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Middle circle
				}

				gl.uniform3f(trans, point3.x, point3.y, innersize);
				if (point3.drag) gl.vertexAttrib4f(colorloc, 0.25,0.85,0.25,1);
				else gl.vertexAttrib4f(colorloc, 0.25,0.25,1,1);
				gl.drawArrays(gl.TRIANGLE_FAN, 0,15); // Inner circle
			}
		}

		var point1Spin = {};
		var point2Spin = {};
		var point3Spin = {};
		var cos1deg = Math.cos(1/360*Math.PI);
		var sin1deg = Math.sin(1/360*Math.PI);
		function spin() {
			point1Spin.x -= 12.5;
			point1Spin.y -= 12.5;
			point2Spin.x -= 12.5;
			point2Spin.y -= 12.5;
			point3Spin.x -= 12.5;
			point3Spin.y -= 12.5;

			var tmp = point1Spin.x;
			point1Spin.x = tmp * cos1deg + point1Spin.y * sin1deg;
			point1Spin.y = tmp * -sin1deg + point1Spin.y * cos1deg;

			tmp = point2Spin.x;
			point2Spin.x = tmp * cos1deg + point2Spin.y * sin1deg;
			point2Spin.y = tmp * -sin1deg + point2Spin.y * cos1deg;

			tmp = point3Spin.x;
			point3Spin.x = tmp * cos1deg + point3Spin.y * sin1deg;
			point3Spin.y = tmp * -sin1deg + point3Spin.y * cos1deg;

			point1Spin.x += 12.5;
			point1Spin.y += 12.5;
			point2Spin.x += 12.5;
			point2Spin.y += 12.5;
			point3Spin.x += 12.5;
			point3Spin.y += 12.5;

			point1.x = point1Spin.x;
			point1.y = point1Spin.y;
			point2.x = point2Spin.x;
			point2.y = point2Spin.y;
			point3.x = point3Spin.x;
			point3.y = point3Spin.y;

			if (slide1obj.slideprogress == 3) {
				point1.x = Math.floor(point1.x)+0.5;
				point1.y = Math.floor(point1.y)+0.5;
				point2.x = Math.floor(point2.x)+0.5;
				point2.y = Math.floor(point2.y)+0.5;
				point3.x = Math.floor(point3.x)+0.5;
				point3.y = Math.floor(point3.y)+0.5;
			}
			render();
		}

		pixels.addEventListener("mousemove", function(e) {
			var gridspace = {
				x: e.layerX/(size/25),
				y: (pixels.height-e.layerY)/(size/25)
			};
			if (point1.drag) {
				point1.x = gridspace.x+point1.offx;
				point1.y = gridspace.y+point1.offy;
			}
			if (point2.drag) {
				point2.x = gridspace.x+point2.offx;
				point2.y = gridspace.y+point2.offy;
			}
			if (point3.drag && slide1obj.slideprogress > 1) {
				point3.x = gridspace.x+point3.offx;
				point3.y = gridspace.y+point3.offy;
			}

			if (slide1obj.slideprogress < 3) {
				point1.x = Math.min(Math.max(Math.floor(point1.x)+0.5,0.5),24.5);
				point1.y = Math.min(Math.max(Math.floor(point1.y)+0.5,0.5),24.5);
				point2.x = Math.min(Math.max(Math.floor(point2.x)+0.5,0.5),24.5);
				point2.y = Math.min(Math.max(Math.floor(point2.y)+0.5,0.5),24.5);
				point3.x = Math.min(Math.max(Math.floor(point3.x)+0.5,0.5),24.5);
				point3.y = Math.min(Math.max(Math.floor(point3.y)+0.5,0.5),24.5);
			} else {
				point1.x = Math.min(Math.max(point1.x,0),25);
				point1.y = Math.min(Math.max(point1.y,0),25);
				point2.x = Math.min(Math.max(point2.x,0),25);
				point2.y = Math.min(Math.max(point2.y,0),25);
				point3.x = Math.min(Math.max(point3.x,0),25);
				point3.y = Math.min(Math.max(point3.y,0),25);
			}

			if (slide1obj.slideprogress < 4) {
				coords.textContent = "(x: " + Math.floor(gridspace.x) + ", y: " + Math.floor(gridspace.y) + ")";
			} else {
				coords.textContent = "(x: " + Number(gridspace.x).toFixed(2) + ", y: " + Number(gridspace.y).toFixed(2) + ")";
			}
			coords.style.top = e.layerY + "px";
			coords.style.left = e.layerX + "px";

			point1.hover = false;
			point2.hover = false;
			point3.hover = false;
			if ((gridspace.x-point1.x)*(gridspace.x-point1.x) + (gridspace.y-point1.y)*(gridspace.y-point1.y) < 0.25 && slide1obj.slideprogress > 0 && slide1obj.slideprogress != 3 && slide1obj.slideprogress != 4) {
				point1.hover = true;
				point1.offx = point1.x - gridspace.x;
				point1.offy = point1.y - gridspace.y;
			} else if ((gridspace.x-point2.x)*(gridspace.x-point2.x) + (gridspace.y-point2.y)*(gridspace.y-point2.y) < 0.25 && slide1obj.slideprogress > 0 && slide1obj.slideprogress != 3 && slide1obj.slideprogress != 4) {
				point2.hover = true;
				point2.offx = point2.x - gridspace.x;
				point2.offy = point2.y - gridspace.y;
			} else if ((gridspace.x-point3.x)*(gridspace.x-point3.x) + (gridspace.y-point3.y)*(gridspace.y-point3.y) < 0.25 && slide1obj.slideprogress > 1 && slide1obj.slideprogress != 3 && slide1obj.slideprogress != 4) {
				point3.hover = true;
				point3.offx = point3.x - gridspace.x;
				point3.offy = point3.y - gridspace.y;
			}
			point1.hover = point1.hover || point1.drag;
			point2.hover = point2.hover || point2.drag;
			point3.hover = point3.hover || point3.drag;

			if (point1.hover || point2.hover || point3.hover) pixels.style.cursor = "grab";
			else pixels.style.cursor = "default";
			if (point1.drag || point2.drag || point3.drag) pixels.style.cursor = "grabbing";
			render();
		});

		pixels.addEventListener("mousedown", function(e) {
			point1.drag = point1.hover;
			point2.drag = point2.hover;
			point3.drag = point3.hover;
			if (point1.drag || point2.drag || point3.drag) pixels.style.cursor = "grabbing";
			render();
		});

		pixels.addEventListener("mouseleave", function(){coords.textContent="";});

		window.addEventListener("mouseup", function(e) {
			point1.drag = false;
			point2.drag = false;
			point3.drag = false;
			if (point1.hover || point2.hover || point3.hover) pixels.style.cursor = "grab";
			else pixels.style.cursor = "default";
			render();
		});

		window.addEventListener("resize", function(e) {
			size = Math.floor(window.innerHeight * 0.9);
			pixels.width = size;
			pixels.height = size;
			render();
		});

		render();

		var spinid;
		slide1obj.next = function() {
			if (slide1obj.slideprogress == 5) {
				return true;
			} else {
				slide1obj.slideprogress++;
				switch (slide1obj.slideprogress) {
					case 1:
						document.getElementById("s1t2").className = "leaf-right shown";
						document.getElementById("s1t1").className = "leaf-left hidden";
						break;
					case 2:
						document.getElementById("s1t2").className = "leaf-right hidden";
						document.getElementById("s1t3").className = "leaf-left shown";
						break;
					case 3:
						document.getElementById("s1t4").className = "leaf-right shown";
						document.getElementById("s1t3").className = "leaf-left hidden";
						point1Spin.x = point1.x;
						point1Spin.y = point1.y;
						point2Spin.x = point2.x;
						point2Spin.y = point2.y;
						point3Spin.x = point3.x;
						point3Spin.y = point3.y;
						spinid = setInterval(spin, 16);
						break;
					case 4:
						document.getElementById("s1t5").className = "leaf-left shown";
						document.getElementById("s1t4").className = "leaf-right hidden";
						break;
					case 5:
						document.getElementById("s1t5").className = "leaf-left hidden";
						document.getElementById("s1t6").className = "leaf-right shown";
						clearInterval(spinid);
						break;
				}
				render();
				return false;
			}
		}
		slide1obj.prev = function() {
			if (slide1obj.slideprogress == 0) {
				return true;
			} else {
				slide1obj.slideprogress--;
				switch (slide1obj.slideprogress) {
					case 0:
						document.getElementById("s1t2").className = "leaf-right hidden";
						document.getElementById("s1t1").className = "leaf-left shown";
						break;
					case 1:
						document.getElementById("s1t2").className = "leaf-right shown";
						document.getElementById("s1t3").className = "leaf-left hidden";
						break;
					case 2:
						document.getElementById("s1t4").className = "leaf-right hidden";
						document.getElementById("s1t3").className = "leaf-left shown";
						point1.x = Math.min(Math.max(Math.floor(point1.x)+0.5,0.5),24.5);
						point1.y = Math.min(Math.max(Math.floor(point1.y)+0.5,0.5),24.5);
						point2.x = Math.min(Math.max(Math.floor(point2.x)+0.5,0.5),24.5);
						point2.y = Math.min(Math.max(Math.floor(point2.y)+0.5,0.5),24.5);
						point3.x = Math.min(Math.max(Math.floor(point3.x)+0.5,0.5),24.5);
						point3.y = Math.min(Math.max(Math.floor(point3.y)+0.5,0.5),24.5);
						clearInterval(spinid);
						break;
					case 3:
						document.getElementById("s1t5").className = "leaf-left hidden";
						document.getElementById("s1t4").className = "leaf-right shown";
						break;
					case 4:
						document.getElementById("s1t5").className = "leaf-left shown";
						document.getElementById("s1t6").className = "leaf-right hidden";
						point1Spin.x = point1.x;
						point1Spin.y = point1.y;
						point2Spin.x = point2.x;
						point2Spin.y = point2.y;
						point3Spin.x = point3.x;
						point3Spin.y = point3.y;
						spinid = setInterval(spin, 16);
						break;
				}
				render();
				return false;
			}
		}
	}
});
// setTimeout(function(){document.getElementById("right").click()},0);
slideObjects.push(slide1obj);
