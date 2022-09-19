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
	const servers = list_servers(ns).filter(s => ns.hasRootAccess(s)).filter(s => ns.getServerMaxMoney(s) > 0).filter(s => !ns.getPurchasedServers().includes(s)).sort((a,b) => ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a));
    for(const server of servers) {
        const used = ns.getServerUsedRam(server);
        const max = ns.getServerMaxRam(server);
        const level = ns.getServerRequiredHackingLevel(server);
        if(playerLevel >= level) {
            const money = ns.getServerMoneyAvailable(server);
            const maxMoney = ns.getServerMaxMoney(server);
            const minSec = ns.getServerMinSecurityLevel(server);
            const sec = ns.getServerSecurityLevel(server);
            const backdoorIndicator = ns.getServer(server).backdoorInstalled ? '' : '@';

            ns.tprint(`${backdoorIndicator}${server}(${level}) is opened. ${used}/${max} GB (${(100*used/max).toFixed(2)}%). ${ns.nFormat(money, "$0.000a")}/${ns.nFormat(maxMoney, "$0.000a")} - ${minSec}/${sec}`)
        }
    }
}