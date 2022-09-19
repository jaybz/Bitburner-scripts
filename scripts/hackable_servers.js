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
function computeProfitability(ns, target) {
    const maxMoney = ns.getServerMaxMoney(target);
    const batchTime = ns.getWeakenTime(target);

    const player = ns.getPlayer();
    const server = ns.getServer(target);
    server.hackDifficulty = server.minDifficulty;
    const hackPercent = ns.formulas.hacking.hackPercent(server, player) * 100;

    return (maxMoney / batchTime) * hackPercent;
}

/** @param {import(".").NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false], ["clipboard", false]]);
    if (args.help) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()}`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()}`);
        return;
    }

    const playerLevel = ns.getHackingLevel();
	const servers = list_servers(ns).filter(s => ns.hasRootAccess(s)).filter(s => ns.getServerMaxMoney(s) > 0).filter(s => !ns.getPurchasedServers().includes(s)).sort((a,b) => computeProfitability(ns,a) - computeProfitability(ns,b));

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
            const profitability = computeProfitability(ns,server);
            const hackPercent = ns.hackAnalyzeChance(server);
            const hackTime = ns.getHackTime(server);

            const player = ns.getPlayer();
            const minDifficultyServer = ns.getServer(server);
            minDifficultyServer.hackDifficulty = minDifficultyServer.minDifficulty;
            const maxHackPercent = ns.formulas.hacking.hackPercent(minDifficultyServer, player) * 100;

            ns.tprint(`${backdoorIndicator}${server}(${level}) can be hacked. ${used}/${max} GB (${(100*used/max).toFixed(2)}%). ${ns.nFormat(money, "$0.000a")}/${ns.nFormat(maxMoney, "$0.000a")} - ${ns.tFormat(hackTime)} - ${minSec}/${sec} - ${(hackPercent*100).toFixed(2)}%/${(maxHackPercent*100).toFixed(2)}% (${ns.nFormat(profitability, "$0.000a")})`)
            ns.asleep(1);
            //ns.tprint(minSecurityServer);
        }
    }

    if (args.clipboard) {
        const bestServers = servers.splice(-25).reverse().join(' ');
        await navigator.clipboard.writeText(bestServers);
        ns.tprint(`Best 25 servers copied to clipboard: ${bestServers}`);
    }
}