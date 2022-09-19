function scan(ns, parent, server, list) {
    const children = ns.scan(server);
    for (let child of children) {
        if (parent === child) {
            continue;
        }
        list.push(child);
        
        scan(ns, server, child, list);
    }
}

export function list_servers(ns) {
    const list = [];
    scan(ns, '', 'home', list);
    return list;
}

/** @param {import(".").NS} ns **/
export async function main(ns) {
    list_servers(ns).filter(s => !ns.getPurchasedServers().includes(s)).concat('home').forEach((server) => {
        ns.ls(server, ".cct").forEach((file) => {
            ns.tprint(`${server}: ${file}`);
        });
    });
}