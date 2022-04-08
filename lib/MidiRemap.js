module.exports = class MidiRemap {

    fn = ()=>{};
    automation = null;

    constructor(fn, automation= null) {
        this.fn = fn;
        if (automation != null) {
            this.automation = automation;
        }
    }

    getMidiMessages(cmd, channel, param1, param2) {
        return this.fn(cmd, channel, param1, param2);
    }


    hasAutomation() {
        return this.automation != null;
    }



}