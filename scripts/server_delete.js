/** @param {NS} ns */
export async function main(ns) {
	const args = ns.flags([["help", false]]);
    if (args.help || args._.length < 1) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()} HOSTNAME`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} defunct-server`);
        return;
    }

	const hostname = args._[0];
    ns.killall(hostname);
	ns.deleteServer(hostname);
}