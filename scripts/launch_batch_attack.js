/** @param {import(".").NS} ns **/

const batchScriptPath = '/batcher/';
const batchScripts = ['batch_farm.js', 'grow.js', 'hack.js', 'weaken.js'];

function checkScripts(ns) {
    const files = ns.ls(ns.getHostname(), '/batcher/');

    for(var i=0; i<batchScripts.length; i++) {
        const script = batchScriptPath + batchScripts[i]
        if (!files.find(f => f === script)) {
            ns.tprint(`${script} was not found.`)
            return false;
        }
    }

    return true;
}

export async function main(ns) {
	const args = ns.flags([["help", false], ["force", false]]);
    if (args.help || args._.length < 2) {
        ns.tprint("This script buys a server and targets a server for hacking.");
        ns.tprint(`Usage: run ${ns.getScriptName()} RAM TARGET_HOSTNAME `);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} 1024 n00dles`);
        return;
    }

	const ram = args._[0];
	const target = args._[1];
	const hostname = `${target}-farmer`;
	const cost = ns.getPurchasedServerCost(ram);

	if (!checkScripts(ns)) {
		ns.tprint('Aborting');
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
                if(args.force) {
                    ns.tprint(`${hostname} already exists but has less than the desired amount of ram.`)
                    const money = ns.getPlayer().money;
                    if (cost > money) {
                        ns.tprint(`The --force parameter was used, however, the cost for ${ram}gb server is ${ns.nFormat(cost, "$0.000a")} and you only have ${ns.nFormat(money, "$0.000a")}.`)
                        return;
                    } else {
                        ns.tprint(`The --force parameter was used, deleting old server and purchasing a new one...`)
                        ns.killall(hostname);
                        ns.deleteServer(hostname);
                        ns.purchaseServer(hostname, ram);
                        ns.tprint(`${ram}GB server bought, uploading scripts...`)
                    }
                } else {
                    ns.tprint(`${hostname} already exists but has less than the desired amount of ram.`)
                    ns.tprint(`Use --force to delete old server and create a new one`)
                    return;
                }
            } else {
                ns.tprint(`${hostname} already exists with the desired amount of ram or more, uploading scripts...`)
            }
        } else {
            const money = ns.getPlayer().money;
            if (cost > money) {
                ns.tprint(`Cost for ${ram}gb server is ${ns.nFormat(cost, "$0.000a")} and you only have ${ns.nFormat(money, "$0.000a")}.`)
                return;
            } else {
                ns.purchaseServer(hostname, ram);
                ns.tprint(`${ram}GB server bought, uploading scripts...`)
            }
        }

        for(var i=0; i<batchScripts.length; i++) {
            const script = batchScriptPath + batchScripts[i];
            await ns.scp(script, hostname, 'home');
            await ns.mv(hostname, script, batchScripts[i]);
        }

        const mainScript = batchScripts[0];
        ns.tprint(`Launching script '${mainScript}' on server '${hostname}' with the following arguments: ${target}`);
        ns.killall(hostname);
        ns.exec(mainScript, hostname, 1, target);
    }
}