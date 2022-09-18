const weakenScript = 'weaken.js';
const growScript = 'grow.js';
const hackScript = 'hack.js';

var scriptPath = '';

function computeSingleBatchRAM(ns) {
    return (ns.getScriptRam(scriptPath + weakenScript) * 2) +
        ns.getScriptRam(scriptPath + growScript) +
        ns.getScriptRam(scriptPath + hackScript);
}

async function runSingleBatch(ns, host, target, threadCount, weakenTime, growTime, hackTime, securityThreshold, moneyThreshold, gapDelay) {
    const growDelay = (weakenTime - growTime) - gapDelay;
    const hackDelay = (growTime - hackTime) - (gapDelay * 2);

    var promises = [];

    promises.push(weaken(ns, host, target, threadCount));
    await ns.asleep(gapDelay * 2);
    promises.push(weaken(ns, host, target, threadCount));
    await ns.asleep(growDelay);
    promises.push(grow(ns, host, target, threadCount));
    await ns.asleep(hackDelay);
    if ((ns.getServerSecurityLevel(target) <= securityThreshold) &&
        (ns.getServerMoneyAvailable(target) >= moneyThreshold)) {
            promises.push(hack(ns, host, target, threadCount));
        }
    await ns.asleep(hackTime + (gapDelay * 4));
    await Promise.all(promises);
}

async function runScript(ns, script, host, threadCount, target) {
    await ns.exec(scriptPath + script, host, threadCount, target, Math.random().toString(16).slice(-6));
}

async function weaken(ns, host, target, threadCount) {
    await runScript(ns, weakenScript, host, threadCount, target)
}

async function grow(ns, host, target, threadCount) {
    await runScript(ns, growScript, host, threadCount, target)
}

async function hack(ns, host, target, threadCount) {
    await runScript(ns, hackScript, host, threadCount, target)
}

/** @param {NS} ns */
export async function main(ns) {
    var path = ns.getScriptName();
    scriptPath = path.substring(0, path.lastIndexOf('/'));
    if (scriptPath.length > 0) scriptPath += '/';
    ns.disableLog('asleep');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMoneyAvailable');

    const host = ns.getHostname();
    const target = ns.args[0];
    const moneyThreshold = ns.getServerMaxMoney(target) * 0.75;
    const securityThreshold = ns.getServerMinSecurityLevel(target) + 5;
    const batches = 3;
    const singleBatchRAM = computeSingleBatchRAM(ns);
    const threadCount = Math.trunc(((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / singleBatchRAM) / 3);

    ns.tprint(`Money threshold: ${ns.nFormat(moneyThreshold, "$0.000a")}`);
    ns.tprint(`Security threshold: ${securityThreshold}`);
    ns.tprint(`Single Batch RAM: ${singleBatchRAM}`);
    ns.tprint(`Thread Count: ${threadCount}`);

    /*
    ns.print(`Priming ${target}`);
    // prime target
    while (true) {
        if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
            await ns.grow(target);
        } else {
            break;
        }
    }
    */

    // batch farm target
    ns.print(`Farming ${target}`);
    const gapDelay = 100;
    var promises = [];
    while (true) {
        while(promises.length < batches) {
            const weakenTime = Math.ceil(ns.getWeakenTime(target));
            const growTime = Math.ceil(ns.getGrowTime(target));
            const hackTime = Math.ceil(ns.getHackTime(target));
            const cycleDelay = gapDelay * 4;
            ns.print(`Firing up single batch`);
            promises.push(runSingleBatch(ns, host, target, threadCount, weakenTime, growTime, hackTime, securityThreshold, moneyThreshold, gapDelay));
            await ns.asleep(cycleDelay);
        }

        ns.print(`Waiting for oldest batch to finish...`);
        await promises[0]; // wait for first promise to finish
        promises = promises.splice(1);

        ns.print(`Finished, batches left: ${promises.length}`);
        await ns.asleep(1);
    }
}