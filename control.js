var slides = [];
var i = 0;
while (true) {
	i += 1;
	var e = document.getElementById(""+i);
	if (e == null) {
		break;
	}
	slides.push(e);
}
var current = 0;
var shown = true;
function hidebar() {
	document.getElementById("header").className = "hidden";
	document.getElementById("togglebar").className = "";
	shown = false;
}
function showbar() {
	document.getElementById("header").className = "";
	document.getElementById("togglebar").className = "shown";
	shown = true;
}
document.getElementById("startbutton").addEventListener("click", function(event) {
	document.getElementById("right").click();
});
document.getElementById("left").addEventListener("click", function(event) {
	if (current != 0) {
		current -= 1;
		slides[current].className = "slide shown";
		slides[current+1].className = "slide hidden";
		hidebar();
	}
});
document.getElementById("right").addEventListener("click", function(event) {
	if (current < slides.length-1) {
		current += 1;
		slides[current].className = "slide shown";
		slides[current-1].className = "slide done";
		hidebar();
	}
});
document.getElementById("togglebar").addEventListener("click", function(event) {
	if (shown) {
		hidebar();
	} else {
		showbar();
	}
});