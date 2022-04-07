module.exports = class MidiRemap {

    fn = ()=>{};
    automation = null;

    constructor(fn) {
        this.fn = fn;
    }

    getMidiMessages(cmd, channel, param1, param2) {
        return this.fn(cmd, channel, param1, param2);
    }

    setAutomation(a) {
        this.automation = a;
    }

    hasAutomation() {
        return this.automation != null;
    }



}