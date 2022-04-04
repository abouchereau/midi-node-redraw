const MidiRemap = require("./MidiRemap");
const MidiMsg = require("./MidiMsg");
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

    //{60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71};
    static touchBoardVolcaJMJ1 = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const BASS_CHANNEL = 3;
        const LEAD_CHANNEL = 4;
        const CC_PITCH_1AND2 = 28;
        const BASS_NOTE_SCALE = [29, 31, 33, 34, 36, 38];
        const LEAD_NOTE_SCALE = [60, 62, 64, 65, 67, 69, 70];
        if (cmd==MidiMsg.NOTE_ON) {
            //bass
            if (param1 >= 60 && param1 <= 64) {
                out.push([MidiMsg.CC * 16 + BASS_CHANNEL,CC_PITCH_1AND2, BASS_NOTE_SCALE[param2-60]]);
            }

            //melody
            if (param1 >= 65 && param1 <= 71) {
                out.push([MidiMsg.CC * 16 + BASS_CHANNEL,CC_PITCH_1AND2, LEAD_NOTE_SCALE[param2-65]]);
                out.push([MidiMsg.NOTE_ON * 16 + BASS_CHANNEL, 60 , 100]);
            }
        }
        return out;
    });

}

