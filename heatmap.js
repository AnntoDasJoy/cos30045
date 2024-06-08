// Set the dimensions and margins of the heatmap
var heatmapMargin = { top: 100, right: 40, bottom: 100, left: 150 },
    heatmapWidth = 800 - heatmapMargin.left - heatmapMargin.right,
    heatmapHeight = 800 - heatmapMargin.top - heatmapMargin.bottom;

// Append the svg object to the body of the page
var heatmapSvg = d3.select("#heatmap")
    .append("svg")
    .attr("width", heatmapWidth + heatmapMargin.left + heatmapMargin.right)
    .attr("height", heatmapHeight + heatmapMargin.top + heatmapMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + heatmapMargin.left + "," + heatmapMargin.top + ")");

// Load the heatmap data
Promise.all([
    d3.csv("male physician under 35.csv"),
    d3.csv("female physician under 35.csv")
]).then(function(files) {
    var maleData = files[0];
    var femaleData = files[1];

    // Extract unique countries and years
    let countries = Array.from(new Set(maleData.map(d => d.Country).concat(femaleData.map(d => d.Country))));
    let years = Array.from(new Set(maleData.map(d => d.Year).concat(femaleData.map(d => d.Year))));

    // Process data to create a matrix
    let matrix = [];
    countries.forEach(country => {
        years.forEach(year => {
            let maleCount = maleData.find(d => d.Country === country && d.Year == year)?.Value || 0;
            let femaleCount = femaleData.find(d => d.Country === country && d.Year == year)?.Value || 0;
            matrix.push({ country, year, maleCount: +maleCount, femaleCount: +femaleCount });
        });
    });

    // Build X and Y scales and axes
    var x = d3.scaleBand().range([0, heatmapWidth]).domain(years).padding(0.05);
    var y = d3.scaleBand().range([heatmapHeight, 0]).domain(countries).padding(0.05);
    var color = d3.scaleSequential(d3.interpolateInferno).domain([0, d3.max(matrix, d => Math.max(d.maleCount, d.femaleCount))]);

    heatmapSvg.append("g")
        .attr("transform", "translate(0," + heatmapHeight + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    heatmapSvg.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll("text")
        .attr("transform", "translate(-10,0)")
        .style("text-anchor", "end");

    // Create a tooltip
    var tooltip = d3.select("#heatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Three functions that change the tooltip when user hover / move / leave a cell
    var mouseover = function(event, d) {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke", "black").style("opacity", 1);
    };
    var mousemove = function(event, d) {
        tooltip
            .html("Country: " + d.country + "<br>Year: " + d.year + "<br>Male: " + d.maleCount + "<br>Female: " + d.femaleCount)
            .style("left", (event.pageX + 70) + "px")
            .style("top", (event.pageY) + "px");
    };
    var mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    // Add the squares
    heatmapSvg.selectAll()
        .data(matrix)
        .enter()
        .append("rect")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.country))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => color(d.maleCount + d.femaleCount))
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // Add title to graph
    heatmapSvg.append("text")
        .attr("x", 0)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Physicians Co-occurrence Heatmap");

    // Add subtitle to graph
    heatmapSvg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("Counts of Male and Female Physicians under 35 by Country and Year");
});
