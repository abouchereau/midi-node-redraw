class MidiRemap {

    fn = ()=>{};

    constructor(fn) {
        this.fn = fn;
    }

    getMidiMessages(cmd, channel, param1, param2) {
        return fn(cmd, channel, param1, param2);
    }
}