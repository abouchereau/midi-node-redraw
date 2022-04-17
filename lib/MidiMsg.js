module.exports = class MidiMsg {

    static get NOTE_OFF() {return 8;}
    static get NOTE_ON() {return 9;}
    static get CC() {return 11;}
    static get PC() {return 12;}
    static get START() {return 250;}
    static get STOP() {return 252;}
    static get TICK() {return 248;}
}