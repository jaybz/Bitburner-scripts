/** @param {import(".").NS} ns **/
export async function main(ns) {
    var player = root.children[0][Object.keys(root.children[0]).find(k => k.startsWith('__reactFiber'))].child.memoizedProps.player;
    player.giveExploit("TrueRecursion");
    player.giveExploit("RealityAlteration");
}
