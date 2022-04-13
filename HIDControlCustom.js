const childProcess = require('child_process');
const spawn = require('child_process').spawn;
const { exec } = require('child_process');
const HID = require('node-hid');
const LedControl = require("./lib/LedControl");

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
let ledControl = new LedControl();


let son = childProcess.fork(__dirname + "/index.js", ["-o=CH345","-i=Garage"]);


let ctrl = false;
let recordAudioProcess = null;
const HOME_DIR = require('os').homedir();
const RECORD_DIR = HOME_DIR+"/usb-key/";
//numpad mapping
device.on('data',(a)=> {
    let tab = Array.prototype.slice.call(a);
    ctrl = tab[0] == 1;
    let key = tab[2];
    //console.log("KEY = ",key);
    switch(key) {
        case NUMPAD_1:
            son.send({remap:'touchBoardVolcaJMJMelody'});
            break;
        case NUMPAD_2:
              son.send({remap:'touchBoardVolcaJMJMute'});
              break;
        case NUMPAD_3:
              son.send({remap:'touchBoardVolcaDaftPunk'});
              ledControl.setNum(2);
              break;
        case NUMPAD_4:
            son.send({remap:'touchBoardVolcaChangePattern'});
            break;
        case NUMPAD_5:
            son.send({remap:'touchBoardVolcaDaftPunk'});
            break;
        case NUMPAD_PLUS:
            recordAudioProcess = spawn("arecord",["-f","cd",RECORD_DIR+"in_"+Utils.getFormattedDate()+".wav"],{detached:true,stdio:['ignore',1,2]});
            ledControl.startRecord();
            console.log("Start Recording Audio");
            break;
        case NUMPAD_MINUS:
            process.kill(-recordAudioProcess.pid);
            recordAudioProcess = null;
            ledControl.stopRecord();
            break;
        }
});