var http = require('http');
var sys = require ('sys');
var url = require('url');
var qs = require('querystring');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');

	if(req.method=='POST') {
		var body='';

		req.on('data', function (data) {
			body +=data;
		});

		req.on('end',function(){
			var POST =  qs.parse(body);
			console.log(POST);
		});
	} else if(req.method=='GET') {
		var url_parts = url.parse(req.url,true);
		console.log(url_parts.query);
	}

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');