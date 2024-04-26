document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const path = d3.geoPath();
    const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(width * 1.2);
// Define the title text
const titleText = "US Map with Park Visitation";

// Append the title to the SVG
svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text(titleText);

// Define the legend
const legendText = "Visitor Count";

// Append the legend to the div with the class "legend"
d3.select(".legend")
    .append("p")
    .text(legendText);

    // Load the GeoJSON data for the map
    d3.json("https://d3js.org/us-10m.v1.json").then(function(us) {
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .join("path")
            .attr("fill", "#ccc")
            .attr("d", path);

        // Add borders
        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
        
        // Now load the park visitation data
        d3.json("bubb_json_final_merged_data.json").then(function(data) {
            // Define a color scale for the "count" - adjust domain as per your data range
            // Define a color scale for the "count" - adjust domain as per your data range
// Define a color scale for the "count" - adjust domain as per your data range
const color = d3.scaleSequential(d3.interpolateReds)
    .domain([0, d3.max(data, d => d.count)]);



            
            svg.append("g")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => projection([d.longitude, d.latitude])[0])
                .attr("cy", d => projection([d.longitude, d.latitude])[1])
                .attr("r", d => Math.sqrt(d.visitor_count) / 100)
                .attr("fill", d => color(d.count)) // Use color scale for fill
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("opacity", 0.75)
                .append("title") // Tooltip to show information on hover
                .text(d => `${d.park_name}: ${d.visitor_count} visitors (${d.count} count)`);
        }).catch(error => console.error('Error loading or processing visitation data:', error));
    }).catch(error => console.error('Error loading or processing map data:', error));
});
