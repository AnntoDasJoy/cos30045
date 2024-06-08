// Set the dimensions and margins of the radial chart
var width = 800,
    height = 800,
    margin = 50;

var radius = Math.min(width, height) / 2 - margin;

// Append the svg object to the body of the page
var svg = d3.select("#radial-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Dark neon color palette
var darkNeonColors = ["#00ff00", "#00ffcc", "#ff00ff", "#cc00ff", "#ff0066", "#ffcc00", "#ff3300", "#33ccff", "#ff0099", "#66ff66"];

// Load the data
d3.csv("female physician over 75.csv").then(function(data) {
    console.log("Data loaded:", data); // Log the loaded data
    // Process the data
    var years = Array.from(new Set(data.map(d => d.Year)));
    var countries = Array.from(new Set(data.map(d => d.Country)));

    var processedData = years.map(year => {
        var yearData = { year: year };
        countries.forEach(country => {
            yearData[country] = +data.find(d => d.Year == year && d.Country == country)?.Value || 0;
        });
        return yearData;
    });

    console.log("Processed data:", processedData); // Log the processed data

    // Stack the data
    var stack = d3.stack()
        .keys(countries)
        (processedData);

    console.log("Stacked data:", stack); // Log the stacked data

    // Color scale
    var color = d3.scaleOrdinal(darkNeonColors)
        .domain(countries);

    // Angle scale
    var angle = d3.scaleBand()
        .domain(years)
        .range([0, 2 * Math.PI])
        .align(0);

    // Radius scale
    var radiusScale = d3.scaleRadial()
        .domain([0, d3.max(stack[stack.length - 1], d => d[1])])
        .range([0, radius]);

    // Create a tooltip
    var tooltip = d3.select("#radial-chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Tooltip functions
    var mouseover = function(event, d) {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke", "black").style("opacity", 1);
    };

    var mousemove = function(event, d) {
        console.log("Hovered data:", d); // Log the data on hover
        var country = d.key || "Unknown";
        tooltip
            .html("Year: " + d.data.year + "<br>Country: " + country + "<br>Count: " + (d[1] - d[0]))
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    var mouseleave = function(event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    // Create the radial bars with animation
    svg.append("g")
        .selectAll("g")
        .data(stack)
        .enter()
        .append("g")
        .attr("fill", d => color(d.key))
        .selectAll("path")
        .data(d => d)
        .enter()
        .append("path")
        .attr("d", d3.arc()
            .innerRadius(radius)
            .outerRadius(radius)
            .startAngle(d => angle(d.data.year))
            .endAngle(d => angle(d.data.year) + angle.bandwidth())
            .padAngle(0.01)
            .padRadius(100))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(1000)
        .attr("d", d3.arc()
            .innerRadius(d => radiusScale(d[0]))
            .outerRadius(d => radiusScale(d[1]))
            .startAngle(d => angle(d.data.year))
            .endAngle(d => angle(d.data.year) + angle.bandwidth())
            .padAngle(0.01)
            .padRadius(100));

    // Add the labels
    svg.append("g")
        .selectAll("g")
        .data(years)
        .enter()
        .append("g")
        .attr("text-anchor", "middle")
        .attr("transform", d => "rotate(" + ((angle(d) + angle.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + (radius + 30) + ",0)")
        .append("text")
        .attr("transform", d => (angle(d) + angle.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)")
        .text(d => d);

    // Add a legend
    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(countries.slice().reverse())
        .enter()
        .append("g")
        .attr("transform", (d, i) => "translate(-" + (width / 2 + 60) + "," + ((i - (countries.length - 1) / 2) * 20 + height / 2 - 100) + ")");

    legend.append("rect")
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", -5)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);

    // Add title to graph
    svg.append("text")
        .attr("x", 0)
        .attr("y", - (height / 2) - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("Female Physicians Over 75");

    // Add subtitle to graph
    svg.append("text")
        .attr("x", 0)
        .attr("y", - (height / 2) + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("Trends of Female Physicians Over 75 by Year and Country");
}).catch(function(error) {
    console.error('Error loading or processing data:', error);
});
