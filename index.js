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
let timeout = null;

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
        let outMessages = remap.getMidiMessages(cmd, channel, param1, param2);
        for (let msg of outMessages) {
            midiOut.send(msg);
        }
        if (remap.hasAutomation() && cmd == MidiMsg.NOTE_ON
            && channel >= remap.automation.filters.channelMin && channel <= remap.automation.filters.channelMax
            && param1 >= remap.automation.filters.noteMin && param1 <= remap.automation.filters.noteMax) {
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
            if (timeout != null) {
                clearTimeout(timeout);
                timeout = null;
            }


        }
        if (remap.hasAutomation() && cmd == MidiMsg.NOTE_OFF) {
            timeout = setTimeout(()=>{
                if (automationTimer != null) {
                    automationTimer.clearInterval();
                    automationTimer = null;
                }
            }, 3000);
        }
    });
}


process.on('message', (json)=> {
    if (json.remap != null && typeof Presets[json.remap] == "object") {
        remap = Presets[json.remap];
    }
});
