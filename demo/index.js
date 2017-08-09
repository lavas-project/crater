var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/news', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/test', function(req, res){
  res.sendfile(__dirname + '/public/index.html');
});

app.use('/test/data/files', function (req, res, next) {
    req.method = 'GET';
    next();
});
// serve static resources
app.use(express.static(__dirname + '/public'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
