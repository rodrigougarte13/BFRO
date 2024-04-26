console.log("Script started running.");

const width = 960, height = 600;
const svg = d3.select("#map").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`) // Add viewBox for responsive scaling
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2]) // Centers the map in the SVG element
    .scale(1300); // Adjust scale to fit the SVG element

const path = d3.geoPath()
    .projection(projection);

// Load and draw the base map with GeoJSON
d3.json("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json").then(geojsonData => {
    svg.selectAll("path")
        .data(geojsonData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", "#ddd")
        .attr("stroke", "#fff")
        .attr("stroke-width", "1");

 
  loadData();
}).catch(error => console.error('Error loading the US map TopoJSON:', error));

function loadData() {
    Promise.all([
        d3.csv("bfro_final_fixed.csv", d => ({
            id: d.id,
            lon: +d.Geo_Parser_Longitude,
            lat: +d.Geo_Parser_Latitude,
            date: new Date(d.Approximate_Date),
            coordinates: projection([+d.Geo_Parser_Longitude, +d.Geo_Parser_Latitude])
        })),
        d3.csv("national_parks.csv", d => ({
            id: d.id,
            lon: +d.Longitude,
            lat: +d.Latitude,
            creationDate: new Date(d.Date),
            coordinates: projection([+d.Longitude, +d.Latitude])
        }))
    ]).then(([sightingsData, parksData]) => {
        updateMap(sightingsData, parksData); // Plot your data based on the initial slider position
    });
}

function updateMap(sightingsData, parksData) {
    const selectedYear = parseInt(d3.select("#yearSlider").property("value"));
    const filteredSightings = sightingsData.filter(d => d.date.getFullYear() <= selectedYear);
    const filteredParks = parksData.filter(d => d.creationDate.getFullYear() <= selectedYear);
    plotPoints(filteredSightings, 'sighting', 2, 'red');
    plotPoints(filteredParks, 'park', 5, 'green');
}

function plotPoints(data, className, radius, fillColor) {
    svg.selectAll(`.${className}`).remove(); // Clear previous circles
    svg.selectAll(`circle.${className}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", className)
        .attr("cx", d => d.coordinates ? d.coordinates[0] : 0)
        .attr("cy", d => d.coordinates ? d.coordinates[1] : 0)
        .attr("r", radius)
        .style("fill", fillColor);
}

// Slider interaction
d3.select("#yearSlider").on("input", function() {
    loadData(); // Re-load and process data each time the slider value changes
});

document.addEventListener('DOMContentLoaded', function() {
    var slider = document.getElementById('yearSlider');
    var tooltip = document.querySelector('.tooltip');

    // Function to update the tooltip with the slider's current value
    function updateTooltip() {
        tooltip.innerHTML = slider.value;
    }

    // Initialize the tooltip text
    updateTooltip();

    // Add an event listener to the slider to update the tooltip when the value changes
    slider.addEventListener('input', updateTooltip);
});