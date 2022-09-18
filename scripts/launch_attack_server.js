/** @param {NS} ns */
export async function main(ns) {
	const args = ns.flags([["help", false]]);
    if (args.help || args._.length < 2) {
        ns.tprint("This script buys a server and targets a server for hacking.");
        ns.tprint(`Usage: run ${ns.getScriptName()} SERVER_HOSTNAME RAM TARGET_HOSTNAME `);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} 1024 n00dles`);
        return;
    }

	const ram = args._[0];
	const target = args._[1];
	const hostname = `${target}-farmer`;
	const cost = ns.getPurchasedServerCost(ram);
    const script = 'advanced_farm.js';

	if (!ns.ls(ns.getHostname()).find(f => f === script)) {
		ns.tprint(`Script '${script}' does not exist. Aborting.`);
	} else if(!ns.serverExists(target)) {
        ns.tprint(`${target} does not exist.`);
    } else if (cost <= ns.getPurchasedServerMaxRam()) {
        ns.tprint(`Ram size must be ${ns.getPurchasedServerMaxRam()} or less.`);
    } else if (cost == Infinity) {
        ns.tprint('Ram size must be a power of 2.');
    } else {
    	const servers = ns.getPurchasedServers();
        
        if (servers.includes(hostname)) {
            if(ns.getServerMaxRam(hostname) < ram) {
                ns.tprint(`${hostname} already exists but has less than the desired amount of ram.`)
                return;
            } else {
                ns.tprint(`${hostname} already exists and the desired amount of ram or more.`)
            }
        } else {
           const money = ns.getPlayer().money;
            if (cost > money) {
                ns.tprint(`Cost for ${ram}gb server is \$${cost} and you only have ${money}.`)
                ns.tprint(`${ram}GB server bought, uploading ${script}...`)
                return;
            } else
                ns.purchaseServer(hostname, ram);
        }

        await ns.scp(script, hostname, 'home');
        const threads = Math.floor(ns.getServerMaxRam(hostname) / ns.getScriptRam(script));
        ns.tprint(`Launching script '${script}' on server '${hostname}' with ${threads} threads and the following arguments: ${target}`);
        ns.killall(hostname);
        ns.exec(script, hostname, threads, target);
    }
}