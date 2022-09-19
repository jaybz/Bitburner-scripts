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
    if (args.help || args._.length < 1) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()} FILE OPTIONAL_ADDITIONAL_ARGUMENTS`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} basic_farm.js argument1 argument2`);
        return;
    }

	const script = args._[0];
	const script_args = args._.slice(1);

	if (!ns.ls(ns.getHostname()).find(f => f === script)) {
		ns.tprint(`Script '${script}' does not exist. Aborting.`);
		return;
	}

    const playerLevel = ns.getHackingLevel();
	const servers = list_servers(ns).filter(s => ns.hasRootAccess(s)).filter(s => !ns.getPurchasedServers().includes(s));
    for(const host of servers) {
        const used = ns.getServerUsedRam(host);
        const max = ns.getServerMaxRam(host);
        const level = ns.getServerRequiredHackingLevel(host);
        if(playerLevel >= level && max > 0) {
            ns.tprint(`${host}(${level}) is opened. ${used} GB / ${max} GB (${(100*used/max).toFixed(2)}%)`)

			ns.tprint(`Deploying ${script} to ${host}...`);
			ns.tprint(`Copying '${script}' to server '${host}'...`);
			await ns.scp(script, host, 'home');
			ns.tprint(`Killing all scripts on server '${host}'...`);
			ns.killall(host, true);
			var threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));
			ns.tprint(`Launching script '${script}' on server '${host}' with ${threads} threads and the following arguments: ${host} ${script_args}`);
			ns.exec(script, host, threads, host, ...script_args);
        }
    }
}