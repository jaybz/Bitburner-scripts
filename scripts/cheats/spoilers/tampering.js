/** @param {import(".").NS} ns **/
export async function main(ns) {
    //Number.prototype.toExponentialOriginal = Number.prototype.toExponential;
    //Number.prototype.toExponential = function() { return this == 55 ? this.toExponentialOriginal()+1:this.toExponentialOriginal(); };
    ns.tprint((55).toExponential());
    ns.tprint((55).toExponentialOriginal());
}