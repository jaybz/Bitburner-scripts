/** @param {NS} ns */

function computeProduction(ns, level, ram, cores, mult = 1) {
    if(ns.fileExists('Formulas.exe', 'home')) // if you have access to formulas, this should be more precise
        return ns.formulas.hacknetNodes.moneyGainRate(level, ram, cores, mult);
	else
        return (level * 1.6) * Math.pow(1.035, (ram - 1)) * ((cores + 5) / 6) * mult * 0.9375;
}

function getProductionStats(ns, level, ram, cores) {
	var stats = {};
	var current = computeProduction(ns, level, ram, cores);

	if (level < 200)
		stats.level = computeProduction(ns, level + 1, ram, cores) - current;
	else
		stats.level = 0;

	if (ram < 64)
		stats.ram = computeProduction(ns, level, ram * 2, cores) - current;
	else
		stats.ram = 0;

	if (cores < 16)
		stats.core = computeProduction(ns, level, ram, cores + 1) - current;
	else
		stats.core = 0;

	return stats;
}

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

			const upgradeStats = getProductionStats(ns, stats.level, stats.ram, stats.cores);
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

		var targetStats = nodes[targetNode];
		var nodeUpgradeType = '';
		var nodeUpgradeCost = 0;

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

		if (nodeUpgradeCost < nodeCost && nodeUpgradeCost > 0) {
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
				default:
					ns.print('Could not get upgrade type!');
					await ns.sleep(1000);
			}
		} else {
			ns.print('Purchasing new node as soon as it is affordable...');
			while(nodeCost > ns.getPlayer().money) await ns.sleep(100);
			ns.hacknet.purchaseNode();
		}
	}
}