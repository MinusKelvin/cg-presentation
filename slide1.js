var pixels = document.getElementById("pixel-grid");

size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
pixels.width = size;
pixels.height = size;

setTimeout(function(event) {
	var gl = pixels.getContext("webgl");
	if (!gl) {
		pixels.parentNode.addChild(document.createTextNode("Your browser does not support webgl"));
		pixels.remove();
	} else {
		var vsScript = document.getElementById("s1-vs");
		var str = "";
		var l = vsScript.firstChild;
		while (l) {
			if (l.nodeType == 3) {
				str += l.textContent;
			}
			l = l.nextSibling;
		}
		var vs = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vs, str);
		gl.compileShader(vs);

		if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fsScript = document.getElementById("s1-fs");
		str = "";
		l = fsScript.firstChild;
		while (l) {
			if (l.nodeType == 3) {
				str += l.textContent;
			}
			l = l.nextSibling;
		}
		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, str);
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
