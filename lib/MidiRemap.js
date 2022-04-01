module.exports = class MidiRemap {

    fn = ()=>{};

    constructor(fn) {
        this.fn = fn;
    }

    getMidiMessages(cmd, channel, param1, param2) {
        return this.fn(cmd, channel, param1, param2);
    }
}