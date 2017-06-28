var http = require('http'),
    url  = require('url'),
    fs   = require('fs'),
    sio  = require('socket.io'),
    chokidar = require('chokidar'),
    auth = require('socketio-auth');
// var server = http.createServer(function (request, response) {
// 	var path = url.parse(request.url).pathname;
// 	switch(path) {
// 		case '/':
// 			response.writeHead(200, {'Content-Type' : 'text/html'});
// 			response.write('Hello World');
// 			response.end();
// 			break;
// 		case '/socket.html':
// 			fs.readFile(__dirname + path, function (error, data) {
// 				if (error) {
// 					response.writeHead(404);
// 					response.write('404, that doesn\'t exist!');
// 					response.end();
// 				} else {
// 					response.writeHead(200, {'Content-Type' : 'text/html'});
// 					response.write(data, "utf8");
// 					response.end();
// 				}
// 			});
// 			break;
// 		default:
// 			response.writeHead(404);
// 			response.write('404, that doesn\'t exist!');
// 			response.end();
// 	}
// });

var server = http.createServer(function(request, response) {
  if(/^\/[a-zA-Z0-9\/]*.html$/.test(request.url.toString())){
    sendFileContent(response, request.url.toString().substring(1), "text/html");
  }
  else if(/^\/[a-zA-Z0-9\/]*.js$/.test(request.url.toString())){
    sendFileContent(response, request.url.toString().substring(1), "text/javascript");
  }
  else if(/^\/[a-zA-Z0-9\/]*.css$/.test(request.url.toString())){
    sendFileContent(response, request.url.toString().substring(1), "text/css");
  }
  else if(request.url === "/"){
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('<b>Hey there!</b><br /><br />This is the default response. Requested URL is: ' + request.url);
  }
  else{
    console.log("Requested URL is: " + request.url);
    response.end();
  }
});

function sendFileContent(response, fileName, contentType){
  fs.readFile(fileName, function(err, data){
    if(err){
      response.writeHead(404);
      response.write("Not Found!");
    }
    else{
      response.writeHead(200, {'Content-Type': contentType});
      response.write(data);
    }
    response.end();
  });
}

server.listen(3000);
var io = sio(server);

var watcher = chokidar.watch(__dirname + "/jsx/", {ignored: /^\./, persistent: true});

// All connections
io.sockets.on('connection', function(socket){
	console.log("Incoming connection...");
	socket.emit('message', {'message' : 'Hello World'});
	socket.on('client-event', function (data) {
		console.log("Getting data from client", data);
	});
});

// Namespaced connections
var nasp = io.of('/com.example.socketio');

// Connection
nasp.on('connection', function (socket) {

  watcher
    .on('add', function(path) {console.log('File', path, 'has been added');})
    .on('change', function(path) {console.log('File', path, 'has been changed'); nasp.to(socket.id).emit('refresh')})
    .on('unlink', function(path) {console.log('File', path, 'has been removed');})
    .on('error', function(error) {console.error('Error happened', error);})

	console.log("Namespaced socket connected!");
	console.log("ID: " + socket.id);

	// socket.emit('message', "Message from nasp, out of authentication")

  socket.on('browserReload', function (){
    nasp.to(socket.id).emit('refresh');
  })

	socket.on('requestScript', function (data) {
		console.log("On requestScript...");
		console.log("Sending to client ID: " + socket.id);
		// Sending only to that client, based on ID
		var payload;
		switch(data) {
			case 'alert':
        console.log("Sending function to InDesign")
				payload = "bt.testingScript()"
				break;
      case 'loadJSX':
        console.log("Loading JSX from Server")
        payload = fs.readFileSync(__dirname + "/jsx/btMain.jsx", "utf8");
        payload += " " + fs.readFileSync(__dirname + "/jsx/testing.jsx", "utf8");
        break;
      case 'load':
        payload = "sayWhatsUp()"
        break;
			default:
				payload = "alert('Error\\nUnknown request')"
		}
		nasp.to(socket.id).emit('evalScript', payload);
	});
})

// Authorization
auth(nasp, {
  authenticate: function (socket, data, callback) {
    //get credentials sent by the client
    var username = data.username;
    var password = data.password;
    if (data.username == "undavide" && data.password == "ocamorta") {
    	console.log("Successfully authenticated!");
    	// send the Socket ID to the client
    	return callback(null, socket.id);
    } else {
    	return callback(new Error("Problems..."));
    }
  }
});
