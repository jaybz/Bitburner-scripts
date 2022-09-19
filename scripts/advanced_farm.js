/** @param {import(".").NS} ns **/
export async function main(ns) {
	const hostname = ns.args[0];
    const moneyThreshold = ns.getServerMaxMoney(hostname) * 0.75;
    const securityThreshold = ns.getServerMinSecurityLevel(hostname) + 5;
    ns.print(`Money threshold: ${ns.nFormat(moneyThreshold, "$0.000a")}`);
    ns.print(`Security threshold: ${securityThreshold}`);
    while (true) {
        if (ns.getServerSecurityLevel(hostname) > securityThreshold) {
            await ns.weaken(hostname);
        } else if (ns.getServerMoneyAvailable(hostname) < moneyThreshold) {
            await ns.grow(hostname);
        } else {
            await ns.hack(hostname);
        }
    }
}