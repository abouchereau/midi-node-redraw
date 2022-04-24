const childProcess = require('child_process');
const spawn = require('child_process').spawn;
const { exec } = require('child_process');
const HID = require('node-hid');
const LedControl = require("./lib/LedControl");
const Utils = require("./lib/Utils");

const NUMPAD_BACKSPACE = 42;
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
    if (device["product"].indexOf("Keyboard")>-1 ||  device["product"].indexOf("2.4G K")>-1) {
        keyboardDevice = device;
    }
}



//TODO : lancer/ arrêter l'index avec le clavier
//TODO : un set test mélodique avec  12 notes

let device = new HID.HID(keyboardDevice.vendorId,keyboardDevice.productId);
let ledControl = new LedControl();


let ctrl = false;
let recordAudioProcess = null;
let indexProcess = null;
const HOME_DIR = require('os').homedir();
const RECORD_DIR = HOME_DIR+"/usb-key-01/";
let keyHistory = [];
//numpad mapping
device.on('data',(a)=> {
    let tab = Array.prototype.slice.call(a);
    ctrl = tab[0] == 1;
    let key = tab[2];
    switch(key) {
        case NUMPAD_0:
            if (indexProcess != null) {
                indexProcess.send({remap: 'touchBoardVolcaTest'});
            }
            ledControl.setNum(0);
            break;
        case NUMPAD_1:
            if (indexProcess != null) {
                indexProcess.send({remap: 'touchBoardVolcaTransition'});
            }
            ledControl.setNum(1);
            break;
        case NUMPAD_2:
            if (indexProcess != null) {
                indexProcess.send({remap: 'touchBoardVolcaJMJ'});
            }
            ledControl.setNum(2);
            break;
        case NUMPAD_3:
            if (indexProcess != null) {
                indexProcess.send({remap: 'touchBoardVolcaDaftPunk'});
            }
            ledControl.setNum(3);
            break;
        case NUMPAD_7:
            if (indexProcess != null) {
                process.kill(indexProcess.pid);
                indexProcess= null;
            }
            indexProcess = childProcess.fork(__dirname + "/index.js", ["-o=CH345","-i=Touch"]);
            ledControl.setNum(5);
            break;
        case NUMPAD_8:
            if (indexProcess != null) {
                process.kill(indexProcess.pid);
                indexProcess= null;
            }
            indexProcess = childProcess.fork(__dirname + "/index.js", ["-o=CH345","-i=Garage"]);
            ledControl.setNum(6);
            break;
        case NUMPAD_PLUS:
            recordAudioProcess = spawn("arecord",["-f","cd",RECORD_DIR+"in_"+Utils.getFormattedDate()+".wav"],{detached:true,stdio:['ignore',1,2]});
            ledControl.startRecord();
            break;
        case NUMPAD_MINUS:
            if (recordAudioProcess != null) {
                process.kill(-recordAudioProcess.pid);
                recordAudioProcess = null;
            }
            ledControl.stopRecord();
            break;
        }
        keyHistory.unshift(key);
        keyHistory.slice(0,3);
        if (Utils.arrayEquals(keyHistory, [NUMPAD_DIVIDE, NUMPAD_DIVIDE, NUMPAD_DIVIDE])) {
            ledControl.allOff();
            exec("shutdown now");
        }
        if (Utils.arrayEquals(keyHistory, [NUMPAD_MULTIPLY, NUMPAD_MULTIPLY, NUMPAD_MULTIPLY])) {
            ledControl.allOff();
            exec("shutdown -r now");
        }
});
