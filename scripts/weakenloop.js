/** @param {NS} ns */
export async function main(ns) {
	var host = ns.args[0];
	while(true) {
		try {
			await ns.weaken(host);
		} catch {
			ns.print(`Could not hack ${host}, retrying...`);
		}
	}
}