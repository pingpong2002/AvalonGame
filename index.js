var bodyParser = require('body-parser');
var usermodel = require('./user.js').getModel();
var mongoose = require('mongoose');
var crypto = require('crypto');
/* The express module is used to look at the address of the request and send it to the correct function */
var express = require('express');

/* The http module is used to listen for requests from a web browser */
var http = require('http');

/* The path module is used to transform relative paths to absolute paths */
var path = require('path');

/* Creates an express application */
var app = express();

/* Creates the web server */
var server = http.createServer(app);

/* Defines what port to use to listen to web requests */
var port = process.env.PORT
  			? parseInt(process.env.PORT)
  			: 8080;
var dbAddress = process.env.MONGODB_URI || 'mongodb://127.0.0.1/avalon';
var Io = require('socket.io');
var io = Io(server);
function addSockets() {
	io.on('connection', (socket) => {
		console.log('user connected')

    socket.on('disconnect', () => {
		console.log('user disconnected');
	 })
	})

}
function startServer(){
  addSockets();
  app.use(bodyParser.json({ limit: '16mb' }));
  app.use(express.static(path.join(__dirname, 'public')));
  /* Defines what function to call when a request comes from the path '/' in http://localhost:8080 */
  app.get('/form', (req, res, next) => {

  	/* Get the absolute path of the html file */
  	var filePath = path.join(__dirname, './index.html')

  	/* Sends the html file back to the browser */
  	res.sendFile(filePath);
  });
  app.get('/login', (req, res, next) => {

  	/* Get the absolute path of the html file */
  	var filePath = path.join(__dirname, './login.html')

  	/* Sends the html file back to the browser */
  	res.sendFile(filePath);
  });
  app.get('/game', (req, res, next) => {

  	/* Get the absolute path of the html file */
  	var filePath = path.join(__dirname, './game.html')

  	/* Sends the html file back to the browser */
  	res.sendFile(filePath);
  });

  app.post('/form', (req, res, next) => {
    var newuser = new usermodel(req.body);

    //Adding a random string to salt the password width
    var salt = crypto.randomBytes(128).toString('base64');
    newuser.salt = salt;
    // Winding up the crypto hashing lock 10000 times
  	var iterations = 10000;
  	crypto.pbkdf2(password, salt, iterations, 256, 'sha256', function(err, hash) {
  		if(err) {
  			return res.send({error: err});
  		}
  		newuser.password = hash.toString('base64');
  		// Saving the user object to the database
  		newuser.save(function(err) {

  			// Handling the duplicate key errors from database
  			if(err && err.message.includes('duplicate key error') && err.message.includes('userName')) {
  				return res.send({error: 'Username, ' + req.body.userName + 'already taken'});
  			}
  			if(err) {
  				return res.send({error: err.message});
  			}
  			res.send({error: null});
  		});
  	});

  })
  app.post('/login', (req, res, next) => {
    var username = req.body.userName;
    var password = req.body.password;
    res.send('OK');

  });

  app.get('/', (req, res, next) => {
  	res.send('<a href="/form">Sign Up</a><br><a href="/login">Login</a>');
  });



  /* Defines what function to all when the server recieves any request from http://localhost:8080 */
  server.on('listening', () => {

  	/* Determining what the server is listening for */
  	var addr = server.address()
  		, bind = typeof addr === 'string'
  			? 'pipe ' + addr
  			: 'port ' + addr.port
  	;

  	/* Outputs to the console that the webserver is ready to start listenting to requests */
  	console.log('Listening on ' + bind);
  });

  /* Tells the server to start listening to requests from defined port */
  server.listen(port);
}

mongoose.connect(dbAddress, startServer)
