const childProcess = require('child_process');
const spawn = require('child_process').spawn;
const { exec } = require('child_process');
const HID = require('node-hid');


const NUMPAD0 = 98;
const NUMPAD1 = 89;
const NUMPAD2 = 90;
const NUMPAD3 = 91;
const NUMPAD4 = 92;
const NUMPAD5 = 93;
const NUMPAD6 = 94;
const NUMPAD7 = 95;
const NUMPAD8 = 96;
const NUMPAD9 = 97;


//open keyboard / numpad
let devices = HID.devices();
let keyboardDevice = null;
for(let device of devices) {
    if (device["product"].indexOf("Keyboard")>-1 ||  device["product"].indexOf("2.4G")>-1) {
        keyboardDevice = device;
    }
}


let device = new HID.HID(keyboardDevice.vendorId,keyboardDevice.productId);



let son = childProcess.fork(__dirname + "/index.js", ["-o=Throu","-i=Garage"]);


let ctrl = false;

//numpad mapping
device.on('data',(a)=> {
    let tab = Array.prototype.slice.call(a);
    ctrl = tab[0] == 1;
    let key = tab[2];
    switch(key) {
        case NUMPAD1:
            son.send({remap:'majorChord'});
            break;
        case NUMPAD2:
            son.send({remap:'changeNothing'});
            break;
            //this.recordAudioProcess = spawn("arecord",["-f","cd",this.homeDir+"/Musique/in_"+Utils.getFormattedDate()+".wav"],{detached:true,stdio:['ignore',1,2]});
    }
});