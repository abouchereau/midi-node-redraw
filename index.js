//sudo apt-get install libusb-1.0 libudev-dev
//connecter d'abord le matériel
const HID = require('node-hid');
const MidiOutput = require("./lib/MidiOutput");
const MidiInput = require("./lib/MidiInput");
const Presets = require("./lib/Presets");
const yargs = require('yargs');


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


const argv = yargs
    .option("midiOutputName", {
        alias: "o",
        describe: "A name part of the Midi Output",
        type: 'string',
    })
    .option("midiInputName", {
        alias: "i",
        describe: "A name part of the Midi Input",
        type: 'string',
    }).argv;


let remap = Presets.changeNothing;

//check Midi Devices on parameters
if (typeof argv.midiOutputName != "string" || typeof argv.midiInputName != "string") {
    console.log("Please Select MIDI Input and Output in parameters.")
    process.exit();
}

//open keyboard / numpad
let devices = HID.devices();
let keyboardDevice = null;
for(let device of devices) {
    if (device["product"].indexOf("Keyboard")>-1 ||  device["product"].indexOf("2.4G")>-1) {
        keyboardDevice = device;
    }
}
let device = new HID.HID(keyboardDevice.vendorId,keyboardDevice.productId);
let ctrl = false;

//numpad mapping
device.on('data',(a)=> {
    let tab = Array.prototype.slice.call(a);
    ctrl = tab[0] == 1;
    let key = tab[2];
    switch(key) {
        case NUMPAD1:
            remap = Presets.changeNothing;
            break;
        case NUMPAD2:
            remap = Presets.majorChord;
            break;
    }
});

//open midi input / output
let midiOut = new MidiOutput();
let midiIn = new MidiInput();
midiOut.scanDevices().then(()=> {
    midiOut.openFromName(argv.midiOutputName);
    midiIn.scanDevices().then(()=>{
        midiIn.openFromName(argv.midiInputName);
        start();
    })
})


//listen IN messages and send OUT
function start() {
    midiIn.onMidiMessage((cmd, channel, param1, param2) => {
        let outMessages = remap.getMidiMessages(cmd, channel, param1, param2);
        for (let msg of outMessages) {
            midiOut.send(msg);
        }
    });
}
