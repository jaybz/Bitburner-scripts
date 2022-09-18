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

/** @param {NS} ns */
export async function main(ns) {
	const args = ns.flags([["help", false]]);
	if (args.help || args._.length < 1) {
		ns.tprint("This script deploys another script on a server with maximum threads possible.");
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT OPTIONAL_ADDITIONAL_ARGUMENTS`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} basic_hack.js optional1 optional2`);
		return;
	}

	const script = args._[0];
	const script_args = args._.splice(1);

	if (!ns.ls(ns.getHostname()).find(f => f === script)) {
		ns.tprint(`Script '${script}' does not exist. Aborting.`);
		return;
	}

	const host_list = list_servers(ns).filter(s => ns.hasRootAccess(s)).filter(s => ns.getServerMaxRam(s) > 0).filter(s => !ns.getPurchasedServers().includes(s));
	for(var hostnum = 0; hostnum < host_list.length; hostnum++)	{
		var host = host_list[hostnum];

		if (ns.serverExists(host)) {
			ns.tprint(`Deploying ${script} to ${host}...`);
			ns.tprint(`Copying '${script}' to server '${host}'...`);
			await ns.scp(script, host, 'home');
			ns.tprint(`Killing all scripts on server '${host}'...`);
			ns.killall(host, true);
			var threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));
			ns.tprint(`Launching script '${script}' on server '${host}' with ${threads} threads and the following arguments: ${script_args}`);
			ns.exec(script, host, threads, ...script_args);
			await ns.sleep(1); // just so we can output "realtime" progress
		} else {
			ns.tprint(`Server '${host}' does not exist. Skipped.`);
		}
	}
}