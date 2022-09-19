/** @param {import(".").NS} ns **/
export async function main(ns) {
    // @ts-ignore
    var player = root.children[0][Object.keys(root.children[0]).find(k => k.startsWith('__reactFiber'))].child.memoizedProps.player;
    var cheatValue = 65126839349012866147782858945901739698196701297231984687019935347913847900486712367486841318432487836196817234789524823889469028361046797815843483218950481374967885092174669016794739859028713240584947609286794776745123532338933957812948673318486093739459837386892734436112561223156123813553137521237443458.873228356;
    player.exp.hacking = cheatValue;
    player.exp.strength = cheatValue;
    player.exp.defense = cheatValue;
    player.exp.dexterity = cheatValue;
    player.exp.agility = cheatValue;
    player.exp.charisma = cheatValue;
}