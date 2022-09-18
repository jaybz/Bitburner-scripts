// Original taken from https://gist.github.com/nanodn/11979b481d41eeab980170cb7487953c

import * as hpccWasm from "https://cdn.skypack.dev/@hpcc-js/wasm";

/**
 * @typedef {Object} ServerNetworkDotStyle
 * @property {String} graph
 * @property {String} edge
 * @property {String} node
 * @property {String} playerNode
 * @property {String} hackableNode
 * @property {String} backdooredNode
 * @property {String} rootedNode
 * @property {String} rootableNode
 * @property {String} secureNode
 */

export class ServerNetwork {
    /**
     * @param {NS} ns
     * @param {ServerNetworkDotStyle} style
     * @param {string} wasmFolder - https://nanodn.github.io/hpccWasm/graphvizlib.wasm
     */
    constructor(ns, style, wasmFolder) {
        /** @type {NS} */
        this.ns = ns;
        /** @type {ServerNetworkDotStyle} */
        this.style = style;
        this.setWasmFolder(wasmFolder);
    }

    setWasmFolder(wasmFolder) {
        hpccWasm.wasmFolder(wasmFolder);
    }

    /** @param {ServerNetworkDotStyle} style */
    setStyle(style) {
        this.style = style;
    }

    getGraph(root = "home") {
        let adjs = {};
        const func = (r) => {
            adjs[r] = this.ns.scan(r).filter(s => !this.ns.getPurchasedServers().includes(s)).filter((v) => !Object.keys(adjs).includes(v));
            for (let n of adjs[r]) func(n);
        };
        func(root);
        return adjs;
    }

    getPath(from, to) {
        const graph = this.getGraph(from);
        let queue = [[from]];
        while (queue.length > 0) {
            let path = queue.shift();
            let node = path.slice(-1)[0];
            if (node === to) return path;
            if (!Object.keys(graph).includes(node)) return null;
            for (let adjacent of graph[node]) {
                let newPath = path.slice();
                newPath.push(adjacent);
                queue.push(newPath);
            }
        }
        return null;
    }

    generateDot(root = "home") {
        const graph = this.getGraph(root);
        const playerHackingSkill = this.ns.getHackingLevel();
        let playerPortCount = 0;

        if (this.ns.fileExists('BruteSSH.exe', 'home'))
            playerPortCount++;

        if (this.ns.fileExists('FTPCrack.exe', 'home'))
            playerPortCount++;

        if (this.ns.fileExists('relaySMTP.exe', 'home'))
            playerPortCount++;

        if (this.ns.fileExists('HTTPWorm.exe', 'home'))
            playerPortCount++;

        if (this.ns.fileExists('SQLInject.exe', 'home'))
            playerPortCount++;

        let dot = [];
        dot.push("strict digraph G {");
        dot.push(`  graph [${this.style.graph}]`);
        dot.push(`  edge [${this.style.edge}]`);
        dot.push(`  node [${this.style.node}]`);
        const nodeStyles = [
            this.style.playerNode,
            this.style.hackableNode,
            this.style.backdooredNode,
            this.style.rootedNode,
            this.style.rootableNode,
            this.style.secureNode,
        ];
        let nodes = [[], [], [], [], [], []],
            edges = [];
        Object.entries(graph).forEach(([k, v]) => {
            const server = this.ns.getServer(k);
            const hasRootAccess = this.ns.hasRootAccess(k);
            if (server.purchasedByPlayer) {
                nodes[0].push(k);
            } else if (server.backdoorInstalled) {
                nodes[2].push(k);
            } else if (hasRootAccess && (server.requiredHackingSkill <= playerHackingSkill)) {
                nodes[1].push(k);
            } else if (hasRootAccess) {
                nodes[3].push(k);
            } else if (this.ns.getServerNumPortsRequired(k) <= playerPortCount) { // check if rootable
                nodes[4].push(k);
            } else {
                nodes[5].push(k);
            }
            if (v.length > 0) edges.push(`  "${k}" -> "${v.sort().join('", "')}"`);
        });
        nodes.forEach((v, i) => {
            if (v.length > 0) {
                dot.push(`  "${v.sort().join('", "')}" [${nodeStyles[i]}]`);
            }
        });
        dot = dot.concat(edges);
        dot.push("}");
        return dot.join("\n");
    }

    async generateSVGElement(root = "home", layout = "dot") {
        const dot = this.generateDot(root);
        /** @type {HTMLDivElement} */
        const div = eval("document").createElement("div");
        div.innerHTML = await hpccWasm.graphviz.layout(dot, "svg", layout);
        return div.children[0];
    }
}
