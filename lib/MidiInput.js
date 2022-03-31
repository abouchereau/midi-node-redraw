const midi = require('midi');

module.exports = class MidiInput {


    midiInput = null;
    name = "";
    static INDEX_COUNT = 0;
    devices = [];
    midiInIndex = -1;
    nbMidiDevices = -1;

    constructor() {
    }


    scanDevices() {
        return new Promise((success,failure) => {
            this.midiInput = new midi.Input();
            this.nbMidiDevices = -1;
            setInterval(() => {//process.onNextTick ?
                if (this.midiInput.getPortCount() != this.nbMidiDevices) {
                    this.nbMidiDevices = this.midiInput.getPortCount();
                    this.devices = [];
                    for (let i = 0; i < this.nbMidiDevices; i++) {
                        this.devices[i] = this.midiInput.getPortName(i);
                    }
                    success();
                }
            }, 500);
        });
    }

    openFromName(namePart) {
        let found = false;
        for (let i in this.devices) {
            if (this.devices[i].indexOf(namePart)>-1) {
                this.midiInIndex = parseInt(i);
                found = true;
                break;
            }
        }
        if (found) {
            this.openOutput();
        }
    }

    openOutput() {
        this.midiInput.openPort(this.midiInIndex);

    }

    onMidiMessage(callback) {
        this.midiInput.on('message', (deltaTime, m) => {
            let cmd = m[0] >> 4;
            let channel = m[0] & 0xf;
            let param1 = m[1];
            let param2 = m[2];
            callback(cmd, channel, param1, param2);
        });
    }




}