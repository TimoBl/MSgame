var socket
var ctx1, ctx2


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

  // skip button
  $("#skipButton").click(function(e) {
      socket.emit("next", "next")
  })
})


// next example
function next(obj){
  // variables
  let loaded = 0 
  let width, height
  let data = obj
  let max_lesions = obj.lesions.length

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
    }
  }

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
    $("#lesionCount").text("0/" + max_lesions.toString() + " lesions found")

    // set title
    $("#subjectTitel").text("Subject " + data.subject)
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

        check_lesion(x, y)
    })
  }


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
              lesions.splice(i, 1);

              // update count
              if (lesions.length == 0){
                socket.emit("next", "next")
              }

              $("#lesionCount").text((max_lesions - lesions.length).toString() + "/" + max_lesions.toString() + " lesions found")

              break
          }
      }
    }
  }

  function draw_lesion(lesion){
      for (var j = 0; j < lesion.x.length; j++){
        ctx2.fillStyle = 'red';
        ctx2.fillRect(s * lesion.y[j], s * lesion.x[j], s, s);
      }
  }
}



