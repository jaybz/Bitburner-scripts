/** @param {import(".").NS} ns **/
export async function main(ns) {
    var player = root.children[0][Object.keys(root.children[0]).find(k => k.startsWith('__reactFiber'))].child.memoizedProps.player;
    //player.gainMoney(893401423591579.610000);
    player.money = 8934014235937609812309871579.610000;
}