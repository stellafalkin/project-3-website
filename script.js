//Scaling and dimensions
var SCALE = 1.1 //can change and will scale every feature involved in chart proportionally
    var width = 600 * SCALE;
        height = 600 * SCALE;
        margin = 40 * SCALE; //middle
    // The radius of the pieplot is half the width or half the height (smallest one). And subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select("#my_dataviz")
      .append("svg") //where chart lives
        .attr("width", width)
        .attr("height", height)
      .append("g") //used to center the visualization-everything is created relative to the center
        .attr("transform", `translate(${width/2}, ${height/2})`);

    var centerText = svg.append("text") //center text inside donut
      .attr("class", "center-text")
      .attr("text-anchor", "middle") //center each line horizontally
      .attr("dy", "0.35em") //dy offset vertically; want lines to be stacked vertically
      .style("font-size", 14 * SCALE + "px")
      .style("font-weight", "600")

    //Line 1
    centerText.append("tspan") //tspan allows multiple lines of text
      .attr("x", 0)
      .attr("dy", "0em") //line weight 
      .text("A spectrum of colors that demonstrate");

    //Line 2
    centerText.append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .text("diversity yet also harmony");

    //Line 3
    centerText.append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .text("in the plants");

    // data in percentages
    var data = {
      a: 13, 
      b: 13.38, 
      c: 6.01, 
      d: 4.39, 
      e: 18.18, 
      f: 14.18, 
      g: 15.98, 
      h: 12.23
    };

    // data mathes each slice to its hex color
    var meta = {
      a: { hex: "#317b25" },
      b: { hex: "#f4e234" },
      c: { hex: "#be8ad1" },
      d: { hex: "#f4893c" },
      e: { hex: "#7aa47b" },
      f: { hex: "#53994c" },
      g: { hex: "#a5c3a0" },
      h: { hex: "#d7e0c4" }
    }

    
    //Legend
    var plantLegend = [
      { name: "Deer Grass", img: "Deer_Grass.png" },
      { name: "Hillyhock", img: "Hillyhock.png" },
      { name: "Yellow Bells", img: "Yellow_bells.png" },
      { name: "Lantana", img: "Lantana (2).png" },
      { name: "Moses in the cradle", img: "Moses_In_The_Cradle.png" },
      { name: "Mexican Honeysuckle", img: "Mexican_Honeysuckle (2).png" },
      { name: "Autumn Sage", img: "Autumn_Sage.png" },
      { name: "Chinese Tallow", img: "Chinese_Tallow.png" },
      { name: "Multiflora Rose", img: "Multiflora_Rose (2).png" },
      { name: "Yucca", img: "Yucca (2).png" }
    ];

    
    var legend = d3.select("#legend")//select legend container
      .selectAll(".legend-item")
      .data(plantLegend)
      .enter()
      .append("div")
        .attr("class", "legend-item");//create new class for each legend item

    legend.append("img")//add plant image
      .attr("class", "legend-img")
      .attr("src", d => d.img)
      .attr("alt", d => d.name);

    legend.append("div")//add plant name next to image
      .attr("class", "legend-name")
      .text(d => d.name);


    //Finds total sum data percentage to calculate each slice's percentage in chart
    var total = d3.sum(Object.values(data));

    //Convert object into d3 pie layout form: array containing key/value pairs ("a"=13)
    var entries = Object.entries(data).map(function([key, value]) {
      return { key: key, value: value };
    });

    // color scale matched to each data entry (hex code)
    var color = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range(Object.keys(meta).map(k => meta[k].hex));

    //Arcs
    var INNER = 160 * SCALE;

    var arc = d3.arc() //normal slice when everything is at same level
      .innerRadius(INNER)
      .outerRadius (radius);

    var arcHover = d3.arc() //bigger slice when hovered
      .innerRadius(INNER)
      .outerRadius(radius * 1.12);

    //Pie; compute angles for each pie slice
    var pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    var data_ready = pie(entries);

    //Labels next to each hovering slice (hex code and %)
    var label = svg.append("text")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")//ignore mouse events
      .style("opacity", 0);   // hidden initially

    // Build the pie chart: Basically, each part of the pie is a path that is built using the arc function.
    var slices = svg.selectAll("path")
      .data(data_ready)
      .enter()
      .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (event, d) {  //when mouse is hovering over slice, enlarge slice
          d3.select(this) //expand slice
            .transition()
            .duration(150)
            .attr("d", arcHover)
            .style("opacity", 1);

          // compute label text
          let k = d.data.key;
          let pct = ((d.data.value / total) * 100).toFixed(1) + "%";


          //label position and content
          let [x, y] = arcHover.centroid(d);
          x *= 1.5    // push label further inward/outward relative to slice
          y *= 1.5;

          label
            .interrupt()
            .attr("x", x)
            .attr("y", y)
            .style("opacity", 1);

          label.selectAll("tspan").remove();

          //Label line 1: hex code
          label.append("tspan")
            .attr("x", x)
            .attr("dy", "-0.2em")
            .style("font-size", 12 * SCALE + "px")
            .style("font-family", "Congenial")
            .text(meta[k].hex);

          //Label line 2: percentage
          label.append("tspan")
            .attr("x", x)
            .attr("dy", "1.2em")
            .style("font-size", 18 * SCALE + "px")
            .style("font-family", "Congenial")
            .style("font-weight", "700")
            .text(pct);

        })
     
        .on("mouseout", function (event, d) { 
          // shrink slice back to normal when mouse is removed
          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc)
            .style("opacity", 0.7);

          // hide label again
          label
            .transition()
            .delay(500)
            .duration(300)
            .style("opacity", 0);
        });





