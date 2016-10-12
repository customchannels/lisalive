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

// connect to the device
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

## Available Commands

Command | Description 
--- | ---
`isp` | retrieve ip and provider information
`status` | get the player status 
`volume` | get the current volume
`volume [0-31]` | set the volume between 0-31
`ps [1-32]` | play station 1-32
`pw [0|1]` | power on or off player
`ud` | update the configuration
`channel` | get channels programmed
`curchan` | get the current channel
`restart` | restart the player

## Tests

Coming Soon!

## Contributing

Send a pull request.


