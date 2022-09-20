/** @param {import(".").NS} ns **/
export async function main(ns) {
   const e = globalThis['document'].getElementById("unclickable") ;
   e[Object.keys(e)[1]].onClick({target: e, isTrusted: true});
}