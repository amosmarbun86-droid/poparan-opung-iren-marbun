export function buildTree(people) {

  let map = {};
  let root = null;

  people.forEach(p => {
    map[p.id] = {
      ...p,
      children: []
    };
  });

  people.forEach(p => {

    if (p.father_id && map[p.father_id]) {
      map[p.father_id].children.push(map[p.id]);
    }

    else {
      root = map[p.id];
    }
  });

  return root;
}

export function drawTree(data) {

  const container = document.getElementById("tree");

  container.innerHTML = "";

  const width = container.clientWidth;
  const height = container.clientHeight;

  const root = d3.hierarchy(data);

  const treeLayout = d3.tree()
    .nodeSize([150,110]);

  treeLayout(root);

  const svg = d3.select("#tree")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g");

  g.selectAll("path.link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d => `
      M${d.source.x},${d.source.y}
      C${d.source.x},${(d.source.y+d.target.y)/2}
       ${d.target.x},${(d.source.y+d.target.y)/2}
       ${d.target.x},${d.target.y}
    `);

  const node = g.selectAll("g.node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("rect")
    .attr("x", -60)
    .attr("y", -25)
    .attr("width", 120)
    .attr("height", 55);

  node.append("text")
    .attr("text-anchor", "middle")
    .text(d => d.data.name);
}
