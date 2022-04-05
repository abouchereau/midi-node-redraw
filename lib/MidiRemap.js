module.exports = class MidiRemap {

    fn = ()=>{};
    automation = ()=>{};

    constructor(fn) {
        this.fn = fn;
    }

    getMidiMessages(cmd, channel, param1, param2) {
        return this.fn(cmd, channel, param1, param2);
    }

    setAutomation(fn,a,b,c,d) {
        this.automation = new Automation(fn,a,b,c,d);
    }



}