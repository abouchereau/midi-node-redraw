
module.exports = class Utils {

    //positive modulo
    static mod(n, m) {
        return ((n % m) + m) % m;
    }
    static transposeValue(a,b,c,d,e) {//value,min from, max from, min to, max to
        return ((a-b)/(c-b))*(e-d)+d;
    }

    static arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    static cloneArray(arr) {
        return arr.slice();
    }

    static getFormattedDate(timestamp=null) {
        let date = new Date();
        if (timestamp != null) {
            date = new Date(timestamp);
        }
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let min = date.getMinutes();
        let sec = date.getSeconds();
        month = (month < 10 ? "0" : "") + month;
        day = (day < 10 ? "0" : "") + day;
        hour = (hour < 10 ? "0" : "") + hour;
        min = (min < 10 ? "0" : "") + min;
        sec = (sec < 10 ? "0" : "") + sec;
        let str = date.getFullYear() + "-" + month + "-" + day + "_" +  hour + "-" + min + "-" + sec;
        return str;
    }

    static hexVal(a,b=2) {
        return ("0000"+a.toString(16).toUpperCase()).slice(-1*b);
    }

    static arrayEquals(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }
}