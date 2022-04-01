const HID = require('node-hid');
const clc = require('cli-color');
let devices = HID.devices();
let tab = {};
tab["0"] = [clc.bold("PRODUCT"), clc.bold("VENDOR_ID"),clc.bold("PRODUCT_ID")];
for(let device of devices) {
    let key = device['vendorId']+"-"+device["productId"];
    tab[key] = [device["product"], device["vendorId"]+" ("+device["vendorId"].toString(16)+")",device["productId"]+" ("+device["productId"].toString(16)+")"];
}
process.stdout.write(clc.columns(Object.values(tab)));