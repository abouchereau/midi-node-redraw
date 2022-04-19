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

    static isMute16 = [false, false, false, false, false, false];
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

    static isMute14 = [false, false, false, false, false, false];
    static touchBoardVolcaDaftPunk = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const INITIAL_VOL = [
            [72,126],//HH 2
            [100,100],//Lead
            [98,73],//Kick
            [93,88],//Hit
            [100,100],//Clap
            [42,56]//HH 1
        ];

        const CC_LEV_1 = 17;
        const CC_LEV_2 = 18;
        const LEAD_CHANNEL = 1;
        const CC_GAN = 52;
        const CC_PITCH_1 = 26;
        const CC_PITCH_2 = 27;
        const CC_PITCH_1AND2 = 28;
        const LEAD_NOTE_SCALE = [57, 59, 60, 62, 64, 67, 69, 72];
        const NOTE_CHANNEL = {49: 5, 50: 0, 51: 3};

        if (cmd==MidiMsg.NOTE_ON) {
            // ctrl1 = kick léger / lourd (part 3)
            // ctrl2 = HH1 on /off (part 6)
            // ctrl3 = HH2 on/off (part 1)
            // ctrl4 = hit on/off (part 4)
            if (param1 == 48) {
                const KICK_CHANNEL = 2;
                const GAN_INIT = 127;
                if (Presets.isMute14[KICK_CHANNEL]) {
                    out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_GAN, GAN_INIT]);
                    out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_LEV_2, INITIAL_VOL[KICK_CHANNEL][1]]);
                    Presets.isMute14[KICK_CHANNEL] = false;
                }
                else {
                    out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_GAN, 20]);
                    out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_LEV_2, 0]);
                    Presets.isMute14[KICK_CHANNEL] = true;
                }
            }
            else if (param1 >= 49 && param1 <=51) {
                let channel = NOTE_CHANNEL[param1];

                if (Presets.isMute14[channel]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, INITIAL_VOL[channel][0]]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, INITIAL_VOL[channel][1]]);
                    Presets.isMute14[channel] = false;
                }
                else {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                    Presets.isMute14[channel] = true;
                }
            }
            else if (param1 >= 52 && param1 <= 59) {
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL, CC_PITCH_1, 1+LEAD_NOTE_SCALE[param1-52]-24]);
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL, CC_PITCH_2, 1+LEAD_NOTE_SCALE[param1-52]]);
                out.push([MidiMsg.NOTE_ON * 16 + LEAD_CHANNEL, 60 , 60]);
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

    static touchBoardVolcaTransition = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const CC_LEV_1 = 17;
        const CC_LEV_2 = 18;
        const KICK_CHANNEL = 2;
        const CC_GAN = 52;
        if (cmd==MidiMsg.NOTE_ON) {

            //lance JMJ basse seulement
            if (param1 == 52) {
                //on se positionne sur le pattern 16
                out.push([MidiMsg.PC * 16 + 0, 15]);
                //on mute tout sauf la basse (channel 0)
                for(let i = 1;i < 6;i++) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, 0]);
                }
                //on lance
                out.push([MidiMsg.START]);
                //tempo 132
                out.push([0,132]);//custom
            }
            //JMJ : lance les drums
            if (param1 == 53) {
                //on démute les trucs
                const INITIAL_VOL = [
                    [100,100],//HH 2
                    [100,100],//Lead
                    [100,100],//Kick
                    [100,100],//Hit
                    [100,100],//Clap
                ];
                for(let i = 1;i < 5;i++) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, INITIAL_VOL[i][0]]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, INITIAL_VOL[i][1]]);
                }
            }

            if (param1 == 56) {
                //on se positionne sur le pattern 14
                out.push([MidiMsg.PC * 16 + 0, 13]);
                //on garde kick light, snare et HH light
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_GAN, 20]);
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_LEV_2, 0]);
                Presets.isMute14[KICK_CHANNEL] = true;

                for (let channel of [0,3]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                    Presets.isMute14[channel] = true;
                }
                //tempo 112
                out.push([0,112]);//custom
            }
            if (param1 == 57) {//daft punk fill in
                //on se positionne sur le pattern 15
                out.push([MidiMsg.PC * 16 + 0, 14]);
            }
            //daft punk mais avec kick lourd
            if (param1 == 58) {
                //on se positionne sur le pattern 14
                out.push([MidiMsg.PC * 16 + 0, 13]);
                //on garde kick light, snare et HH light
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_GAN, 127]);
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_LEV_2, 73]);
                Presets.isMute14[KICK_CHANNEL] = false;
                for (let channel of [0,3]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                    Presets.isMute14[channel] = true;
                }
            }
            //stop
            if (param1 == 42) {
                out.push([MidiMsg.STOP]);
            }
        }
        return out;
    });




}

