class Automation {

    fn = ()=>{};

    filterChannelMin;
    filterChannelMax;
    filterNoteMin;
    filterNoteMax;

    constructor(fn, filterChannelMin = 0, filterChannelMax = 15, filterNoteMin = 0, filterNoteMax = 127) {
        this.fn = fn;
        this.filterChannelMin = filterChannelMin;
        this.filterChannelMax = filterChannelMax;
        this.filterNoteMin = filterNoteMin
        this.filterNoteMax = filterNoteMax;
    }

    getMidiMessages() {

    }

    start() {

    }

    stop() {

    }
}
