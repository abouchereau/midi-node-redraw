const Utils = require("./lib/Utils");
const spawn = require('child_process').spawn;
const HOME_DIR = require('os').homedir();
const RECORD_DIR = HOME_DIR+"/usb-key-01/";



let recordAudioProcess = spawn("arecord",["-f","cd",RECORD_DIR+"in_"+Utils.getFormattedDate()+".wav"],{detached:true,stdio:['ignore',1,2]});


setTimeout(()=>{
    process.kill(-recordAudioProcess.pid);
},5000);