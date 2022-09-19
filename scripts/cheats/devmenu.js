function getProps(obj) {
    return Object.entries(obj).find(entry => entry[0].startsWith("__reactProps"))[1].children.props;
}

/** @param {import(".").NS} ns **/
export async function main(ns) {
    let boxes = Array.from(eval("document").querySelectorAll("[class*=MuiBox-root]"));
    let box = boxes.find(s => getProps(s)?.player);
    if (!box) return;
    let props = getProps(box);
    props.router.toDevMenu();
}