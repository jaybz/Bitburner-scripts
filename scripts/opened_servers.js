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
	const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    const playerLevel = ns.getHackingLevel();
	const servers = list_servers(ns).filter(s => ns.hasRootAccess(s)).filter(s => !ns.getServer(s).purchasedByPlayer);
    for(const server of servers) {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
        const level = ns.getServerRequiredHackingLevel(server);
        const levelAlert = playerLevel < level ? '!' : '';
        const ports = ns.getServerNumPortsRequired(server);
        const backdoorIndicator = ns.getServer(server).backdoorInstalled || (playerLevel < level) ? '' : '@';
        ns.tprint(`${backdoorIndicator}${server}(${ports}/${level}${levelAlert}) is opened. ${used} GB / ${max} GB (${(100*used/max).toFixed(2)}%)`)
    }
}