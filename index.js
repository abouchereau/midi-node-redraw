//sudo apt-get install libusb-1.0 libudev-dev
//connecter d'abord le matériel
const MidiOutput = require("./lib/MidiOutput");
const MidiInput = require("./lib/MidiInput");
const MidiMsg = require("./lib/MidiMsg");
const Presets = require("./lib/Presets");
const yargs = require('yargs');
const NanoTimer = require('nanotimer');

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
let automationTimer = null;
let automationMsCounter = 0;

//check Midi Devices on parameters
if (typeof argv.midiOutputName != "string" || typeof argv.midiInputName != "string") {
    console.log("Please Select MIDI Input and Output in parameters.")
    process.exit();
}



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
        console.log("REMAP");
        let outMessages = remap.getMidiMessages(cmd, channel, param1, param2);
        for (let msg of outMessages) {
            midiOut.send(msg);
        }
        if (remap.hasAutomation() && cmd == MidiMsg.NOTE_ON) {
            if (automationTimer != null) {
                automationTimer.clearInterval();
                automationTimer = null;
            }
            automationTimer = new NanoTimer();
            automationMsCounter = 0;
            automationTimer.setInterval(() => {
                automationMsCounter += remap.automation.interval;
                let midiMessages = remap.automation.fn(automationMsCounter,channel,param1);
                for (let msg of midiMessages) {
                    midiOut.send(msg);
                }
            },'',remap.automation.interval+"m");
        }
        if (remap.hasAutomation() && cmd == MidiMsg.NOTE_OFF && automationTimer != null) {
            automationTimer.setTimeout(()=>{
                automationTimer.clearInterval();
                automationTimer = null;
            }, '', '3s');
        }
    });
}


process.on('message', (json)=> {

    console.log(json, json.remap, Presets[json.remap]);
    if (json.remap != null && typeof Presets[json.remap] == "object") {
        remap = Presets[json.remap];
    }
});
