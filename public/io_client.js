// cross browser way to add an event listener
function addListener(event, obj, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(event, fn, false);   // modern browsers
    } else {
        obj.attachEvent("on"+event, fn);          // older versions of IE
    }
}

//chart
/*
var smoothie = new SmoothieChart({
  grid: {lineWidth: 1, millisPerLine: 200, verticalSections: 6, }
});
*/
var smoothie = new SmoothieChart({

});
// Data
var line1 = new TimeSeries();
var line2 = new TimeSeries();
// Add to SmoothieChart
smoothie.addTimeSeries(line1,{ strokeStyle:'rgb(0,0,255)', lineWidth:1 });
smoothie.addTimeSeries(line2,{ strokeStyle:'rgb(0, 255, 0)', lineWidth:1 });
//line1.append(new Date().getTime(), 0);
//make sure this load right
addListener("load", window,function(){
    //smoothie.streamTo(document.getElementById("mycanvas"));
    smoothie.streamTo(document.getElementById("mycanvas"), 1000 /*delay*/);
});

var siolast;
function send_Latency_sio(){
  siolast = new Date;
  socketio.emit('Latency');
  document.getElementById('stransport').innerHTML = socketio.io.engine.transport.name;
  //document.getElementById('stransport').innerHTML = socketio.socket.transport.name;
}

var socketio = io();
socketio.emit('Latency');
socketio.on('Latency', function(){
	//console.log('socket.io Latency');
	var latency = new Date - siolast;
	document.getElementById('slatency').innerHTML = latency + 'ms';
	line2.append(+new Date, latency);
	setTimeout(send_Latency_sio, 100);
});
socketio.on('connect', function(){
	//console.log(socketio.io.engine.transports[0]);
	console.log('socket.io user connect');
	socketio.emit('identify','');
	send_Latency_sio();
});

socketio.on('identify', function(data){
	console.log('socket.io user:'+data);
});
socketio.on('disconnect', function(){
	console.log('socket.io user disconnected');
	document.getElementById('stransport').innerHTML = '(disconnected)';
});


var last;
function send_Latency_eio(){
  last = new Date;
  engineio.send('Latency');
  document.getElementById('etransport').innerHTML = engineio.transport.name;
}
console.log(document.URL);
//var engineio = eio('ws://localhost:3000');
//var engineio = eio('ws://[]');
var engineio = eio();


engineio.on('open', function(){
    send_Latency_eio();
    engineio.on('message', function(data){
        //console.log(data);//display data
        //this is to filter out the string name Latency
        if(data == 'Latency'){
            var latency = new Date - last;
            document.getElementById('elatency').innerHTML = latency + 'ms';
            //if (time) time.append(+new Date, latency);
            line1.append(+new Date, latency)
            setTimeout(send_Latency_eio, 100);
        }
        //console.log(ByteBuffer(data));
        try{
            var source = new ByteBuffer.wrap(data).flip().readIString();
            //console.log(source);
            //console.log("pass");
        }catch(e){
            //console.log("error :" + e);
        }

        try{
            var msg = Message.decode(data);
            //console.log("msg:" + msg.text);
        }catch(error){
            //console.log("error :"+error);
        }
    });
    engineio.on('close', function(){
        //if (smoothie) smoothie.stop();
        document.getElementById('etransport').innerHTML = '(disconnected)';
    });
});
