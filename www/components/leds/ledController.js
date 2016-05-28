// Simple red/blue fade with Node and opc.js
var LEDController = function(host, port)
{
    //time left growing parameters
    this.maximumMinutes = 60;

    this.color = {r: 255, g: 0, b: 0};
    this.urgence = 6;
    this.stop = 0;
    this.leds = 152;

    //animation parameters
    this.lastTime = 0;
    this.startTime = 0;

    //spark parameters
    this.sparkPoints = 8;
    this.sparkRGB = [0, 0, 0];
    this.sparkSide = [this.sparkRGB[0]/2, this.sparkRGB[1]/2, this.sparkRGB[2]/2];

    this.Frame = {
        r: new Array(this.leds).fill(0),
        g: new Array(this.leds).fill(0),
        b: new Array(this.leds).fill(0),
        writeOne: function(i, red, green, blue){
            this.r[i] = red;
            this.g[i] = green;
            this.b[i] = blue;
        },
        clean: function(){
            this.r.fill(0);
            this.g.fill(0);
            this.b.fill(0);
        },
        addOne: function(i, red, green, blue){
            this.r[i] = Math.min(255, this.r[i] + red);
            this.g[i] = Math.min(255, this.g[i] + green);
            this.b[i] = Math.min(255, this.b[i] + blue);
        }
    };

    this.socket = new WebSocket('ws://' + host + ':' + port);
    this.socket.onclose = function(event) {
        console.log("[LEDController] disconnected from fadecandy");
        this.stop = 1;
    };
    this.socket.onopen = function(event) {
        console.log("[LEDController] connected to fadecandy at " + host + ":" + port);
    };
}

LEDController.prototype._writeFrame = function (red, green, blue) {
    var packet = new Uint8ClampedArray(4 + this.leds * 3);
    // Dest position in our packet. Start right after the header.
    var dest = 4;

    // Sample the center pixel of each LED
    for (var led = 0; led < this.leds; led++) {
        packet[dest++] = red;
        packet[dest++] = green;
        packet[dest++] = blue;
    }
    this._writePacket(packet);
}

// extended from writeFrame, can write a certain light pattern rather than single color
LEDController.prototype._advancedFrame = function (Fra) {
    var packet = new Uint8ClampedArray(4 + this.leds * 3);
    var dest = 4;

    // Sample the center pixel of each LED
    for (var led = 0; led < this.leds; led++) {
        packet[dest++] = Fra.r[led];
        packet[dest++] = Fra.g[led];
        packet[dest++] = Fra.b[led];
    }

    this._writePacket(packet);
}

LEDController.prototype._writePacket = function (packet) {
    if (this.socket.readyState != 1 /* OPEN */) {
        console.log("[LEDController] The server connection isn't open. Nothing to do.");
        return;
    }

    if (this.socket.bufferedAmount > packet.length) {
        console.log("[LEDController] The network is lagging, and we still haven't sent the previous frame.");
        return;
    }
    console.log(packet.toString());
    this.socket.send(packet.buffer);
}

LEDController.prototype._allOff = function () {
    this._writeFrame(0, 0, 0);
}


// Make sure the light index is legal
LEDController.prototype._tailor = function (ind){
    if (ind < 0){
        newI = this.leds + ind;
    }else if (ind > this.leds - 1){
        newI = ind - this.leds;
    }else{
        newI = ind;
    }
    return newI;
}

// Random sparkling light
LEDController.prototype._spark = function () {
    this.sparkPoints = this.urgence * 2;
    var dT = 1500/this.urgence/this.leds*1000;
    
    var thisTime = new Date().getTime();
    this.lastTime = thisTime;
    if (this.stop == 1) {
        this._allOff();
        this.stop = 0;
        return;
    } else {
        //console.log("[LEDController] Next spark with " + (thisTime - this.startTime));
    }

    this.Frame.clean();
    for (var i = this.sparkPoints - 1; i >= 0; i--) {
        var ranInd = Math.floor(Math.random() * this.leds);
        var previous = this._tailor(ranInd+1);
        var after = this._tailor(ranInd-1);
        this.Frame.writeOne(ranInd, this.sparkRGB[0], this.sparkRGB[1], this.sparkRGB[2]);
        this.Frame.addOne(previous, this.sparkSide[0], this.sparkSide[1], this.sparkSide[2]);
        this.Frame.addOne(after, this.sparkSide[0], this.sparkSide[1], this.sparkSide[2]);
    }

    this._advancedFrame(this.Frame);
    //console.log("[LEDController] setting timeout to: " + dT);
    setTimeout(this._spark.bind(this), dT);
}

LEDController.prototype.spark = function () {
    this.sparkRGB = [250, 0, 0];
    this.sparkSide = [this.sparkRGB[0]/4, this.sparkRGB[1]/4, this.sparkRGB[2]/4];
    this.startTime = new Date().getTime();
    this._spark();
}

LEDController.prototype.stopLEDs = function () {
    console.log("[LEDController] stopping sparking");
    this.stop = 1;
    this._allOff();
}

LEDController.prototype.showTime = function(){
    // TODO get time (e.g. hour=5 minutes=45)
    var time = new Date();
    var hour = time.getHours();
    if (hour > 12) {
        hour -= 12;
    } 
    var minutes = time.getMinutes();
    var hourPos = Math.floor(this.leds*hour/12);
    var previous = this._tailor(hourPos-1);
    var after = this._tailor(hourPos+1);
    var minPos = Math.floor(this.leds*minutes/60);
    this.Frame.clean();
    this.Frame.writeOne(hourPos, 255, 255, 255);
    this.Frame.writeOne(previous, 255, 255, 255);
    this.Frame.writeOne(after, 255, 255, 255);
    this.Frame.writeOne(minPos, 255, 0, 0);
    console.log("[LEDController] Display the Time: " + hour + ':' + min);
    this.advancedFrame(this.Frame);
}




LEDController.prototype.displayTimeLeftGrowing = function (timeLeftInformation) {
    this._displayTimeLeft(timeLeftInformation, true);
}

LEDController.prototype.displayTimeLeftShrinking = function (timeLeftInformation) {
    this._displayTimeLeft(timeLeftInformation, false);
}

LEDController.prototype._displayTimeLeft = function (timeLeftInformation, growing) {
    //this.leds
    var packet = new Uint8ClampedArray(4 + this.leds * 3);

    if (timeLeftInformation.length < 1 || timeLeftInformation.length > 4) {
        console.log('[LEDController] unsupported amount of users for this glow type');
        return;
    }

    for (var user = 0; user < timeLeftInformation.length; user++) {
        var userLedAreaStart = Math.floor(this.leds / timeLeftInformation.length * (user));
        var userLedAreaEnd = Math.floor(this.leds / timeLeftInformation.length * (user+1)) - 1;

        var availableLedsForUser = userLedAreaEnd - userLedAreaStart;

        var numberOfActiveLeds = Math.min(timeLeftInformation[user].minutes, this.maximumMinutes) / this.maximumMinutes * availableLedsForUser;

        if (growing) numberOfActiveLeds = availableLedsForUser - numberOfActiveLeds;

        var litLedStart = Math.floor(userLedAreaStart + (availableLedsForUser - numberOfActiveLeds)/2);
        var litLedEnd = Math.floor(litLedStart + numberOfActiveLeds);

        for (var i = litLedStart; i < litLedEnd; i++) {
            packet[4 + i * 3    ] = timeLeftInformation[user].color[0];
            packet[4 + i * 3 + 1] = timeLeftInformation[user].color[1];
            packet[4 + i * 3 + 2] = timeLeftInformation[user].color[2];
        }

        console.log('[LEDController] s: ' + userLedAreaStart + ' e: ' + userLedAreaEnd + ' av: ' + availableLedsForUser + ' actLED: ' + numberOfActiveLeds + ' litS: ' + litLedStart + ' litE: ' + litLedEnd);

    }
    this._writePacket(packet);
    this._writePacket(packet);
    this._writePacket(packet);
    this._writePacket(packet);
    this._writePacket(packet);
}
