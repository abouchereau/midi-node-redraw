module.exports = class Graph {

    static triangle(a, b, c, d, e=null) {//triangle x, period, height, offset, limit=null
        if (e != null && a > e) {
            a = e;
        }
        //(A/P) * (P - abs(x % (2*P) - P) )
        //return Math.abs(Utils.mod(x, period) - (min+max)) + min ;
        return (c/b) * (b - Shortcut.mAbs(a % (2*b) - b) ) + d;
    }

    static square(a, b, c, d, e=null) {//square
        if (e != null && a > e) {
            a = e;
        }
        return Utils.modulo(a, b) < (b/2) ? d : c;
    }

    static sinus(a, b, c, d, e=null) {
        if (e != null && a > e) {
            a = e;
        }
        return (c/2) * Math.sin(a / (b/2)) + d ;
    }
/*
    function oscillator(time, frequency = 1, amplitude = 1, phase = 0, offset = 0){
        return Math.sin(time * frequency * Math.PI * 2 + phase * Math.PI * 2) * amplitude + offset;
    }*/
    static line(a, b, c, d=null) {//line
        if (d != null && a > d) {
            a = d;
        }
        return a * b + c ;
    }
}