const MidiRemap = require("./MidiRemap");
const MidiMsg = require("./MidiMsg");
const Graph = require("./Graph");
const Automation = require("./Automation");

module.exports = class Presets {

    static changeNothing = new MidiRemap((cmd, channel, param1, param2) => {
        return [[16 * cmd + channel, param1, param2]];
    });

    static redirectAllToChannel10 = new MidiRemap((cmd, channel, param1, param2) => {
        const CHANNEL10 = 9;//0-based
        return [[16 * cmd + CHANNEL10, param1, param2]];
    });

    static majorChord = new MidiRemap((cmd, channel, param1, param2) => {
        if (cmd==MidiMsg.NOTE_ON || cmd==MidiMsg.NOTE_OFF) {
            return [
                [16 * cmd + channel, param1, param2],
                [16 * cmd + channel, param1 + 4, param2],
                [16 * cmd + channel, param1 + 7, param2]
            ];
        }
        else {
            return [[16 * cmd + channel, param1, param2]];
        }
    });

    static normalizeVelocity = new MidiRemap((cmd, channel, param1, param2) => {
        if (cmd==MidiMsg.NOTE_ON || cmd==MidiMsg.NOTE_OFF) {
            const CENTER = 100;
            const NORMALIZE_FACTOR = 3;
            param2 = Math.round(CENTER+((param2-CENTER)/NORMALIZE_FACTOR));
            return [[16 * cmd + channel, param1, param2]];
        }
        else {
            return [[16 * cmd + channel, param1, param2]];
        }
    });

    //----- CUSTOM PRESETS

    //{60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71};
    static touchBoardVolcaJMJMelody = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const BASS_CHANNEL = 3;
        const LEAD_CHANNEL = 4;
        const CC_PITCH_1AND2 = 28;
        const BASS_NOTE_SCALE = [29, 31, 33, 34, 36, 38];
        const LEAD_NOTE_SCALE = [60, 62, 64, 65, 67, 69, 70];
        if (cmd==MidiMsg.NOTE_ON) {
            //bass
            if (param1 >= 60 && param1 <= 64) {
                out.push([MidiMsg.CC * 16 + BASS_CHANNEL,CC_PITCH_1AND2, 1+BASS_NOTE_SCALE[param1-60]]);
            }
            //melody
            if (param1 >= 65 && param1 <= 71) {
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL,CC_PITCH_1AND2, 1+LEAD_NOTE_SCALE[param1-65]]);
                out.push([MidiMsg.NOTE_ON * 16 + LEAD_CHANNEL, 60 , 100]);
            }
        }
        return out;
    });

    //
    static isMute = [false,false,false,false,false,false];
    static touchBoardVolcaJMJMute = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const INITIAL_VOL = [[100,100],[100,100],[100,100],[100,100],[100,100],[100,100]];

        const CC_LEV_1 = 17;
        const CC_LEV_2 = 18;

        if (cmd==MidiMsg.NOTE_ON) {
            //bass
            if (param1 >= 60 && param1 <= 65) {
                let channel = param1-60;
                if (Presets.isMute[channel]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, INITIAL_VOL[channel][0]]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, INITIAL_VOL[channel][1]]);
                    Presets.isMute[channel] = false;
                }
                else {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                    Presets.isMute[channel] = false;
                }
            }
        }
        return out;
    });

    static isMute = [false,false,false,false,false];
    static touchBoardVolcaDaftPunk = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const INITIAL_VOL = [[100,100],[100,100],[100,100],[100,100],[100,100]];

        const CC_LEV_1 = 17;
        const CC_LEV_2 = 18;
        const LEAD_CHANNEL = 1;
        const CC_DRV_1 = 51;
        const CC_PITCH_1 = 26;
        const CC_PITCH_2 = 27;
        const CC_PITCH_1AND2 = 28;
        const LEAD_NOTE_SCALE = [57, 59, 60, 62, 64, 67, 69, 72];
        const NOTE_CHANNEL = {61: 5, 62: 0, 63: 3};

        if (cmd==MidiMsg.NOTE_ON) {
            // ctrl1 = kick léger / lourd (part 3)
            // ctrl2 = HH1 on /off (part 6)
            // ctrl3 = HH2 on/off (part 1)
            // ctrl4 = hit on/off (part 4)
            if (param1 == 60) {
                const KICK_PART = 3;
                const DRV_INIT = 127;
                if (Presets.isMute[KICK_PART]) {
                    out.push([MidiMsg.CC * 16 + KICK_PART, CC_DRV_1, DRV_INIT]);
                    out.push([MidiMsg.CC * 16 + KICK_PART, CC_LEV_2, INITIAL_VOL[KICK_PART][1]]);
                }
                else {
                    out.push([MidiMsg.CC * 16 + KICK_PART, CC_DRV_1, 20]);
                    out.push([MidiMsg.CC * 16 + KICK_PART, CC_LEV_2, 0]);
                }
            }
            else if (param1 >= 61 && param1 <=63) {
                let channel = NOTE_CHANNEL[param1];
                if (Presets.isMute[channel]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, INITIAL_VOL[channel][0]]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, INITIAL_VOL[channel][1]]);
                    Presets.isMute[channel] = false;
                }
                else {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                    Presets.isMute[channel] = true;
                }
            }
            else if (param1 >= 64 && param1 <= 71) {
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL, CC_PITCH_1, 1+LEAD_NOTE_SCALE[param1-64]-24]);
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL, CC_PITCH_2, 1+LEAD_NOTE_SCALE[param1-64]]);
                out.push([MidiMsg.NOTE_ON * 16 + LEAD_CHANNEL, 60 , 60]);
            }
        }
        if (cmd==MidiMsg.NOTE_OFF) {
                //bass
                if (param1 >= 60 && param1 <= 63) {
                    let channel = param1-60;
                    if (Presets.isMute[channel]) {
                        out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, INITIAL_VOL[channel][0]]);
                        out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, INITIAL_VOL[channel][1]]);
                        Presets.isMute[channel] = false;
                    }
                    else {
                        out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                        out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                        Presets.isMute[channel] = false;
                    }
                }
                else if (param1 >= 64 && param1 <= 71) {
                    out.push([MidiMsg.NOTE_OFF * 16 + LEAD_CHANNEL, 60 , 60]);
                }
            }
        return out;
    },new Automation(
            (ms, channel, note)=> {
                const CC_FLD = 50;
                const CHANNEL = 1;
                return [[MidiMsg.CC * 16 + CHANNEL, CC_FLD, Math.round(Graph.osc(ms, 10, 2000, 80, 0.125))]];
            },
            25,
            {'channelMin':1, 'channelMax':1}
        )
    );

    static touchBoardVolcaChangePattern = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];

        if (cmd==MidiMsg.NOTE_ON) {
            //bass
            if (param1 == 60 || param1 == 61) {
                out.push([MidiMsg.PC * 16 + 0, 13+param1-60]);
            }
        }
        return out;
    });

}

