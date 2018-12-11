//- Grace Guo
//- May 8 2018

var timeOut = {"html interface tutorial": [0, 6500, 5000, 2300, 5000,
                6300, 6800, 5800, 3000, 4000, 5200, 5900, 800,
                2000, 3300, 2400],
                "example tracing tutorial": [0, 4500, 5000, 5000, 3500,
                4300, 5500, 1000, 1500, 1500, 6000, 4500, 8000,
                2500, 8000, 2000, 7740]}

function play(n) {
  var x = (document.getElementsByClassName("focus"))[0];
  var elementID = x.id;
  var indexEnd = elementID.search("-");
  var index = elementID.slice(0, indexEnd);
  var index = parseInt(index);
  if (index == 0) {
    var b = document.getElementById("blackout");
    b.style.opacity = "0.0";
    var bt = document.getElementById("introButton");
    bt.style.display = "none";
    var newbt = document.getElementById("tuteButton");
    newbt.style.display = "grid";
    var newFocus = "1-a";
    var y = document.getElementById(newFocus);
    x.classList.remove("focus");
    y.classList.add("focus");
    x.style.display = "none";
    y.style.display = "block";
    var textFocus = String(index) + "-text";
    var newTextFocus = String(index+1) + "-text";
    var t = document.getElementById(textFocus);
    var newT = document.getElementById(newTextFocus);
    t.style.display = "none";
    newT.style.display = "block";
    t.classList.remove("textFocus");
    newT.classList.add("textFocus");
    var menuID = String(index) + "-menu";
    var newMenuID = String(index+1) + "-menu";
    var m = document.getElementById(menuID);
    var newM = document.getElementById(newMenuID);
    m.style.color = "black";
    newM.style.color = "#0056ad";
    m.classList.remove("menuFocus");
    newM.classList.add("menuFocus");
    var playButton = document.getElementById("play");
    playButton.src="images/play.png";
  } else if (elementID.includes("a")) {
    var newFocus = String(index) + "-gif";
    var y = document.getElementById(newFocus);
    x.classList.remove("focus");
    y.classList.add("focus");
    x.style.display = "none";
    y.src = n + "/" + String(index) + ".gif";
    y.style.display = "block";
    var playButton = document.getElementById("play");
    playButton.src="images/playSuspended.png";
    setTimeout(function () {
      playButton.src="images/replay.png";
      y.src = n + "/" + String(index) + "-b.jpg";
    }, (timeOut[n])[index]);
  } else {
    var newFocus = String(index) + "-gif";
    var y = document.getElementById(newFocus);
    y.src = n + "/" + String(index) + ".gif";
    var playButton = document.getElementById("play");
    playButton.src="images/playSuspended.png";
    setTimeout(function () {
      playButton.src="images/replay.png";
    }, (timeOut[n])[index]);
  }
}

function next(n) {
  var x = (document.getElementsByClassName("focus"))[0];
  var elementID = x.id;
  var indexEnd = elementID.search("-");
  var index = elementID.slice(0, indexEnd);
  var index = parseInt(index);
  var l = (timeOut[n].length)-1;
  if (index < l && index > 0) {
    var newFocus = String(index+1) + "-a";
    var textFocus = String(index) + "-text";
    var newTextFocus = String(index+1) + "-text";
    var y = document.getElementById(newFocus);
    var t = document.getElementById(textFocus);
    var newT = document.getElementById(newTextFocus);
    x.classList.remove("focus");
    y.classList.add("focus");
    t.classList.remove("textFocus");
    newT.classList.add("textFocus");
    x.style.display = "none";
    y.style.display = "block";
    t.style.display = "none";
    newT.style.display = "block";
    var menuID = String(index) + "-menu";
    var newMenuID = String(index+1) + "-menu";
    var m = document.getElementById(menuID);
    var newM = document.getElementById(newMenuID);
    m.style.color = "black";
    newM.style.color = "#0056ad";
    m.classList.remove("menuFocus");
    newM.classList.add("menuFocus");
    var playButton = document.getElementById("play");
    playButton.src="images/play.png";
  }
}

function back() {
  var x = (document.getElementsByClassName("focus"))[0];
  var elementID = x.id;
  var indexEnd = elementID.search("-");
  var index = elementID.slice(0, indexEnd);
  var index = parseInt(index);
  if (index > 0) {
    var newFocus = String(index-1) + "-a";
    var textFocus = String(index) + "-text";
    var newTextFocus = String(index-1) + "-text"
    var y = document.getElementById(newFocus);
    var t = document.getElementById(textFocus);
    var newT = document.getElementById(newTextFocus)
    x.classList.remove("focus");
    y.classList.add("focus");
    t.classList.remove("textFocus");
    newT.classList.add("textFocus");
    x.style.display = "none";
    y.style.display = "block";
    t.style.display = "none";
    newT.style.display = "block";
    var menuID = String(index) + "-menu";
    var newMenuID = String(index-1) + "-menu";
    var m = document.getElementById(menuID);
    var newM = document.getElementById(newMenuID);
    m.style.color = "black";
    newM.style.color = "#0056ad";
    m.classList.remove("menuFocus");
    newM.classList.add("menuFocus");
    if (index == 1) {
      var b = document.getElementById("blackout");
      b.style.opacity = "1.0";
      var newbt = document.getElementById("introButton");
      newbt.style.display = "grid";
      var bt = document.getElementById("tuteButton");
      bt.style.display = "none";
    }
  }
}

// function menu() {
//   var x = document.getElementById("menu");
//   var y = document.getElementById("menuButton");
//   var z = document.getElementById("blackout");
//   if (x.classList.contains("visible")) {
//     x.classList.remove("visible");
//     x.style.width = "0px";
//     y.style.right = "50px";
//     y.style.transform = "translate(0, 0)"
//     z.style.width = "0vw";
//     z.style.left = "100%";
//     z.style.opacity = "0.0";
//   } else {
//     x.classList.add("visible");
//     x.style.width = "250px";
//     y.style.right = "250px";
//     y.style.transform = "translate(50%, 0)"
//     z.style.width = "100vw";
//     z.style.left = "0%";
//     z.style.opacity = "1.0";
//   }
// }

function menuJump(x) {
  var m = (document.getElementsByClassName("menuFocus"))[0];
  var oldGif = (document.getElementsByClassName("focus"))[0];
  var oldText = (document.getElementsByClassName("textFocus"))[0];

  var newElementID = x.id;
  var newIndexEnd = newElementID.search("-");
  var newIndex = newElementID.slice(0, newIndexEnd);
  var newM = x;
  m.style.color = "black";
  newM.style.color = "#0056ad";
  m.classList.remove("menuFocus");
  newM.classList.add("menuFocus");

  var newInterface = document.getElementById((String(newIndex)) + "-a");
  newInterface.classList.add("focus");
  newInterface.style.display = "block";
  oldGif.classList.remove("focus");
  oldGif.style.display = "none";

  var newText = document.getElementById((String(newIndex)) + "-text");
  newText.classList.add("textFocus");
  newText.style.display = "block";
  oldText.classList.remove("textFocus");
  oldText.style.display = "none";

  var playButton = document.getElementById("play");
  playButton.src = "images/play.png";
}

function collapse() {
  var x = document.getElementById("menu");
  x.style.width = "80px";
  var y = document.getElementsByClassName("menuText");
  for (var i = 0; i < y.length; i++) {
    var z = y[i];
    z.style.display = "none";
  }
}
