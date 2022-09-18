/** @param {NS} ns */
export async function main(ns) {
	const servers = ns.getPurchasedServers();
	servers.forEach(server => {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
		ns.tprint(`${server}: ${used} GB / ${max} GB (${(100*used/max).toFixed(2)}%)`)
	});
}