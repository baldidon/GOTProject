let nodesToDraw = JSON.parse(sessionStorage.getItem("nodesToDraw"))
let linksToDraw = JSON.parse(sessionStorage.getItem("linksToDraw"))
document.getElementById("titlecard").innerHTML = nodesToDraw[0].name
let edges = []
let counter = 0
linksToDraw.forEach((l)=>{
    let obj = new Object();
    obj.source = l.source.id;
    obj.target  = l.target.id;
    obj.relation = l.relation;
    obj.color = l.color;
    obj.index = counter;
    counter++
    edges.push(obj)
})
let h = 700;
let w = 780;

/*
fetch('http://example.com/movies.json')
  .then(response => response.json())
  .then(data => console.log(data));
*/

const relationalDistance = {
    "killed": 170,
    "father" : 100,
    "mother" : 100,
    "sibling" : 60,
    "lover" : 30,
    "spouse" : 30,
    "allegiance" : 150
}
const relationalMarker = {
    "killed": 1,
    "father" : 1,
    "mother" : 1,
    "sibling" : 0,
    "lover" : 0,
    "spouse" : 0,
    "allegiance" : 1
}

let svg = d3.select('body')
    .append("svg")
    .attr("width",w)
    .attr("height",h)
    .attr("style","background-color:#efefef")

svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

let simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
        .id(function(d) {
            return d.id;
        })
        .distance((l)=>{
            return relationalDistance[l.relation]
        })
    )
    .force("charge", d3.forceManyBody().strength(-1000))
    .force("center", d3.forceCenter(w/2, h/2));

let defs = svg.append("defs");


let link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(edges)
    .enter().append("line")
    .attr("stroke", (d)=>{
        return d.color
    })
//
    //     let lg = defs.append("linearGradient")
    //         .attr("id", d.index)
    //         .attr("gradientUnits", "userSpaceOnUse")
    //     lg.attr("x1",d.source.x)
    //         .attr("x2",d.target.x)
    //         .attr("y1",d.source.y)
    //         .attr("y2",d.target.y)
    //     lg.append("stop")
    //         .attr("class", "start")
    //         .attr("offset", "0")
    //         .attr("stop-color", d.color)
//
    //     lg.append("stop")
    //         .attr("class", "end")
    //         .attr("offset", "100%")
    //         .attr("stop-color", '#ffffff')
//
    //     return "url(#"+d.index+")";
    // })
    //.attr("stroke-width", "1px")
    .attr("marker-end", (d)=>{
        if(relationalMarker[d.relation]) {
            return "url(#end)"
        }
        return ""
    });


let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodesToDraw)
    .enter().append("g")

let circles = node.append("circle")
    .attr("r", (d)=>{
        if(d.id === nodesToDraw[0].id) return "10"
        return "8";
    })
    .attr("fill", function(d) { return (d.color); })
    .attr("stroke",(d)=>{
        if(d.status === "Alive") return "#00b300"
        return "#FF0000"
    })
    .attr("stroke-width","3px");

// Create a drag handler and append it to the node object instead
let drag_handler = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

drag_handler(node);

let nodeLabels = node.append("text")
    .text(function(d) {
        return d.name;
    })
    .attr('style',(d)=>{
        if(d.id === nodesToDraw[0].id) return "font-weight:bold"
        return ""
    });


node.append("title")
    .text(function(d) { return d['status']; });

simulation
    .nodes(nodesToDraw)
    .on("tick", ticked);

simulation.force("link")
    .links(edges);

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })

    nodeLabels
        .attr("transform",(d)=>{
            return "rotate("+ (Math.atan((d.y-h/2)/(d.x - w/2))*180)/Math.PI+")"
        })
        .attr('dx',function(d){
            if(d.x - w/2>=0) return 40
            return -140;
        })
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}
function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}
function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}