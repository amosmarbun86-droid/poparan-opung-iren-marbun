export function buildTree(people) {

  let map = {};

  let root = null;



  /* =========================
     CREATE MAP
  ========================= */

  people.forEach(person => {

    map[person.id] = {

      ...person,

      children: []

    };

  });



  /* =========================
     LOAD SPOUSE NAME
  ========================= */

  people.forEach(person => {

    if(person.spouse_id){

      const spouse =
      people.find(

        p => p.id === person.spouse_id

      );

      if(spouse){

        map[person.id]
        .spouse_name =
        spouse.name;

      }

    }

  });



  /* =========================
     BUILD TREE
  ========================= */

  people.forEach(person => {

    if(

      person.father_id &&

      map[person.father_id]

    ){

      map[person.father_id]
      .children
      .push(map[person.id]);

    }

    else{

      root = map[person.id];

    }

  });



  return root;

}



/* =========================
   DRAW TREE
========================= */

export function drawTree(data) {

  const container =
  document.getElementById("tree");

  container.innerHTML = "";



  const width =
  container.clientWidth;

  const height =
  container.clientHeight;



  /* =========================
     SVG
  ========================= */

  const svg = d3.select("#tree")

    .append("svg")

    .attr("width", width)

    .attr("height", height);



  /* =========================
     ZOOM
  ========================= */

  const g = svg.append("g");

  svg.call(

    d3.zoom()

      .scaleExtent([0.3, 3])

      .on("zoom", (event)=>{

        g.attr(
          "transform",
          event.transform
        );

      })

  );



  /* =========================
     TREE
  ========================= */

  const root =
  d3.hierarchy(data);

  const treeLayout =
  d3.tree()

    .nodeSize([220,150]);

  treeLayout(root);



  /* =========================
     CENTER TREE
  ========================= */

  const startX =
  width / 2;

  const startY =
  100;

  g.attr(
    "transform",
    `translate(${startX},${startY})`
  );



  /* =========================
     LINK
  ========================= */

  g.selectAll("path.link")

    .data(root.links())

    .enter()

    .append("path")

    .attr("class", "link")

    .attr("fill", "none")

    .attr("stroke", "#00e5ff")

    .attr("stroke-width", 3)

    .attr("stroke-linecap", "round")

    .attr("d", d => `

      M${d.source.x},${d.source.y}

      C${d.source.x},
      ${(d.source.y+d.target.y)/2}

      ${d.target.x},
      ${(d.source.y+d.target.y)/2}

      ${d.target.x},
      ${d.target.y}

    `);



  /* =========================
     NODE
  ========================= */

  const node = g.selectAll("g.node")

    .data(root.descendants())

    .enter()

    .append("g")

    .attr("class", "node")

    .attr(

      "transform",

      d => `
        translate(
          ${d.x},
          ${d.y}
        )
      `
    );



  /* =========================
     NODE BOX
  ========================= */

  node.append("rect")

    .attr("x", -90)

    .attr("y", -40)

    .attr("width", 180)

    .attr("height", 80)

    .attr("rx", 18)

    .attr("fill", "rgba(0,0,0,0.65)")

    .attr("stroke", "#00e5ff")

    .attr("stroke-width", 2)

    .style(
      "filter",
      "drop-shadow(0 0 12px #00e5ff)"
    );



  /* =========================
     NAME
  ========================= */

  node.append("text")

    .attr("text-anchor", "middle")

    .attr("y", -8)

    .attr("fill", "#ffffff")

    .style("font-size", "15px")

    .style("font-weight", "bold")

    .text(d => {

      let text =
      d.data.name;

      if(d.data.spouse_name){

        text +=
        " ❤️ " +
        d.data.spouse_name;

      }

      return text;

    });



  /* =========================
     BIRTH DATE
  ========================= */

  node.append("text")

    .attr("text-anchor", "middle")

    .attr("y", 18)

    .attr("fill", "#cccccc")

    .style("font-size", "12px")

    .text(d => {

      if(d.data.birth_date){

        return d.data.birth_date;

      }

      return "";

    });



  /* =========================
     GENDER
  ========================= */

  node.append("text")

    .attr("text-anchor", "middle")

    .attr("y", 36)

    .attr("fill", "#00e5ff")

    .style("font-size", "11px")

    .text(d => {

      if(d.data.gender === "male"){

        return "♂ Laki-laki";

      }

      if(d.data.gender === "female"){

        return "♀ Perempuan";

      }

      return "";

    });



  /* =========================
     ANIMATION
  ========================= */

  node

    .style("opacity", 0)

    .transition()

    .duration(800)

    .style("opacity", 1);

}

/* =========================
   CLICK NODE
========================= */

node

.style("cursor","pointer")

.on("click",(event,d)=>{

  if(window.openModal){

    window.openModal(d.data);

  }

});
