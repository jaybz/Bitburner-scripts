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

/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);
    if (args.help) {
        ns.tprint("This script lists all servers on which you can nuke.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} 3`);
        return;
    }

    var playerPorts = 0;

    if (ns.fileExists('BruteSSH.exe', 'home'))
        playerPorts++;

    if (ns.fileExists('FTPCrack.exe', 'home'))
        playerPorts++;

    if (ns.fileExists('relaySMTP.exe', 'home'))
        playerPorts++;

    if (ns.fileExists('HTTPWorm.exe', 'home'))
        playerPorts++;

    if (ns.fileExists('SQLInject.exe', 'home'))
        playerPorts++;

    const playerLevel = ns.getHackingLevel();
	const servers = list_servers(ns).filter(s => !ns.hasRootAccess(s));
    for(const server of servers) {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
        const level = ns.getServerRequiredHackingLevel(server);
        const levelAlert = playerLevel < level ? '!' : '';
        const ports = ns.getServerNumPortsRequired(server);
        if(playerPorts >= ports) {
            ns.tprint(`${server}(${ports}/${level}${levelAlert}) is rootable. ${used} GB / ${max} GB (${(100*used/max).toFixed(2)}%)`)
        }
    }
}