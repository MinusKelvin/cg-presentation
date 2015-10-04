var slide2obj = {};

slide2obj.init = function() {
    var canvas = document.getElementById("s2canvas");

    size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
	canvas.width = size;
	canvas.height = size;

    var gl = canvas.getContext("webgl");
    if (!gl)
        gl = canvas.getContext("experimental-webgl");
    if (!gl) {
        canvas.parentNode.appendChild(document.getElementById("webgl-unsupported").cloneNode(true));
        canvas.remove();
    } else {
        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, "attribute vec3 pos;attribute vec3 norm;varying vec3 n;varying vec3 p;uniform mat4 proj;void main(){gl_Position=proj*vec4(pos,1.0);n=norm;p=pos;}");
        gl.compileShader(vs);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, "precision mediump float;uniform vec3 c;uniform vec3 l;varying mediump vec3 n;varying mediump vec3 p;void main()" +
        "{float d=length(l-p)/100.0+1.0;d=max((1.0/(d*d)-0.05)/(0.95),0.0);gl_FragColor=vec4(c*max(dot(n,normalize(l-p)),0.0)*d,1.0);}");
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
    }

    slide2obj.next = function() {return true;}
    slide2obj.prev = function() {return true;}
}

slideObjects.push(slide2obj);
