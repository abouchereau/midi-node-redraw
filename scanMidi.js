//connecter d'abord le matériel

const MidiOutput= require("./lib/MidiOutput");
const MidiInput = require("./lib/MidiInput");


let midiOut = new MidiOutput();
let midiIn = new MidiInput();
midiIn.scanDevices().then(()=>{
    console.log('---- MIDI INPUTS ----');
    for(let i in midiIn.devices) {
        console.log(i+"."+midiIn.devices[i]);
    }

    midiOut.scanDevices().then(()=>{
        console.log('---- MIDI OUTPUTS ----');
        for(let i in midiOut.devices) {
            console.log(i+"."+midiOut.devices[i]);
        }
        process.exit();
    });
});



