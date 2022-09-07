var socket
var ctx1, ctx2

// for the timer
var initial = 30000;
var count = initial;
var counter; 
var initialMillis;

// counts the lesions we found
let history

// start
$(document).ready(function() {
    // get drawing context
    ctx1 = $("#canvas1")[0].getContext("2d")
    ctx2 = $("#canvas2")[0].getContext("2d")

    // create connection
    socket = io()

    // connection
    socket.on('next', function(data) {
        next(data)
    })

    // if examples are finished
    socket.on('end', function(data) {
        endGame()
    })

    // start countdown
    startTimer(initial)
    
    // start history
    history = new Array();
})


// next example
function next(obj){

  // variables
  let loaded = 0 
  let width, height

  // add history
  obj.lesionsFound = 0
  obj.lesionsMax = obj.lesions.length
  history.push(obj)

  // load images
  let img1 = new Image(); img2 = new Image();
  img1.src = "static/assets/" + obj.path1
  img2.src = "static/assets/" + obj.path2

  img1.onload = function(){
    img_width = this.width
    img_height = this.height
    image_loaded()
  }

  img2.onload = function(){
    img_width = this.width
    img_height = this.height
    image_loaded()
  }
  
  // the images are loaded
  function image_loaded(){
    loaded++
    if (loaded == 2){
      set_canvas()
      set_mouse()
      startTimer()
    }
  }

    // skip button
    $("#skipButton").off('click').click(function(e) {
        uncover_lesions(obj)
    }).html("check")


    // border color
    $("#body").css("border-color", "black")


  // display loaded images
  function set_canvas(){
    // the scale is just the largest image we can paint without distortion
    sw = $("#canvas2").parent().width() / img_width
    sh = ($("#canvas2").parent().parent().parent().height() - 200) / img_height
    s = Math.min(sw, sh)

    // set canvas size
    let w = img_width * s, h = img_height * s
    $("#canvas1")[0].width = w
    $("#canvas2")[0].width = w
    $("#canvas1")[0].height = h
    $("#canvas2")[0].height = h

    // and draw image
    ctx1.drawImage(img1, 0, 0, w, h)
    ctx2.drawImage(img2, 0, 0, w, h)

    // set count
    //$("#lesionCount").text("0/" + max_lesions.toString() + " lesions found")

    // set title
    $("#subjectTitel").text("Subject " + obj.subject)
  }


  // mouse press
  function set_mouse(){
    $("#canvas2").click(function(e) {
        let rect = $("#canvas2")[0].getBoundingClientRect()

        var x = parseInt((e.clientX - rect.left) / s)
        var y = parseInt((e.clientY - rect.top) / s)

        //ctx2.beginPath();
        //ctx2.arc(x * s, y * s, 10, 0, 2 * Math.PI);
        //ctx2.stroke();

        check_lesion_circle(x, y)
    })
  }

  // if user pressed on lesion
  function check_lesion_circle(y, x) {
      let lesions = obj["lesions"]

      let s = 1.5

      for (var i = 0; i < lesions.length; i++){
          // lesion
          let lesion = lesions[i]
      
          // distance
          d = Math.sqrt(Math.pow(lesion.cx - x, 2) + Math.pow(lesion.cy - y, 2))

          // check
          if (d <= s * lesion.r) {

              // draw lesion
              draw_lesion(lesion, "#24e024")
              
              // remove lesion
              lesions.splice(i, 1)

              // history
              obj.lesionsFound++
              //history[history.length - 1]

              break
          }
      }
  }


  // shows every lesion
  function uncover_lesions(obj){
      let lesions = obj["lesions"]

      stop() // stop timer

      // draw missing lesions
      for (var i = 0; i < lesions.length; i++){
          draw_lesion(lesions[i], "#de1d1d")
      }

      // lesion count
      if (obj.lesionsFound == obj.lesionsMax){
          // found every lesion
          //$("#subjectTitel").html("You found every lesion!")
          $("#body").css("border-color", "#24e024")
      } else {
          // not every lesion
          //$("#subjectTitel").html(obj.lesionsFound.toString() + " lesions found out of " + obj.lesionsMax.toString())
          $("#body").css("border-color", "#de1d1d")
      }
      

      // next button
      $("#skipButton").off('click').click(function(e) {
          socket.emit("next", "next")
      }).html("next")
  }


  /* the old way of checking a lesion
  function check_lesion(x, y){
      let lesions = obj["lesions"]

      for (var i = 0; i < lesions.length; i++){
          // lesion
          let lesion = lesions[i]

          // coordinates
          for (var j = 0; j < lesion.x.length; j++){

              // check if coordinate
              if ((lesion.y[j] == x) && (lesion.x[j] == y)){ // I inverted x and y in python

                  // draw lesion
                  draw_lesion(lesion)
                  
                  // remove lesion
                  lesions.splice(i, 1)

                  // history
                  history[history.length - 1].lesionsFound++

                  //$("#lesionCount").text((max_lesions - lesions.length).toString() + "/" + max_lesions.toString() + " lesions found")

                  break
              }
          }
      }
  } */


  // diplay the lesons on canvas2
  function draw_lesion(lesion, color){
      for (var j = 0; j < lesion.x.length; j++){
          ctx2.fillStyle = color
          ctx2.strokeStyle = color
          ctx2.lineWidth = 1
          ctx2.fillRect(s * lesion.y[j], s * lesion.x[j], s, s)
          ctx2.strokeRect(s * lesion.y[j], s * lesion.x[j], s, s)
      }
  }
}


// countdown
function timer(){
  var current = Date.now()
  count = count - (current - initialMillis)
  initialMillis = current
  displayCount(count)

  if (count <= 0) {
      endGame()
  }
}


// on top
function displayCount(count) {
    var res = count / 1000;
    document.getElementById("timer").innerHTML = res.toFixed(1);
}


// end game
function endGame(){
    clearInterval(counter)
    document.getElementById("timer").innerHTML = "End";
    
    let text = ""
    let found = 0
    let max = 0
    for (var i = 0; i < history.length; i++){
        text += history[i].subject
        found += history[i].lesionsFound
        max += history[i].lesionsMax
    }

    // set infos
    $("#timer").html(parseInt(100 * found / max).toString() + "%")
    $("#subjectTitel").html(found.toString() + " lesions found out of " + max.toString())

    // remove canvases
    $("#canvas1").remove()
    $("#canvas2").remove()

    // replace next item
    $('#skipButton').off('click').click(function(){
        window.location.href = '/' 
    }).html("New Game")
}

function startTimer(){
    clearInterval(counter)
    initialMillis = Date.now()
    counter = setInterval(timer, 1)
}

function stop(){
    clearInterval(counter)
}  

function reset(){
    clearInterval(counter)
    count = initial
    displayCount(count)
} 




/*
// start click
$('#start').on('click', function () {
  startTimer()
}

$('#stop').on('click', function () {
    clearInterval(counter);
});

$('#reset').on('click', function () {
    clearInterval(counter);
    count = initial;
    displayCount(count);
});

<button id="start" class="btn btn-light">start</button>
<button id="stop" class="btn btn-light">stop</button>
<button id="reset" class="btn btn-light">reset</button>
*/


