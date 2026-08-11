import { calculateAge } from './utils.js';

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
     LOAD SPOUSE / FATHER / MOTHER NAME
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

    if(person.father_id){

      const father =
      people.find(

        p => p.id === person.father_id

      );

      if(father){

        map[person.id]
        .father_name =
        father.name;

      }

    }

    if(person.mother_id){

      const mother =
      people.find(

        p => p.id === person.mother_id

      );

      if(mother){

        map[person.id]
        .mother_name =
        mother.name;

      }

    }

  });



  /* =========================
     BUILD TREE
     Prioritas: Ayah, kalau tidak ada pakai Ibu,
     supaya anak tidak muncul dobel di dua cabang.
  ========================= */

  people.forEach(person => {

    const parentId =
      (person.father_id && map[person.father_id]) ? person.father_id :
      (person.mother_id && map[person.mother_id]) ? person.mother_id :
      null;

    if(parentId){

      map[parentId]
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

    .nodeSize([240,200]);

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

    .attr("class", "node-box")

    .attr("x", -95)

    .attr("y", -50)

    .attr("width", 190)

    .attr("height", 110)

    .attr("rx", 18);



  /* =========================
     NAME
  ========================= */

  node.append("text")

    .attr("class", "node-text node-name")

    .attr("text-anchor", "middle")

    .attr("y", -28)

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

    .attr("class", "node-text node-birth")

    .attr("text-anchor", "middle")

    .attr("y", -8)

    .text(d => {

      if(d.data.birth_date){

        return "🎂 " + d.data.birth_date;

      }

      return "";

    });



  /* =========================
     AGE / STATUS
  ========================= */

  node.append("text")

    .attr("class", "node-text node-status")

    .attr("text-anchor", "middle")

    .attr("y", 12)

    .text(d => {

      const age = calculateAge(
        d.data.birth_date,
        d.data.death_date
      );

      if(d.data.death_date){

        return age !== null
          ? `🕊️ Meninggal (usia ${age})`
          : "🕊️ Meninggal";

      }

      if(age !== null){

        return `${age} tahun`;

      }

      return "";

    });



  /* =========================
     GENDER
  ========================= */

  node.append("text")

    .attr("class", "node-text node-gender")

    .attr("text-anchor", "middle")

    .attr("y", 30)

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
     PARENTS INFO
  ========================= */

  node.append("text")

    .attr("class", "node-text node-parents")

    .attr("text-anchor", "middle")

    .attr("y", 46)

    .text(d => {

      const parts = [];

      if(d.data.father_name){
        parts.push("👨 " + d.data.father_name);
      }

      if(d.data.mother_name){
        parts.push("👩 " + d.data.mother_name);
      }

      return parts.join("   ");

    });



  /* =========================
     ANIMATION
  ========================= */

  node

    .style("opacity", 0)

    .transition()

    .duration(800)

    .style("opacity", 1);



  /* =========================
     CLICK NODE
     (dipindah ke dalam drawTree supaya
     variabel "node" valid saat dipakai)
  ========================= */

  node

  .style("cursor","pointer")

  .on("click",(event,d)=>{

    if(window.openModal){

      window.openModal(d.data);

    }

  });

}
