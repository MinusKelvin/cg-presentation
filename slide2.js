var slide2obj = {};

slide2obj.init = function() {
    var canvas = document.getElementById("s2canvas");
    var telement = document.getElementById("time");
    var ldirSlider = document.getElementById("ldir");
    var timescale = document.getElementById("timescale");

    var size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
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
        gl.shaderSource(vs, "attribute vec3 pos;varying vec3 n;uniform mat4 proj;uniform float time;"+
        "vec3 trans(vec3 i){return vec3(i.x,sin(i.x/7.0+i.z/5.0+time)+cos(i.z/10.0+time/3.0)*5.0+sin(i.x/20.0+time/5.0)*10.0,i.z);}"+
        "void main() {n=cross(normalize(trans(pos+vec3(0.0,0.0,0.01))-trans(pos)),normalize(trans(pos+vec3(0.01,0.0,0.0))-trans(pos)));gl_Position=proj*vec4(trans(pos)+n*pos.y,1.0);}");
        gl.compileShader(vs);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(vs));
			return;
		}

		var fs = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fs, "precision mediump float;uniform vec3 c;uniform vec3 l;varying mediump vec3 n;void main() {gl_FragColor=vec4(c*max(dot(normalize(n),l),0.25),1.0);}");
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

        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        var v = [];
        for (var i = 0; i < 100; i++) {
            for (var j = 0; j < 100; j++) {
                v.push(i);
                v.push(0);
                v.push(j);
                v.push(i+1);
                v.push(0);
                v.push(j);
            }
        }
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                v.push(i*10+5 - 0.1);
                v.push(0);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 - 0.1);

                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 + 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);

                v.push(i*10+5 - 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);

                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 + 0.1);
                v.push(3);
                v.push(j*10+5 + 0.1);

                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 + 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 + 0.1);
                v.push(3);
                v.push(j*10+5 + 0.1);

                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 + 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 + 0.1);
                v.push(0);
                v.push(j*10+5 - 0.1);

                v.push(i*10+5 - 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 + 0.1);

                v.push(i*10+5 - 0.1);
                v.push(0);
                v.push(j*10+5 + 0.1);
                v.push(i*10+5 - 0.1);
                v.push(3);
                v.push(j*10+5 - 0.1);
                v.push(i*10+5 - 0.1);
                v.push(0);
                v.push(j*10+5 - 0.1);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        var perspective = [
            1,           0,           0,           0,
            0,           1,           0,           0,
            0,           0,           1.000100005, -0.020001,
            0,           0,           1,           0
        ];
        function mul(l,r,d) {
            d[0] = l[0]*r[0] + l[1]*r[4] + l[2]*r[8] + l[3]*r[12];
            d[4] = l[4]*r[0] + l[5]*r[4] + l[6]*r[8] + l[7]*r[12];
            d[8] = l[8]*r[0] + l[9]*r[4] + l[10]*r[8] + l[11]*r[12];
            d[12] = l[12]*r[0] + l[13]*r[4] + l[14]*r[8] + l[15]*r[12];

            d[1] = l[0]*r[1] + l[1]*r[5] + l[2]*r[9] + l[3]*r[13];
            d[5] = l[4]*r[1] + l[5]*r[5] + l[6]*r[9] + l[7]*r[13];
            d[9] = l[8]*r[1] + l[9]*r[5] + l[10]*r[9] + l[11]*r[13];
            d[13] = l[12]*r[1] + l[13]*r[5] + l[14]*r[9] + l[15]*r[13];

            d[2] = l[0]*r[2] + l[1]*r[6] + l[2]*r[10] + l[3]*r[14];
            d[6] = l[4]*r[2] + l[5]*r[6] + l[6]*r[10] + l[7]*r[14];
            d[10] = l[8]*r[2] + l[9]*r[6] + l[10]*r[10] + l[11]*r[14];
            d[14] = l[12]*r[2] + l[13]*r[6] + l[14]*r[10] + l[15]*r[14];

            d[3] = l[0]*r[3] + l[1]*r[7] + l[2]*r[11] + l[3]*r[15];
            d[7] = l[4]*r[3] + l[5]*r[7] + l[6]*r[11] + l[7]*r[15];
            d[11] = l[8]*r[3] + l[9]*r[7] + l[10]*r[11] + l[11]*r[15];
            d[15] = l[12]*r[3] + l[13]*r[7] + l[14]*r[11] + l[15]*r[15];
        }
        function rotate(ang, x, y, z, dest) {
            var cos = Math.cos(ang);
            var sin = Math.sin(ang);
            var C = 1.0 - cos;
            dest[0] = cos + x * x * C;
            dest[1] = x * y * C - z * sin;
            dest[2] = x * z * C + y * sin;
            dest[3] = 0.0;
            dest[4] = y * x * C + z * sin;
            dest[5] = cos + y * y * C;
            dest[6] = y * z * C - x * sin;
            dest[7] = 0.0;
            dest[8] = z * x * C - y * sin;
            dest[9] = z * y * C + x * sin;
            dest[10] = cos + z * z * C;
            dest[11] = 0.0;
            dest[12] = 0.0;
            dest[13] = 0.0;
            dest[14] = 0.0;
            dest[15] = 1.0;
        }

        var pos = gl.getAttribLocation(program, "pos");
        var color = gl.getUniformLocation(program, "c");
        var light = gl.getUniformLocation(program, "l");
        var time = gl.getUniformLocation(program, "time");
        var t = 0;
        var ldir = Math.PI/4;

        var yaw = -3;
        var pitch = Math.PI/6;
        var dest = new Array(16);
        var dest2 = new Array(16);
        var rot = new Array(16);
        var drawnum = 0;
        var vel = 0;

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearDepth(1);
        gl.clearColor(0.933333333,0.933333333,0.933333333,1);

        var progress = 0;
        timescale.value = 0;

        function render() {
            ldir = ldirSlider.value;

            yaw += vel;
            vel *= 0.9;
            t += timescale.value * 0.016;
            if (t < 0)
                t += 94.247779608;
            if (t > 94.247779608)
                t -= 94.247779608;
            telement.textContent = "Time: " + Number(t).toFixed(2);
            var transform = [
                Math.cos(yaw),  0,  Math.sin(yaw),  Math.sin(yaw)*-50 + Math.cos(yaw)*-50,
                0,  1,  0,  -30,
                -Math.sin(yaw),  0, Math.cos(yaw),  Math.sin(yaw)*50 + Math.cos(yaw)*-50 + 80,
                0,  0,  0,  1
            ];
            rotate(pitch, -1, 0, 0, rot);
            mul(rot, transform, dest2);
            mul(perspective, dest2, dest);
            var transpose = [
                dest[0], dest[4], dest[8], dest[12],
                dest[1], dest[5], dest[9], dest[13],
                dest[2], dest[6], dest[10], dest[14],
                dest[3], dest[7], dest[11], dest[15],
            ];
            var mat = new Float32Array(transpose);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "proj"), false, mat);

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(pos);
            gl.uniform3f(color, 0, 0.8, 0.1);
            gl.uniform3f(light, Math.cos(ldir)*0.707106781, 0.707106781, -Math.sin(ldir)*0.707106781);
            gl.uniform1f(time, t);

            if (drawnum < 200)
                drawnum++;

            for (var i = 0; i < Math.min(100,drawnum); i++)
                gl.drawArrays(gl.TRIANGLE_STRIP, i*200, Math.min(201,Math.max(drawnum-i,1)*2)-1);

            if (progress == 4) {
                gl.lineWidth(3);
                gl.uniform3f(color, 0, 0.5, 1);
                gl.drawArrays(gl.TRIANGLES, 20000, 2400);
            }
        }

		window.addEventListener("resize", function(e) {
			size = Math.floor(window.innerHeight * 0.9);
			canvas.width = size;
			canvas.height = size;
		});

        var dragging = false;
        window.addEventListener("mousemove", function(e) {
            if (dragging) {
                vel -= e.movementX/2000;
            }
        });

        canvas.addEventListener("mousedown", function() {
            dragging = true;
            document.body.style.cursor = "grabbing";
            canvas.style.cursor = "";
        });

        window.addEventListener("mouseup", function() {
            dragging = false;
            document.body.style.cursor = "";
            canvas.style.cursor = "grab";
        });

        var rendering;

        slide2obj.start = function() {
            rendering = setInterval(render, 16);
        }

        slide2obj.next = function() {
            if (progress == 6) {
                clearInterval(rendering);
                return true;
            }
            progress++;
            switch (progress) {
                case 1:
                    document.getElementById("s2t1").className = "leaf-left hidden";
                    document.getElementById("s2t2").className = "leaf-right shown";
                    break;
                case 2:
                    document.getElementById("s2t3").className = "bit shown";
                    timescale.value = 1;
                    timescale.style.display = "";
                    break;
                case 3:
                    document.getElementById("s2t2").className = "leaf-right hidden";
                    document.getElementById("s2t4").className = "leaf-left shown";
                    break;
                case 4:
                    document.getElementById("s2t4").className = "leaf-left hidden";
                    document.getElementById("s2t5").className = "leaf-right shown";
                    break;
                case 5:
                    document.getElementById("s2t6").className = "leaf-left shown";
                    document.getElementById("s2t5").className = "leaf-right hidden";
                    ldirSlider.style.display = "";
                    break;
                case 6:
                    document.getElementById("s2t6").className = "leaf-left hidden";
                    document.getElementById("s2t7").className = "leaf-right shown";
                    break;
            }
            return false;
        }
        slide2obj.prev = function() {
            if (progress == 0) {
                clearInterval(rendering);
                return true;
            }
            progress--;
            switch (progress) {
            case 0:
                document.getElementById("s2t1").className = "leaf-left shown";
                document.getElementById("s2t2").className = "leaf-right hidden";
                break;
            case 1:
                document.getElementById("s2t3").className = "bit hidden";
                timescale.value = 0;
                ldirSlider.style.display = "none";
                break;
            case 2:
                document.getElementById("s2t2").className = "leaf-right shown";
                document.getElementById("s2t4").className = "leaf-left hidden";
                break;
            case 3:
                document.getElementById("s2t4").className = "leaf-left shown";
                document.getElementById("s2t5").className = "leaf-right hidden";
                break;
            case 4:
                document.getElementById("s2t6").className = "leaf-left hidden";
                document.getElementById("s2t5").className = "leaf-right shown";
                ldirSlider.style.display = "none";
                break;
            case 5:
                document.getElementById("s2t6").className = "leaf-left shown";
                document.getElementById("s2t7").className = "leaf-right hidden";
                break;
            }
            return false;
        }
    }
}

slideObjects.push(slide2obj);
