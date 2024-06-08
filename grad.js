// Function to create the interactive scatter plot
function createScatterPlot(csvFilePath) {
    d3.csv(csvFilePath).then(data => {
        // Convert numerical values from strings to numbers
        data.forEach(d => {
            d["Total Number of Medical Graduates"] = +d["Total Number of Medical Graduates"];
            d["Passing Years"] = +d["Passing Years"];
        });

        // Set the dimensions and margins of the graph
        const margin = {top: 60, right: 30, bottom: 40, left: 50},
              width = 800 - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom;

        // Append the svg object to the div called 'scatter-plot'
        const svg = d3.select("#scatter-plot")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleLinear()
                    .domain(d3.extent(data, d => d["Passing Years"]))
                    .range([0, width]);
        svg.append("g")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d["Total Number of Medical Graduates"])])
                    .range([height, 0]);
        svg.append("g")
           .call(d3.axisLeft(y));

        // Add dots
        svg.append("g")
           .selectAll("dot")
           .data(data)
           .enter()
           .append("circle")
           .attr("cx", d => x(d["Passing Years"]))
           .attr("cy", d => y(d["Total Number of Medical Graduates"]))
           .attr("r", 5)
           .attr("class", "dot")
           .attr("fill", "#69b3a2")
           .attr("opacity", 0)
           .transition()
           .duration(1000)
           .attr("opacity", 1);

        // Add tooltips
        const tooltip = d3.select("body").append("div")
                          .attr("class", "tooltip")
                          .style("opacity", 0)
                          .style("background-color", "white")
                          .style("border", "solid")
                          .style("border-width", "2px")
                          .style("border-radius", "5px")
                          .style("padding", "5px");

        svg.selectAll("circle")
           .on("mouseover", function(event, d) {
               tooltip.transition()
                      .duration(200)
                      .style("opacity", .9);
               tooltip.html("Country: " + d["Country of Medical Graduates"] + "<br/>" + 
                            "Year: " + d["Passing Years"] + "<br/>" + 
                            "Graduates: " + d["Total Number of Medical Graduates"])
                      .style("left", (event.pageX + 5) + "px")
                      .style("top", (event.pageY - 28) + "px");
           })
           .on("mouseout", function() {
               tooltip.transition()
                      .duration(500)
                      .style("opacity", 0);
           });

        // Add title to graph
        svg.append("text")
           .attr("x", width / 2)
           .attr("y", -margin.top / 2)
           .attr("text-anchor", "middle")
           .style("font-size", "22px")
           .text("Medical Graduates Over the Years");

        // Add subtitle to graph
        svg.append("text")
           .attr("x", width / 2)
           .attr("y", -margin.top / 2 + 20)
           .attr("text-anchor", "middle")
           .style("font-size", "14px")
           .style("fill", "grey")
           .style("max-width", 400)
           .text("Trends of Medical Graduates by Year and Country");
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

// Call the function to create the scatter plot
createScatterPlot("Filtered_Medical_Graduates.csv");
