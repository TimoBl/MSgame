// <- Modules ->
const express = require("express")
const app = express();
const fs = require('fs');
const path = require('path');
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);
var port = process.env.PORT || 8080;

console.log("starting")

// <- global variables ->
let metadata;

// <- App -> 

// public files 
app.use('/static', express.static(path.join(__dirname, 'public')))

/*
//the home file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});
*/

//create a new game
app.get('/', (req, res) => {
    //send game file
    res.sendFile(__dirname + '/game.html');
});

// read metadata file 
fs.readFile('metadata.json', (err, file) => {
    if (err) throw err;
    metadata = JSON.parse(file);
});


// <- Connection ->
io.on('connection', function(socket) {
    var data = metadata.slice();

    next_example(socket, data)

    socket.on('next', info => {
        next_example(socket, data)
    });
});


function next_example(socket, data){
  // get random example
  var index = Math.floor(Math.random() * data.length)
  socket.emit('next', data[index])

  // and remove it
  data.splice(index, 1)

  // check if 0 
  if (data.length == 0){
    socket.emit("end")
  }
}


// local serve
// http://192.168.1.131:8080
// httpServer.listen(port, "192.168.1.131", function(){


//start server 
httpServer.listen(port, function(){
  console.log('listening on: ' + port);
});
