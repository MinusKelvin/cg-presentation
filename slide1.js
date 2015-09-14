var pixels = document.getElementById("pixel-grid");
var size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
pixels.width = size;
pixels.height = size;
var pixelsCTX = pixels.getContext("2d");
var inc = size/16;
var subpixel = true;

var nub1pos = {x:4,y:4};
var dragging1 = false;
var nub2pos = {x:12,y:6};
var dragging2 = false;
var nub3pos = {x:7,y:13};
var dragging3 = false;

pixels.addEventListener("mousedown", function(event) {
	if (Math.sqrt((event.offsetX/inc-nub1pos.x-0.5) * (event.offsetX/inc-nub1pos.x-0.5) + (event.offsetY/inc-nub1pos.y-0.5) * (event.offsetY/inc-nub1pos.y-0.5)) < 0.3) {
		dragging1 = true;
	}
	else if (Math.sqrt((event.offsetX/inc-nub2pos.x-0.5) * (event.offsetX/inc-nub2pos.x-0.5) + (event.offsetY/inc-nub2pos.y-0.5) * (event.offsetY/inc-nub2pos.y-0.5)) < 0.3) {
		dragging2 = true;
	}
	else if (Math.sqrt((event.offsetX/inc-nub3pos.x-0.5) * (event.offsetX/inc-nub3pos.x-0.5) + (event.offsetY/inc-nub3pos.y-0.5) * (event.offsetY/inc-nub3pos.y-0.5)) < 0.3) {
		dragging3 = true;
	}
	redrawCanvas();
})

pixels.parentNode.addEventListener("mouseup", function(event) {
	dragging1 = false;
	dragging2 = false;
	dragging3 = false;
	redrawCanvas();
})

pixels.addEventListener("mousemove", function(event) {
	var loc = {x:event.offsetX/inc-0.5,y:event.offsetY/inc-0.5};
	if (!subpixel) {
		loc.x += 0.5;
		loc.y += 0.5;
		loc.x = Math.floor(loc.x);
		loc.y = Math.floor(loc.y);
		if (loc.x > 16) {
			loc.x = 15.5;
		}
		if (loc.y > 16) {
			loc.y = 15.5;
		}
	}
	if (dragging1) {
		nub1pos = loc;
		redrawCanvas();
	}
	if (dragging2) {
		nub2pos = loc;
		redrawCanvas();
	}
	if (dragging3) {
		nub3pos = loc;
		redrawCanvas();
	}
});

window.addEventListener("resize", function(event) {
	size = Math.floor(Math.min(window.innerHeight, window.innerWidth) * 0.9);
	pixels.width = size;
	pixels.height = size;
	inc = size/16;
	pixelsCTX = pixels.getContext("2d");
	redrawCanvas();
});

function redrawCanvas() {
	pixelsCTX.fillStyle = "#fff";
	pixelsCTX.fillRect(0,0,size,size);

	pixelsCTX.fillStyle = "#f00";
	var m = (nub2pos.y-nub1pos.y) / (nub2pos.x-nub1pos.x);
	if (Math.abs(m) < 1) {
		if (nub1pos.x < nub2pos.x) {
			var yoff = 0.5 + m * (Math.ceil(nub1pos.x)-nub1pos.x);
			for (var x = Math.ceil(nub1pos.x); x <= nub2pos.x; x++) {
				pixelsCTX.fillRect(Math.round(x)*inc,Math.floor(nub1pos.y+yoff)*inc,inc,inc);
				yoff += m;
			}
		} else {
			var yoff = 0.5 + m * (Math.floor(nub1pos.x)-nub1pos.x);
			for (var x = Math.floor(nub1pos.x); x >= nub2pos.x; x--) {
				pixelsCTX.fillRect(Math.round(x)*inc,Math.floor(nub1pos.y+yoff)*inc,inc,inc);
				yoff -= m;
			}
		}
	} else {
		m = 1 / m;
		if (nub1pos.y < nub2pos.y) {
			var xoff = 0.5 + m * (Math.ceil(nub1pos.y)-nub1pos.y);
			for (var y = Math.ceil(nub1pos.y); y <= nub2pos.y; y++) {
				pixelsCTX.fillRect(Math.floor(nub1pos.x+xoff)*inc,Math.round(y)*inc,inc,inc);
				xoff += m;
			}
		} else {
			var xoff = 0.5 + m * (Math.floor(nub1pos.y)-nub1pos.y);
			for (var y = Math.floor(nub1pos.y); y >= nub2pos.y; y--) {
				pixelsCTX.fillRect(Math.floor(nub1pos.x+xoff)*inc,Math.round(y)*inc,inc,inc);
				xoff -= m;
			}
		}
	}

	m = (nub2pos.y-nub3pos.y) / (nub2pos.x-nub3pos.x);
	if (Math.abs(m) < 1) {
		if (nub3pos.x < nub2pos.x) {
			var yoff = 0.5 + m * (Math.ceil(nub3pos.x)-nub3pos.x);
			for (var x = Math.ceil(nub3pos.x); x <= nub2pos.x; x++) {
				pixelsCTX.fillRect(Math.round(x)*inc,Math.floor(nub3pos.y+yoff)*inc,inc,inc);
				yoff += m;
			}
		} else {
			var yoff = 0.5 + m * (Math.floor(nub3pos.x)-nub3pos.x);
			for (var x = Math.floor(nub3pos.x); x >= nub2pos.x; x--) {
				pixelsCTX.fillRect(Math.round(x)*inc,Math.floor(nub3pos.y+yoff)*inc,inc,inc);
				yoff -= m;
			}
		}
	} else {
		m = 1 / m;
		if (nub3pos.y < nub2pos.y) {
			var xoff = 0.5 + m * (Math.ceil(nub3pos.y)-nub3pos.y);
			for (var y = Math.ceil(nub3pos.y); y <= nub2pos.y; y++) {
				pixelsCTX.fillRect(Math.floor(nub3pos.x+xoff)*inc,Math.round(y)*inc,inc,inc);
				xoff += m;
			}
		} else {
			var xoff = 0.5 + m * (Math.floor(nub3pos.y)-nub3pos.y);
			for (var y = Math.floor(nub3pos.y); y >= nub2pos.y; y--) {
				pixelsCTX.fillRect(Math.floor(nub3pos.x+xoff)*inc,Math.round(y)*inc,inc,inc);
				xoff -= m;
			}
		}
	}

	m = (nub1pos.y-nub3pos.y) / (nub1pos.x-nub3pos.x);
	if (Math.abs(m) < 1) {
		if (nub3pos.x < nub1pos.x) {
			var yoff = 0.5 + m * (Math.ceil(nub3pos.x)-nub3pos.x);
			for (var x = Math.ceil(nub3pos.x); x <= nub1pos.x; x++) {
				pixelsCTX.fillRect(Math.round(x)*inc,Math.floor(nub3pos.y+yoff)*inc,inc,inc);
				yoff += m;
			}
		} else {
			var yoff = 0.5 + m * (Math.floor(nub3pos.x)-nub3pos.x);
			for (var x = Math.floor(nub3pos.x); x >= nub1pos.x; x--) {
				pixelsCTX.fillRect(Math.round(x)*inc,Math.floor(nub3pos.y+yoff)*inc,inc,inc);
				yoff -= m;
			}
		}
	} else {
		m = 1 / m;
		if (nub3pos.y < nub1pos.y) {
			var xoff = 0.5 + m * (Math.ceil(nub3pos.y)-nub3pos.y);
			for (var y = Math.ceil(nub3pos.y); y <= nub1pos.y; y++) {
				pixelsCTX.fillRect(Math.floor(nub3pos.x+xoff)*inc,Math.round(y)*inc,inc,inc);
				xoff += m;
			}
		} else {
			var xoff = 0.5 + m * (Math.floor(nub3pos.y)-nub3pos.y);
			for (var y = Math.floor(nub3pos.y); y >= nub1pos.y; y--) {
				pixelsCTX.fillRect(Math.floor(nub3pos.x+xoff)*inc,Math.round(y)*inc,inc,inc);
				xoff -= m;
			}
		}
	}

	pixelsCTX.strokeStyle = "#000";
	pixelsCTX.lineWidth = 1;
	pixelsCTX.beginPath();
	for (var i = 0; i <= 16; i++) {
		pixelsCTX.moveTo(i*inc,0);
		pixelsCTX.lineTo(i*inc,size);
	}
	for (var i = 0; i <= 16; i++) {
		pixelsCTX.moveTo(0,i*inc);
		pixelsCTX.lineTo(size,i*inc);
	}
	pixelsCTX.stroke();

	nub1pos.x += 0.5;
	nub1pos.y += 0.5;
	nub2pos.x += 0.5;
	nub2pos.y += 0.5;
	nub3pos.x += 0.5;
	nub3pos.y += 0.5;

	if (dragging1) {
		pixelsCTX.strokeStyle = "#0f7";
	} else {
		pixelsCTX.strokeStyle = "#07f";
	}
	pixelsCTX.lineWidth = 4;
	pixelsCTX.beginPath();
	pixelsCTX.arc(nub1pos.x * inc, nub1pos.y * inc, inc/6, 0, Math.PI*2);
	pixelsCTX.stroke();

	if (dragging2) {
		pixelsCTX.strokeStyle = "#0f7";
	} else {
		pixelsCTX.strokeStyle = "#07f";
	}
	pixelsCTX.beginPath();
	pixelsCTX.arc(nub2pos.x * inc, nub2pos.y * inc, inc/6, 0, Math.PI*2);
	pixelsCTX.stroke();

	if (dragging3) {
		pixelsCTX.strokeStyle = "#0f7";
	} else {
		pixelsCTX.strokeStyle = "#07f";
	}
	pixelsCTX.beginPath();
	pixelsCTX.arc(nub3pos.x * inc, nub3pos.y * inc, inc/6, 0, Math.PI*2);
	pixelsCTX.stroke();

	pixelsCTX.strokeStyle = "#07f";
	pixelsCTX.lineWidth = 2;
	pixelsCTX.beginPath();
	pixelsCTX.moveTo(nub1pos.x*inc, nub1pos.y*inc);
	pixelsCTX.lineTo(nub2pos.x*inc, nub2pos.y*inc);
	pixelsCTX.lineTo(nub3pos.x*inc, nub3pos.y*inc);
	pixelsCTX.lineTo(nub1pos.x*inc, nub1pos.y*inc);
	pixelsCTX.stroke();

	nub1pos.x -= 0.5;
	nub1pos.y -= 0.5;
	nub2pos.x -= 0.5;
	nub2pos.y -= 0.5;
	nub3pos.x -= 0.5;
	nub3pos.y -= 0.5;
}
redrawCanvas();
