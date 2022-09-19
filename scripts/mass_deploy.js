/** @param {import(".").NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);
	if (args.help || args._.length < 2) {
		ns.tprint("This script deploys another script on a server with maximum threads possible.");
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT HOST_LIST`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} basic_hack.js n00dles foodnstuff`);
		return;
	}

	const script = args._[0];
	const host_list = args._.slice(1);

	if (!ns.ls(ns.getHostname()).find(f => f === script)) {
		ns.tprint(`Script '${script}' does not exist. Aborting.`);
		return;
	}

	for(var hostnum = 0; hostnum < host_list.length; hostnum++)	{
		var host = host_list[hostnum];

		if (ns.serverExists(host)) {
			ns.tprint(`Deploying ${script} to ${host}...`);
			ns.tprint(`Copying '${script}' to server '${host}'...`);
			await ns.scp(script, host, 'home');
			ns.tprint(`Killing all scripts on server '${host}'...`);
			ns.killall(host, true);
			var threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));
			ns.tprint(`Launching script '${script}' on server '${host}' with ${threads} threads and the following arguments: ${host}`);
			ns.exec(script, host, threads, host);
		} else {
			ns.tprint(`Server '${host}' does not exist. Skipped.`);
		}
	}
}