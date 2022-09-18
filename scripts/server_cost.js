/** @param {NS} ns */
export async function main(ns) {
	const args = ns.flags([["help", false]]);
    if (args.help || args._.length < 1) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()} RAM`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} 16`);
        return;
    }

	const ram = args._[0];
	const cost = ns.getPurchasedServerCost(ram);

    if (cost == Infinity) {
        ns.tprint('Ram size must be a power of 2.');
    } else {
	    ns.tprint(`Cost for ${ram}gb server is \$${cost}.`)
    }
}