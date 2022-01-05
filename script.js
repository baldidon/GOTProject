alert("for a better visualization, set your browser in FullScreen Mode (Fn+F11)")

//opacità da imporre
let hideElement = 0.09;
//MAIN
// usato per selezionare gli archi da visualizzare
let binaryArray = [1,1,1,1,1,1,1]

//dimensione canvas
let width = 1300, height = 1200;

const houseBirthColours = {
    "House Arryn" : "#0000FF",
    "House Clegane" : "#fff446",
    "House Baratheon" : "#d4af37",
    "House Stark" : "#ffffff",
    "House Lannister" : "#75151E",
    "House Targaryen" : "#A90708",
    "House Greyjoy" : "#000000",
    "House Bolton" : "#991199",
    "House Martell": "#FF8000",
    "House Tyrell" : "#00BB6D",
    "House Mormont" : "#FFC0CB",
    "House Payne" : "#924E7D",
    "House Reed" : "#C8A2C8",
    "Sand Snakes" : "#DCDCDC",
    "House Baelish":"#FAD201",
    "House Tarth":"#007FFF",
    "House Dayne":"#FFFDD0",
    "House Thorne":"#805A46",
    "House Dondarrion": "#81D8D0",
    "House Redwyne" : "#D2B48C",
    "House Frey": "#808080",
    "House Tully": "#252850"
}

const relationalColours = {
    "killed":"#000000",
    "father" : "#4169e1",
    "mother" : "#9966cc",
    "sibling" : "#FFA500",
    "lover" : "#F400A1",
    "spouse" : "#C04828",
    "allegiance" : "#50c878"
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


d3.json("data/dataset.json", (error,graph)=>{
 if (error) throw error;


    let nodes = graph.nodes;
    let links = graph.links;
    nodes.forEach((d)=>{
        d.grado = 0
    })


    //modello per mantenere gli archi così come sono
    let force = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id ));

    let lastPosition = 0
    let circleCoord = function(node){
        let circumference = circle.node().getTotalLength(); //aka tutti i punti che definiscono il path
        let sectionLength = (node.grado+16)*(circumference)/(2*links.length + 16*nodes.length);
        let position = lastPosition + sectionLength/2;
        lastPosition += sectionLength
        return circle.node().getPointAtLength(position)
    }


    // creazione svg
    let svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);


    //diameter
    let dim = width-400

    //arrow
    svg.append("defs").append("marker")
        .attr("id","arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("opacity",0.7)
        .attr("d", "M 0,-5 L 10,0 L 0,5");

    //linearGradient
    let defs = svg.append("defs");

    //     .attr("id","Black")
    //     .d3.select("#gradient").append("stop")
    //     .attr("class", "start")
    //     .attr("offset", "0%")
    //     .attr("stop-color", )
    //     .attr("stop-opacity","1")
    //
    // d3.select("#gradient").append("stop")
    //     .attr("class", "end")
    //     .attr("offset", "100%")
    //     .attr("stop-color", ntc.name(relationalColours[d["relation"]])[1])
    //     .attr("stop-opacity", "0.1");




    //path è un elemento svg per disegnare la circonferenza "di base". Viene usato anche dentro circleCoord
    let circle = svg.append("path")
        .attr("d", "M"+(width/2)+","+(height/2)+"m "+(dim/2*-1)+",0 a "+dim/2+","+dim/2+" 0 1,0 "+dim+",0 a "+dim/2+","+dim/2+" 0 1,0 "+-1*dim+",0")
        //.attr("cx",width/2,"cy",height/2,"r",dim/2)
        .style("fill", "#efefef");


    force.nodes(graph.nodes);
    force.force("link").links(graph.links)


    const auxDict = {
        "House Arryn": [],
        "House Clegane": [],
        "House Baratheon": [],
        "House Stark": [],
        "House Lannister": [],
        "House Targaryen": [],
        "House Greyjoy": [],
        "House Bolton": [],
        "House Martell": [],
        "House Tyrell": [],
        "House Mormont": [],
        "House Payne": [],
        "House Reed": [],
        "Sand Snakes": [],
        "House Baelish": [],
        "House Tarth": [],
        "House Dayne": [],
        "House Thorne": [],
        "House Dondarrion": [],
        "House Redwyne": [],
        "House Frey": [],
        "House Tully": [],
        "undefined": []
    }

    links.forEach((d)=>{
        nodes[d.source.id].grado ++
        nodes[d.target.id].grado ++
    })

    nodes.forEach((d)=>{
        if(d['house-birth'] === undefined)
            auxDict['undefined'].push(d);
        else
            auxDict[d['house-birth']].push(d);
    })//works


    //set coordinates for each node
    let counter =-1;
    for (const [key, list] of Object.entries(auxDict)) {
        list.forEach((el)=>{
                counter++;
                el.idCircle = counter;
                let coord = circleCoord(el, counter, nodes.length)
                el.x = coord.x
                el.y = coord.y
        })
    }//works

    let index = 0;
    const curve = d3.line().curve(d3.curveNatural);
    let coupleList = []
    //WORKS
    let lines = svg.selectAll("path.node-link")
        .data(links).enter().append("path")
            .attr("class", "node-link")
            .attr("d", (d)=>{
                let dx = d.source.x - d.target.x,
                    dy = d.source.y - d.target.y,
                    dist = Math.sqrt(dx * dx + dy * dy),
                    midX = (d.target.x + d.source.x) / 2,
                    midY = (d.target.y + d.source.y) / 2,
                    rand = Math.random() -0.5,
                    //r = (1+Math.random())*dist,
                    //distPuntoRetta = (r - Math.sqrt(r*r - ((dist*dist)/4)));
                    distPuntoRetta = 20 - 15*Math.pow(20, -dist/200);
                // (rand/Math.abs(rand))*
                let add = false
                coupleList.forEach((e) =>{
                    if((e.source === d.source.id && e.target === d.target.id) || (e.source === d.target.id && e.target === d.source.id)){
                        e.counter++
                        distPuntoRetta += e.counter*distPuntoRetta/2
                        add = true
                    }
                });
                if(!add){
                        coupleList.push({source: d.source.id, target: d.target.id, counter: 0})
                }

                /*check arco rimane nella circonferenza*/
                if(d.source.idCircle > 41){
                    if((d.source.idCircle<d.target.idCircle && d.target.idCircle<=83) ||(0<=d.target.idCircle && d.target.idCircle<=(-42 + d.source.idCircle))) {
                        distPuntoRetta = -distPuntoRetta;
                    }
                }else {
                    if(d.source.idCircle < d.target.idCircle && d.target.idCircle <=d.source.idCircle+42){
                        distPuntoRetta = -distPuntoRetta;
                    }
                }
                let mx = (dy/(dy*dy + dx*dx))*(dx*((dx*midX/dy) +midY) + d.target.x*d.source.y - d.source.x*d.target.y + dist*distPuntoRetta),
                    my = -(dx/dy)*(mx-midX) + midY;

                let provaX = (d.source.x + midX)/2;
                let provaY = (d.source.y + midY)/2;

                return curve([[d.source.x, d.source.y],[mx, my], [d.target.x, d.target.y]]);
            })
            //.attr("marker-mid","url(#arrow)")
            .attr("stroke", (d)=> {
                d.index = index
                let lg = defs.append('linearGradient')
                    .attr("id", index)
                    .attr("gradientUnits", "userSpaceOnUse")
                //
                // let x1 = "0%",
                //     x2 = "0%",
                //     y1 = "0%",
                //     y2 = "0%";
                //
                //
                //
                // if (d.target.y < d.source.y) {
                //     y1 = "100%";
                // }else if (d.target.y > d.source.y){
                //     y2 = "100%";
                // }
                // if (d.target.x > d.source.x){
                //     x1 = "100%";
                // }else if(d.target.x <d.source.x){
                //     x2 ="100%";
                // }
                //
                // console.log(d.source.x,d.target.x,x1,x2, d.source.y,d.target.x,y1,y2);
                lg.attr("x1",d.source.x)
                    .attr("x2",d.target.x)
                    .attr("y1",d.source.y)
                    .attr("y2",d.target.y)

                lg.append("stop")
                    .attr("class", "start")
                    .attr("offset", "0%")
                    .attr("stop-color", relationalColours[d['relation']])

                lg.append("stop")
                    .attr("class", "end")
                    .attr("offset", "98%")
                    .attr("stop-color",(l)=>{
                        if(relationalMarker[d.relation]){
                            return relationalColours[d['relation']] + "1A"
                        }
                        return relationalColours[d['relation']]
                    })

                index++;
                d.color = relationalColours[d['relation']]
                //return d.color;
                return "url(#"+d['index']+")";
            });
    //contenitore per il cerchio e l'etichetta
    let gnodes = svg.selectAll('g.gnode')
        .data(nodes).enter()
            .append('g')
            .attr("transform", function(d) {
                return "translate("+d.x+","+d.y+")"
            })
            .classed('gnode', true);



    let node = gnodes.append("circle")
        .attr("r", (d)=>{return d.grado + 5})
        .attr("class", "node")
        .attr("id", function (d){return d.id })
        .attr("fill",(d)=>{
            if(d['house-birth']=== undefined) {
                d.color = "#CD853F";
                return d.color
            }else{
                d.color = houseBirthColours[d['house-birth']];
                return d.color
            }
        })
        .attr("stroke",(d)=>{
            if(d.status === "Alive") return "#00B300"
            return "#FF0000"
        })
        .on("mouseenter", function(d){
            //is_connected(d, 0.1);
            node.transition().duration(100).attr("r",(d)=>{return d.grado + 5})
            d3.select(this).transition().duration(100).attr("r",(d)=>{return d.grado + 10}); //molto grande così si può inserire immagine?
            changeOpacity(d.id,hideElement);
            })
        .on("mouseleave", function(d) {
            node.transition().duration(100).attr("r", (d)=>{return d.grado + 5});
            //is_connected(d, 1);
            changeOpacity(d.id,1)
        })
        .on("click", function (d) {
            let counter = 83
            let nodesRelative = [d]
            let linksRelative = [];
            links.forEach((l) => {
                if (returnEdgeState(l) === 1) {
                    if (l.source.id === d.id) {
                        if (!nodesRelative.includes(l.target)) {
                            nodesRelative.push(l.target)
                            linksRelative.push(l);
                        }else{
                            let newNode = new Object();
                            newNode.id = l.target.id + counter;
                            newNode.name  = l.target.name;
                            newNode.color = l.target.color;
                            newNode.status = l.target.status;
                            newNode.x = l.target.x;
                            newNode.y = l.target.y;
                            newNode.vx = l.target.vx;
                            newNode.vy = l.target.vy;
                            counter++
                            let newEdge = new Object();
                            newEdge.source = l.source;
                            newEdge.target  = newNode;
                            newEdge.relation = l.relation;
                            newEdge.color = l.color;

                            nodesRelative.push(newNode)
                            linksRelative.push(newEdge);
                        }
                    }else if(l.target.id === d.id){
                        if (!nodesRelative.includes(l.source)) {
                            nodesRelative.push(l.source);
                            linksRelative.push(l);
                        }else{
                            let newNode = new Object();
                            newNode.id = l.source.id + counter;
                            newNode.name  = l.source.name;
                            newNode.color = l.source.color;
                            newNode.status = l.source.status;
                            newNode.x = l.source.x;
                            newNode.y = l.source.y;
                            newNode.vx = l.source.vx;
                            newNode.vy = l.source.vy;
                            counter++
                            let newEdge = new Object();
                            newEdge.source = newNode;
                            newEdge.target  = l.target;
                            newEdge.relation = l.relation;
                            newEdge.color = l.color;

                            nodesRelative.push(newNode)
                            linksRelative.push(newEdge);
                        }
                    }
                }
            });
            createCard(nodesRelative,linksRelative)
            //window.open("cards.html","_blank").focus()

        });


            // function (){
            // let element = document.getElementById("cards");
            // if (element.style.display === "none") {
            //     element.style.display = "block";
            // } else {
            //     element.style.display = "none";
            // }
        // }
        // );




    function changeOpacity(id,opacity){

        const list = [id];

        lines.transition().style("opacity", (o)=> { // Perché sennò con opacity cambia solo la linea
            if (o.source.id === id && returnEdgeState(o)) {
                list.push(o.target.id)
                return returnEdgeState(o)
            }
            else if (o.target.id === id && returnEdgeState(o)){
                list.push(o.source.id)
                return returnEdgeState(o)
            }
            else {
                if(returnEdgeState(o)){
                    return opacity;
                }else{
                    return returnEdgeState(o)
                }
            }
        });

        d3.selectAll("g.gnode")
            .each(function(d){
                if(!list.includes(d.id)){
                    d3.select(this).transition().duration(100).attr("opacity",opacity)
                }
            })
    }



    let off = 100;


    let labels = gnodes.append("text")
        .attr("transform",(d)=>{
            return "rotate("+ (Math.atan((d.y-height/2)/(d.x - width/2))*180)/Math.PI+")"
        })
        .attr('dx',function(d){

            // let m = (d.y - height/2)/(d.x - width/2)
            if(d.x - width/2>=0) return 90
            return -90;
        })
        // .attr("dy", function (d){
        //     return 100*(d.y - height/2)/(dim/2)
        //
        // })

        .text(function(d){return d.name});

    let deathCheckbox = document.querySelector('input[value="death"]');
    let fatherCheckbox = document.querySelector('input[value="father"]');
    let motherCheckbox = document.querySelector('input[value="mother"]');
    let siblingsCheckbox = document.querySelector('input[value="siblings"]');
    let loverCheckbox = document.querySelector('input[value="lover"]');
    let spouseCheckbox = document.querySelector('input[value="spouse"]');
    let allegianceCheckbox = document.querySelector('input[value="allegiance"]');

    deathCheckbox.addEventListener('change', () => {
        if(deathCheckbox.checked) {
            binaryArray[0] = 1
        } else {
            binaryArray[0] = 0
        }
        setVisibleEdges()
    });
    fatherCheckbox.addEventListener('change', () => {
        if(fatherCheckbox.checked) {
            binaryArray[1] = 1
        } else {
            binaryArray[1] = 0
        }
        setVisibleEdges()
    });
    motherCheckbox.addEventListener('change', () => {
        if(motherCheckbox.checked) {
            binaryArray[2] = 1
        } else {
            binaryArray[2] = 0
        }
        setVisibleEdges()
    });
    siblingsCheckbox.addEventListener('change', () => {
        if(siblingsCheckbox.checked) {
            binaryArray[3] = 1
        } else {
            binaryArray[3] = 0
        }
        setVisibleEdges()
    });
    loverCheckbox.addEventListener('change', () => {
        if(loverCheckbox.checked) {
            binaryArray[4] = 1
        } else {
            binaryArray[4] = 0
        }
        setVisibleEdges()
    });
    spouseCheckbox.addEventListener('change', () => {
        if(spouseCheckbox.checked) {
            binaryArray[5] = 1
        } else {
            binaryArray[5] = 0
        }
        setVisibleEdges()
    });
    allegianceCheckbox.addEventListener('change', () => {
        if(allegianceCheckbox.checked) {
            binaryArray[6] = 1
        } else {
            binaryArray[6] = 0
        }
        setVisibleEdges()
    });

    function setVisibleEdges() {
        lines.transition().style("opacity", (o)=>{
            return returnEdgeState(o)
        })
    }
    function returnEdgeState(o){
        if(o.relation === "killed"){
            return binaryArray[0]
        }else if(o.relation === "father"){
            return binaryArray[1]
        }else if(o.relation === "mother"){
            return binaryArray[2]
        }else if(o.relation === "sibling"){
            return binaryArray[3]
        }else if(o.relation === "lover"){
            return binaryArray[4]
        }else if(o.relation === "spouse"){
            return binaryArray[5]
        }else if(o.relation === "allegiance"){
            return binaryArray[6]
        }
    }

    function createCard(nodesToDraw, linksToDraw) {
        sessionStorage.setItem("nodesToDraw", JSON.stringify(nodesToDraw))
        sessionStorage.setItem("linksToDraw", JSON.stringify(linksToDraw))
        window.open("cards.html",nodesToDraw[0].name, "toolbar=no,scrollbars=yes,resizable=no,top=500,left=500,width=800,height=750");
    }


});
