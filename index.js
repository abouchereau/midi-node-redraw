//connecter d'abord le matériel

const MidiOutput = require("./lib/MidiOutput");
const MidiInput = require("./lib/MidiInput");
const MidiRemap = require("./lib/MidiRemap");
const Presets = require("./lib/Presets");
const yargs = require('yargs');

const NOTE_OFF = 8;
const NOTE_ON = 9;
const CC = 11;
const PC = 12;

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





if (typeof argv.midiOutputName != "string" || typeof argv.midiInputName != "string") {
    console.log("Please Select MIDI Input and Output in parameters.")
    process.exit();
}


let midiOut = new MidiOutput();
let midiIn = new MidiInput();
midiOut.scanDevices().then(()=> {
    midiOut.openFromName(argv.midiOutputName);
    midiIn.scanDevices().then(()=>{
        midiIn.openFromName(argv.midiInputName);
        start();
    })
})

let remap = Presets.changeNothing;

function start() {//return same as input
    midiIn.onMidiMessage((cmd, channel, param1, param2) => {
        console.log("On Midi Message", cmd, channel, param1, param2);
        let outMessages = remap.getMidiMessages(cmd, channel, param1, param2);
        for (let msg of outMessages) {
            midiOut.send(msg);
        }
    });

}
