/** @param {import(".").NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);
    if (args.help || args._.length < 2) {
        ns.tprint("This script lists all servers on which you can run scripts.");
        ns.tprint(`Usage: run ${ns.getScriptName()} hostname RAM`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} server-12345 16`);
        return;
    }

	const hostname = args._[0];
	const ram = args._[1];
	const cost = ns.getPurchasedServerCost(ram);

    if (cost == Infinity) {
        ns.tprint('Ram size must be a power of 2.');
    } else {
        const money = ns.getPlayer().money;
        if (cost > money) {
	        ns.tprint(`Cost for ${ram}gb server is \$${cost} and you only have ${money}.`)
        } else {
            ns.purchaseServer(hostname, ram);
        }
    }
}