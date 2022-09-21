// Original taken from https://gist.github.com/nanodn/11979b481d41eeab980170cb7487953c
import { ServerNetwork } from "./serverNetwork";

/** @param {import(".").NS} ns **/
export async function main(ns) {
  const args = ns.flags([["help", false], ["clipboard", false]]);
  if (args.help) {
    ns.tprint("This script deploys another script on a server with maximum threads possible.");
    ns.tprint(`Usage: run ${ns.getScriptName()} HOSTNAME`);
    ns.tprint("Example:");
    ns.tprint(`> run ${ns.getScriptName()} n00dles`);
    return;
  }

  const style = {
    graph: "bgcolor=transparent pad=0.4",
    edge: "color=gray len=2 arrowhead=open",
    node:
      'color="#222222" fillcolor="#333333" tooltip="Unknown" ' +
      "fontcolor=white fontname=Courier fontsize=18 " +
      "margin=0.05 penwidth=4 shape=rectangle style=filled",
    playerNode: 'color="#224444" fillcolor="#336666" tooltip="Purchased"',
    hackableNode: 'color="#88AA22" fillcolor="#336633" tooltip="Hackable"',
    backdooredNode: 'color="#AA4422" fillcolor="#336633" tooltip="Backdoored"',
    rootedNode: 'color="#224422" fillcolor="#336633" tooltip="Rooted"',
    rootableNode: 'color="#224422" fillcolor="#666633" tooltip="Rooted"',
    secureNode: 'color="#442222" fillcolor="#663333" tooltip="Secure"',
  };
  const server = args._[0] || "home";
  // you can also download https://nanodn.github.io/hpccWasm/graphvizlib.wasm
  // and use the absolute path to the download folder
  const wasmFolder = "https://nanodn.github.io/hpccWasm/";
  const network = new ServerNetwork(ns, style, wasmFolder);
  const svg = await network.generateSVGElement(server);
  const mult = 0.75;
  svg.setAttribute("width", `${parseInt(svg.getAttribute("width")) * mult}`);
  svg.setAttribute("height", `${parseInt(svg.getAttribute("height")) * mult}`);
  await ns.asleep(20); // so the graph appears after clears
  eval("document").getElementById("terminal").appendChild(svg);
  ns.tprintf(network.getPath("home", server).join(" -> "));
  if(args.clipboard) {
    const path = network.getPath("home", server).join(" ; connect ");
    await navigator.clipboard.writeText(path);
  }
}

/** @param {import(".").AutocompleteData} data **/
export function autocomplete(data, args) {
  return data.servers.concat('--clipboard');
}
