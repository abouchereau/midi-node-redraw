const blinkstick = require('blinkstick');

module.exports = class LedControl {

    static get LED_RECORD_AUDIO() {return 7;}

    leds = null;
    intervalRecord = null;
    blinkBoolRecord = true;

    constructor() {
        this.leds = blinkstick.findFirst();
        this.startDemo();
    }

    startDemo() {
        if (this.leds != null) {
            for(let i=0;i<7;i++) {
                this.leds.setColor("green", {"index": i});
            }
        }
    }

    setNum(num) {
        if (this.leds != null) {
            for (let i = 0; i < 7; i++) {
                if (i == num) {
                    this.leds.setColor("green", {"index": i});
                } else {
                    this.leds.setColor("black", {"index": i});
                }
            }
        }
    }

    startRecord() {
        if (this.leds != null) {
            this.intervalRecord = setInterval(() => {
                if (this.blinkBoolRecord) {
                    this.leds.setColor('red', {"index": LedControl.LED_RECORD_AUDIO});
                } else {
                    this.leds.setColor('black', {"index": LedControl.LED_RECORD_AUDIO});
                }
                this.blinkBoolRecord = !this.blinkBoolRecord;
            }, 250);
        }
    }

    stopRecord() {
        if (this.leds != null) {
            this.blinkBoolRecord = true;
            clearInterval(this.intervalRecord);
            this.leds.setColor('black', {"index": LedControl.LED_RECORD_AUDIO});
        }
    }

}