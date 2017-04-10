var Pusher = require('pusher-js');

class LisaLive {

    constructor(serial, token, pusherAppKey){
        this.serial = serial.toLowerCase();
        this.token = token;
        this.pusherAppKey = pusherAppKey;
        this.debugOn = false;
        this.topics = {};
        this.connected = false;
        this.Pusher = null;
        this.channel = null;
        this.channelName = null;
        this.timer = null;
        this.unsubscribeTimeout = 80;
        this.commandReady = true;
        this.commandQueue = [];
    }

    connect(callback){

        if(this.connected){
            this._log('Player already connected');
            return;
        }

        this._log('connecting to device: ' + this.serial);

        this.Pusher = new Pusher(this.pusherAppKey, {
            authEndpoint: 'https://service.streamit.eu/livecom',
            authTransport: 'jsonp',
            disableStats: true,
            auth: {
                params: {
                    deviceToken: this.token
                }
            }
        });

        var self = this;

        this.Push.connection.bind('error', function(err){
            self._log(err);
        });


        this.Pusher.connection.bind('connected', function(response){
            self._log('Connected to Pusher');
            self.subscribe(callback);
        });
    }

    subscribe(callback){

        var self = this;

        self.channelName = 'presence-device-' + self.serial;

        self._log('Connecting to channel room: '+ self.channelName);

        self.channel = self.Pusher.subscribe(self.channelName);

        self.channel.bind('pusher:subscription_error', function(status){
            console._log(status);
        });

        self.channel.bind('pusher:subscription_succeeded', function(members){

            if(self._devicePresent(members)){

                // // turn on the disconnect timer
                self._unsubscribeTimer();

                self._log('connected to device');
                self.connected = true;
                self.binds();

                // handle connection callback
                callback();
            }else{
                self.publish('error', 'Can\'t connect to device.');
            }
        });
    }

    // handle the bindings of the connections
    binds() {

        var self = this;

        this.channel.bind('pusher:member_added', function(member){
            self._log('Member Added');
            self.connected = true;
        });

        this.channel.bind('pusher:member_removed', function(member){
            self._log('member removed');
            self.connected = false;
        });
    }

    sendCommand(command, callback){

        if(!this.connected){
            this._log('Device is not connected. Please connect first.');
            return false;
        }

        this._log('Adding Command to Queue: ' + command);

        // add the command to the queue
        this.commandQueue.push({
            command: command,
            callback: callback
        });

        // process the commands
        this.processCommands();
    }

    processCommands(){

        // go through the command queue
        while(this.commandQueue.length){

            this._timerReset();

            // are we ready to process the command
            if(!this.commandReady){
                this._log('Waiting for command to be ready');
                return;
            }

            // set the command ready to false to prevent other commands
            this.commandReady = false;

            //remove the command from the queue
            var command = this.commandQueue.shift();

            this._log('Sending Command: ' + command.command);

            // set the correlation id
            command['correlationId'] = Date.now();

            // send the command
            this.channel.trigger('client-new-command', {
                "command": "" + command.command + "",
                "correlationId": "" + command.correlationId + ""
            });

            var self = this;

            // wait for the response
            this.channel.bind('client-new-response', function(response){

                if(response.status !== 'ok'){
                    self.publish('error', 'Error sending command.');
                    self._log('Error sending command');
                    return;
                }

                if(command.correlationId.toString() === response.correlationId){

                    // remove the last character
                    response.deviceResponse = response.deviceResponse.substr(0, response.deviceResponse.length-1);

                    command.callback(response);

                    self.commandReady = true;

                    self.processCommands();
                }
            });
        }
    }

    disconnect(callback){
        this.connected = false;

        this._log('Disconnecting from: ' + this.channelName);

        this.Pusher.unsubscribe(this.channelName);

        this.publish('disconnect', 'we have disconnected!');

        if(callback){
            callback();
        }
    }

    debug(){
        this.debugOn = true;
        this._log('Debug logging turned on');
    }

    _log(message){
        if(this.debugOn){
            console.log(message);
        }
    }

    // publish a mesage to pub/sub
    publish(topic, data){
        // return if the topic doesn't exist
        if(!this.topics[topic] || this.topics[topic].length < 1) return;
        this.topics[topic].forEach(function(listener){
            listener(data || {});
        });
    }

    on(topic, listener){
        // create the topic
        if(!this.topics[topic]) this.topics[topic] = [];

        this.topics[topic].push(listener);
    }

    _devicePresent(members){
        var deviceFound = false;
        members.each(function(member){
        if(member.info.device){
            deviceFound = true;
        }});
        return deviceFound;
    }

    _unsubscribeTimer(){
        this._log('setting disconnect timer for: ' + this.unsubscribeTimeout + ' seconds');
        var self = this;
        this.timer = setTimeout(function(){
            self._log('lisa live timeout, please reconnect.');
            self.disconnect();
        }, self.unsubscribeTimeout * 1000);
    }

    _timerReset(){
        this._log('reset disconnect timer');
        clearTimeout(this.timer);
        this._unsubscribeTimer();
    }
}

export default LisaLive;
