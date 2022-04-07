module.exports = class Automation {

    fn = ()=>{};
    filters = {
        channelMin: 0,
        channelMax: 5,
        noteMin: 0,
        noteMax: 127
    };
    interval = 1;//call every x milliseconds

    constructor(fn, interval= 1, filters= {}, ) {
        this.fn = fn;
        this.interval = interval;
        for (let filter in filters) {
            this.filters[filter] = filters[filter];
        }
    }

    getMidiMessages() {

    }

    start() {

    }

    stop() {

    }
}
