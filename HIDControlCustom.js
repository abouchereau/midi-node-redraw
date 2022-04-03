const childProcess = require('child_process');
const spawn = require('child_process').spawn;
const { exec } = require('child_process');
const HID = require('node-hid');

const NUMPAD_VERRNUM = 83;
const NUMPAD_DIVIDE = 84;
const NUMPAD_MULTIPLY = 85;
const NUMPAD_MINUS = 86;
const NUMPAD_PLUS = 87;
const NUMPAD_ENTER = 88;
const NUMPAD_1 = 89;
const NUMPAD_2 = 90;
const NUMPAD_3 = 91;
const NUMPAD_4 = 92;
const NUMPAD_5 = 93;
const NUMPAD_6 = 94;
const NUMPAD_7 = 95;
const NUMPAD_8 = 96;
const NUMPAD_9 = 97;
const NUMPAD_0 = 98;
const NUMPAD_DOT = 99;

//open keyboard / numpad
let devices = HID.devices();
let keyboardDevice = null;
for(let device of devices) {
    if (device["product"].indexOf("Keyboard")>-1 ||  device["product"].indexOf("2.4G")>-1) {
        keyboardDevice = device;
    }
}


let device = new HID.HID(keyboardDevice.vendorId,keyboardDevice.productId);



//let son = childProcess.fork(__dirname + "/index.js", ["-o=Throu","-i=Garage"]);


let ctrl = false;

//numpad mapping
device.on('data',(a)=> {
    let tab = Array.prototype.slice.call(a);
    ctrl = tab[0] == 1;
    let key = tab[2];
    console.log(key);
    /*  switch(key) {
        case NUMPAD1:
            son.send({remap:'majorChord'});
            break;
        case NUMPAD2:
            son.send({remap:'changeNothing'});
            break;
            //this.recordAudioProcess = spawn("arecord",["-f","cd",this.homeDir+"/Musique/in_"+Utils.getFormattedDate()+".wav"],{detached:true,stdio:['ignore',1,2]});
    }*/
});