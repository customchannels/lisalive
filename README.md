LisaLive
=========

Connect and control StreamIt Lisa devices via LiveCom.


## Installation 

    npm install @customchannels/lisalive


## Usage 

Connect to a device and send a command.

```
var serial = 'xxxxxx';
var token = 'xxxxxx';
var pusherAppToken = 'xxxxxx';

var LisaLive = require('lisalive');

var LL = new LisaLive(serial, token, pusherAppToken);

// turn on debugging
LL.debug();

// send a connect device
LL.connect(function(){

    // send a status command to the device
    LL.sendCommand('status', function(response){
        console.log(response);
    });

});

```

## Tests

Coming Soon!

## Contributing

Send a pull request. 


