const MidiRemap = require("./MidiRemap");
const MidiMsg = require("./MidiMsg");
const Graph = require("./Graph");
const Automation = require("./Automation");
const Utils = require("./Utils");

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

    //----- CUSTOM PRESETS "Fruit Touch"


    static bassScale = 0;
    static lastBassNote = 0;
    static tempo = 0;
    static isStarted = false;
    static isMute14 = [false, false, false, false, false, false];
    static curPattern = 0;//0-15

    static volcaSetPattern(num) {
        if (Presets.curPattern != num) {
            return [MidiMsg.PC * 16 + 0, num - 1];
        }
    }

    static touchBoardVolcaTransition = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const CC_LEV_1 = 17;
        const CC_LEV_2 = 18;
        const KICK_CHANNEL = 2;
        const CC_GAN = 52;
        const INITIAL_VOL = [
            [127,127],//bass
            [36,64],//hh
            [70,66],//snare
            [80,80],//melody
            [127,127],//crash
            [75,0],//cocotte
        ];

        if (cmd==MidiMsg.NOTE_ON) {

            //lance JMJ basse seulement
            if (param1 == 52) {
                //on se positionne sur le pattern 16
                if (Presets.curPattern != 15) {
                    out.push([MidiMsg.PC * 16 + 0, 15]);
                    Presets.curPattern = 15;
                 }
                //on mute tout sauf la basse (channel 0)
                for (let i of [1, 2, 4, 5]) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, 0]);
                }
                //on lance
                if (!Presets.isStarted) {
                    out.push([MidiMsg.START]);
                    Presets.isStarted = true;
                }
                //tempo 132
                if (Presets.tempo != 132) {
                    out.push([0, 132]);//custom
                    Presets.tempo = 132;
                }
            }
            //JMJ : lance les drums
            if (param1 == 53) {
                //on démute les trucs
                for(let i = 1;i < 5;i++) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, INITIAL_VOL[i][0]]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, INITIAL_VOL[i][1]]);
                }
            }
            //JMJ : ajoute les cocottes
            if (param1 == 54) {
                //on démute les trucs
                for(let i = 1;i < 6;i++) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, INITIAL_VOL[i][0]]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, INITIAL_VOL[i][1]]);
                }
            }

            //JMJ : ne garde que les drums
            if (param1 == 55) {
                for (let i of [0, 3, 5]) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, 0]);
                }
                for(let i of [1,2,4]) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, INITIAL_VOL[i][0]]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, INITIAL_VOL[i][1]]);
                }
                if (Presets.tempo != 132) {
                    out.push([0,132]);//custom
                    Presets.tempo = 132;
                }
            }
            //JMJ : on change de tempo
            if (param1 == 56) {
                for (let i of [0, 3, 5]) {
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + i, CC_LEV_2, 0]);
                }
                if (Presets.tempo != 112) {
                    out.push([0,112]);//custom
                    Presets.tempo = 112;
                }
            }

            if (param1 == 57) {
                //on se positionne sur le pattern 14
                if (Presets.curPattern != 13) {
                    out.push([MidiMsg.PC * 16 + 0, 13]);
                    Presets.curPattern = 13;
                }
                //on garde kick light, snare et HH light
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_GAN, 20]);
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_LEV_2, 0]);
                Presets.isMute14[KICK_CHANNEL] = true;

                for (let channel of [0,3]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 0]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 0]);
                    Presets.isMute14[channel] = true;
                }
                if (Presets.tempo != 112) {
                    out.push([0,112]);//custom
                    Presets.tempo = 112;
                }
            }
            if (param1 == 58) {//daft punk fill in
                //on se positionne sur le pattern 15
                if (Presets.curPattern != 14) {
                    out.push([MidiMsg.PC * 16 + 0, 14]);
                    Presets.curPattern = 14;
                }
            }
            //daft punk mais avec kick lourd
            if (param1 == 59) {
                //on se positionne sur le pattern 14
                out.push([MidiMsg.PC * 16 + 0, 13]);
                //on garde kick light, snare et HH light
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_GAN, 127]);
                out.push([MidiMsg.CC * 16 + KICK_CHANNEL, CC_LEV_2, 73]);
                Presets.isMute14[KICK_CHANNEL] = false;
                for (let channel of [0,3]) {
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_1, 1]);
                    out.push([MidiMsg.CC * 16 + channel, CC_LEV_2, 1]);
                    Presets.isMute14[channel] = true;
                }
            }
            //stop
            if (param1 == 48) {
                if (Presets.isStarted) {
                    out.push([MidiMsg.STOP]);
                    Presets.isStarted = false;
                }
            }
        }
        return out;
    });

    static touchBoardVolcaJMJ = new MidiRemap((cmd, channel, param1, param2) => {
        let out = [];
        const BASS_CHANNEL = 0;
        const LEAD_CHANNEL = 3;
        const CC_PITCH_1AND2 = 28;
        const BASS_NOTE_SCALE = [[41, 34, 36, 38], [33, 31, 34, 38]];//fa, sib, do, ré / sol, la, sib, ré
        //const LEAD_NOTE_SCALE = [60, 62, 64, 65, 67, 69, 70, 72];
        const LEAD_NOTE_SCALE = [60, 65, 64, 62, 70, 69, 67, 72];
        if (cmd==MidiMsg.NOTE_ON) {
            //bass
            if (param1 >= 48 && param1 <= 51) {
                let note = BASS_NOTE_SCALE[Presets.bassScale][param1-48];
                out.push([MidiMsg.CC * 16 + BASS_CHANNEL, CC_PITCH_1AND2, 1+note]);
                out.push([MidiMsg.CC * 16 + 5, CC_PITCH_1AND2, 1+note+12]);
                if (note == 38 && Presets.lastBassNote == 36) { //après sib do, on passe sur la 2e scale
                    Presets.bassScale = 1;
                }
                if (note == 33 && Presets.lastBassNote == 31) { //après sol la, on repasse sur la 1er scale
                    Presets.bassScale = 0;
                }
                Presets.lastBassNote = note;
            }
            //melody
            if (param1 >= 52 && param1 <= 59) {
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL,CC_PITCH_1AND2, 1+LEAD_NOTE_SCALE[param1-52]]);
                out.push([MidiMsg.NOTE_ON * 16 + LEAD_CHANNEL, 60 , 100]);
            }
        }
        return out;
    });




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
        const CC_FLD = 50;
        const CC_PITCH_1AND2 = 28;
        const LEAD_NOTE_SCALE = [57, 59, 60, 62, 64, 67, 69, 72];
        const NOTE_CHANNEL = {49: 3, 50: 5, 51: 0};

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
                out.push([MidiMsg.CC * 16 + LEAD_CHANNEL, CC_FLD, 90]);
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
                if (ms<300) {
                    return [[MidiMsg.CC * 16 + CHANNEL, CC_FLD, 90]];
                }
                else if (ms>800) {
                    return [[MidiMsg.CC * 16 + CHANNEL, CC_FLD, 70]];

                }
                else {
                    let fld = Math.round(Utils.transposeValue(ms,300,800,90,70));
                    return [[MidiMsg.CC * 16 + CHANNEL, CC_FLD, fld]];
                }
                //return [[MidiMsg.CC * 16 + CHANNEL, CC_FLD, Math.round(Graph.osc(ms, 10, 2000, 80, 0.125))]];
            },
            25,
            {'noteMin':52, 'noteMax':59}
        )
    );






}

