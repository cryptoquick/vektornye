// Bulk of this document is based on code from here: http://code.google.com/appengine/articles/rpc.html


//
// Makes an AJAX request to a local server function w/ optional arguments
//
// functionName: the name of the server's AJAX function to call
// opt_argv: an Array of arguments for the AJAX function
//
function Request(function_name, opt_argv) {

	if (!opt_argv)
	opt_argv = new Array();
 
  // Find if the last arg is a callback function; save it
	var callback = null;
	var len = opt_argv.length;
	if (len > 0 && typeof opt_argv[len-1] == 'function') {
		callback = opt_argv[len-1];
		opt_argv.length--;
	}
	var async = (callback != null);
	
	// Build an Array of parameters, w/ function_name being the first parameter
	var params = new Array(function_name);
	for (var i = 0; i < opt_argv.length; i++) {
		params.push(opt_argv[i]);
	}
	var body = JSON.stringify(params);
	
	// Create an XMLHttpRequest 'POST' request w/ an optional callback handler 
	var req = new XMLHttpRequest();
	req.open('POST', '/rpc', async);
	 
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	if (async) {
		req.onreadystatechange = function() {
			if(req.readyState == 4 && req.status == 200) {
				var response = null;
				try {
					response = JSON.parse(req.responseText);
				} catch (e) {
					response = req.responseText;
				}
				callback(response);
			}
		}
	}
	// Make the actual request
	req.send(body);
	}

// Adds a stub function that will pass the arguments to the AJAX call 
function InstallFunction(obj, functionName) {
	obj[functionName] = function() { Request(functionName, arguments); }
}

// Server object that will contain the callable methods
var server = {};

// Insert 'Save' as the name of a callable method
InstallFunction(server, 'Save');

/* Handy "macro"
function $(id){
  return document.getElementById(id);
}*/

// Client function that calls a server rpc and provides a callback
function doSave() {
	server.Save('CryptoQuick', 'BlaObject', Field, 1.1, Field.length, onAddSuccess);
}

// Callback for after a successful doAdd
function onAddSuccess(response) {
	loggit(response);
}