// Original taken from https://gist.github.com/nanodn/11979b481d41eeab980170cb7487953c
import { ServerNetwork } from "./serverNetwork";


/** @param {NS} ns */
export async function main(ns) {
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
  const server = ns.args[0] || "home";
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
}