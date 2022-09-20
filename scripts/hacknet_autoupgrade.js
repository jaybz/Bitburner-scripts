function computeProduction(ns, level, ram, cores, mult = 1) {
    if(ns.fileExists('Formulas.exe', 'home')) // if you have access to formulas, this should be more precise
        return ns.formulas.hacknetNodes.moneyGainRate(level, ram, cores, mult);
	else
        return (level * 1.6) * Math.pow(1.035, (ram - 1)) * ((cores + 5) / 6) * mult * 0.9375;
}

function getProductionStats(ns, nodeNum) {
	var stats = {};
	const node = ns.hacknet.getNodeStats(nodeNum);
	var current = computeProduction(ns, node.level, node.ram, node.cores);

	if (ns.hacknet.getLevelUpgradeCost(nodeNum, 1) < Infinity)
		stats.level = computeProduction(ns, node.level + 1, node.ram, node.cores) - current;
	else
		stats.level = 0;

	if (ns.hacknet.getRamUpgradeCost(nodeNum, 1) < Infinity)
		stats.ram = computeProduction(ns, node.level, node.ram * 2, node.cores) - current;
	else
		stats.ram = 0;

	if (ns.hacknet.getCoreUpgradeCost(nodeNum, 1) < Infinity)
		stats.core = computeProduction(ns, node.level, node.ram, node.cores + 1) - current;
	else
		stats.core = 0;

	return stats;
}

/** @param {import(".").NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep')

	while(true) {
		var curretMaxRatio = 0;
		var targetNode = 0;
		const nodeCost = ns.hacknet.getPurchaseNodeCost();
		var nodes = [];

		for(var nodeNum=0; nodeNum<ns.hacknet.numNodes(); nodeNum++) {
			const stats = ns.hacknet.getNodeStats(nodeNum);

			stats.levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(nodeNum, 1);
			stats.ramUpgradeCost = ns.hacknet.getRamUpgradeCost(nodeNum, 1);
			stats.coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(nodeNum, 1);

			const upgradeStats = getProductionStats(ns, nodeNum);
			stats.levelUpgrade = upgradeStats.level;
			stats.ramUpgrade = upgradeStats.ram;
			stats.coreUpgrade = upgradeStats.core;

			stats.levelUpgradeRatio = stats.levelUpgrade / stats.levelUpgradeCost;
			stats.ramUpgradeRatio = stats.ramUpgrade / stats.ramUpgradeCost;
			stats.coreUpgradeRatio = stats.coreUpgrade / stats.coreUpgradeCost;

			stats.maxRatio = Math.max(stats.levelUpgradeRatio, stats.ramUpgradeRatio, stats.coreUpgradeRatio);

			if (stats.maxRatio > curretMaxRatio) {
				targetNode = nodeNum;
				curretMaxRatio = stats.maxRatio;
			}

			nodes[nodeNum] = stats;
		}

		var targetStats = nodes.length > 0 ? nodes[targetNode] : 0;
		var nodeUpgradeType = '';
		var nodeUpgradeCost = 0;

		if(targetStats.maxRatio > 0) {
			switch(targetStats.maxRatio) {
				case targetStats.levelUpgradeRatio:
					nodeUpgradeType = 'level';
					nodeUpgradeCost = targetStats.levelUpgradeCost;
					break;
				case targetStats.ramUpgradeRatio:
					nodeUpgradeType = 'RAM';
					nodeUpgradeCost = targetStats.ramUpgradeCost;
					break;
				case targetStats.coreUpgradeRatio:
					nodeUpgradeType = 'cores';
					nodeUpgradeCost = targetStats.coreUpgradeCost;
					break;
			}
		} else {
			for (var i=0; i<ns.hacknet.numNodes(); i++) {
				if(ns.hacknet.getCacheUpgradeCost(i, 1) < Infinity) {
					nodeUpgradeType = 'cache';
					targetNode = i;
					nodeUpgradeCost = Infinity;
				}
			}
		}

		if ((nodeUpgradeCost < nodeCost && nodeUpgradeCost > 0) || ns.hacknet.maxNumNodes() <= ns.hacknet.numNodes()) {
			ns.print(`Upgrading ${nodeUpgradeType} on ${targetStats.name} as soon as it is affordable...`);
			switch(nodeUpgradeType) {
				case 'level':
					while(ns.hacknet.getLevelUpgradeCost(targetNode, 1) > ns.getPlayer().money) await ns.sleep(100);
					ns.hacknet.upgradeLevel(targetNode, 1);
					break;
				case 'RAM':
					while(ns.hacknet.getRamUpgradeCost(targetNode, 1) > ns.getPlayer().money) await ns.sleep(100);
					ns.hacknet.upgradeRam(targetNode, 1);
					break;
				case 'cores':
					while(ns.hacknet.getCoreUpgradeCost(targetNode, 1) > ns.getPlayer().money) await ns.sleep(100);
					ns.hacknet.upgradeCore(targetNode, 1);
					break;
				case 'cache':
					while(ns.hacknet.getCacheUpgradeCost(targetNode, 1) > ns.getPlayer().money) await ns.sleep(100);
					ns.hacknet.upgradeCache(targetNode, i);
					break;
				default:
					ns.print('Could not get upgrade type, perhaps you are maxed out?');
					return;
			}
		} else {
			ns.print('Purchasing new node as soon as it is affordable...');
			while(nodeCost > ns.getPlayer().money) await ns.sleep(100);
			ns.hacknet.purchaseNode();
		}

		await ns.asleep(1); // let's not kill the server if we have a lot of money
	}
}