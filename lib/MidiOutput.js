const Utils = require("./Utils");
const MidiMsg = require("./MidiMsg");
const midi = require('midi');
const NanoTimer = require('nanotimer');

module.exports = class MidiOutput {

    static get NOTE_OFF() {return 8;}
    static get NOTE_ON() {return 9;}
    static get CC() {return 11;}
    static get PC() {return 12;}

    MIDI_MSG_GAP = "3500u";//cf NanoTimer /

    DEFAULT_MIDI_INDEX = 0;
    midiOutIndex = -1;
    nbMidiDevices = -1;
    midiOutput = null;
    midiCmdStack = [];
    stackIsEmpty = true;
    timer = null;
    lastCmd = null;
    devices = [];
    lastCCs = {};//avoid CC repetition


    constructor() {
        this.timer = new NanoTimer();
        this.timer.setInterval(() => {
            if (!this.stackIsEmpty) {
                let midiCmd = this.midiCmdStack.shift();
                if (this.midiOutput != null) {
                    this.midiOutput.send(midiCmd);
                }
                if (this.midiCmdStack.length == 0) {
                    this.stackIsEmpty = true;
                }
            }
        }, '', this.MIDI_MSG_GAP);

    }

    scanDevices() {
        return new Promise((success,failure) => {
            this.midiOutput = new midi.Output();
            this.nbMidiDevices = -1;
            setInterval(() => {//process.onNextTick ?
                if (this.midiOutput.getPortCount() != this.nbMidiDevices) {
                    this.nbMidiDevices = this.midiOutput.getPortCount();
                    this.devices = [];
                    for (let i = 0; i < this.nbMidiDevices; i++) {
                        this.devices[i] = this.midiOutput.getPortName(i);
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
                this.midiOutIndex = parseInt(i);
                found = true;
                break;
            }
        }
        if (found) {
            this.openOutput();
        }
    }

    openOutput() {
        this.midiOutput.openPort(this.midiOutIndex);
    }

    send(cmd) {
        //avoid CC repetition
        let com = cmd[0] >> 4;
        let channel = cmd[0] & 0xf;
        let param1 = cmd[1];
        let param2 = cmd[2];
        if (com == MidiMsg.CC) {
            let key = channel+"-"+param1;
            if (this.lastCCs[key] != null && this.lastCCs[key] == param2) {
                return;
            }
            else {
                this.lastCCs[key] = param2;
            }
        }
        //-------------
        this.midiCmdStack.push(cmd);
        this.stackIsEmpty = false;
        this.lastCmd = Utils.cloneArray(cmd);
    }

}
