function scan(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent == child) {
            continue;
        }
        list.push(child);
        
        scan(ns, server, child, list);
    }
}

export function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {import(".").NS} ns **/
export async function main(ns) {
	const servers = list_servers(ns).filter(s => ns.getServer(s).purchasedByPlayer);
	servers.forEach(server => {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
		ns.tprint(`${server}: ${used} GB / ${max} GB (${(100*used/max).toFixed(2)}%)`)
	});
	if(ns.getPurchasedServerLimit() == 0) {
		ns.tprint('NOTE: You are now using Hacknet servers instead of purchased servers.');
	}
}