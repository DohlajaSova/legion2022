var connect = require('connect');
var serveStatic = require('serve-static');

var path = require('path');
var fs = require('fs');

var localDirPath = process.argv[2] || '';
var workPath = path.join(__dirname, localDirPath+"/build/");

fs.access(workPath, fs.F_OK, function(err) {
	if (!err) {
		
		connect().use(serveStatic(workPath, {'index': false})).listen(8080, function(){
			console.log('Server running on 8080...');
		});
		
	} else {
		// It isn't accessible
		console.log("Error: Path not found");
	}
});