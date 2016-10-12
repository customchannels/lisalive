LisaLive
=========

Connect and control StreamIt Lisa devices via LiveCom.


## Installation 

    npm install lisalive


## Usage 

Connect to a device and send a command.

```
var serial = 'xxxxxx';
var token = 'xxxxxx';
var pusherAppToken = 'xxxxxx';

import LisaLive from 'lisalive';

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

// disconnect
LL.disconnect(function(){
    console.log('disconnected');
});

// listen to events
LL.on('disconnect', function(msg){
    console.log(msg);
});

LL.on('error', function(msg){
    console.error(msg);
});

```

## Tests

Coming Soon!

## Contributing

Send a pull request. 


