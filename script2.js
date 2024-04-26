document.addEventListener('DOMContentLoaded', function() {
    const width = 1200;
    const height = 800;
    const innerRadius = 100;
    const outerRadius = Math.min(width, height) / 2 - 10;

    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const data = [{"witnesses": 1, "Class A": 1277, "Class B": 1096, "Class C": 22}, {"witnesses": 2, "Class A": 556, "Class B": 656, "Class C": 4}, {"witnesses": 3, "Class A": 354, "Class B": 398, "Class C": 1}, {"witnesses": 4, "Class A": 139, "Class B": 184, "Class C": 0}, {"witnesses": 5, "Class A": 71, "Class B": 80, "Class C": 2}, {"witnesses": 6, "Class A": 46, "Class B": 27, "Class C": 1}, {"witnesses": 7, "Class A": 22, "Class B": 38, "Class C": 0}, {"witnesses": 8, "Class A": 9, "Class B": 17, "Class C": 0}, {"witnesses": 9, "Class A": 6, "Class B": 11, "Class C": 0}, {"witnesses": 10, "Class A": 6, "Class B": 7, "Class C": 0}];

    const xScale = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .domain(data.map(d => d.witnesses))
        .padding(0.01);

    const yScale = d3.scaleRadial()
        .range([innerRadius, outerRadius])
        .domain([0, d3.max(data, d => d["Class A"] + d["Class B"] + d["Class C"])]);

    const color = d3.scaleOrdinal()
        .domain(["Class A", "Class B", "Class C"])
        .range(["#49e41a", "#e4bf1a", "#e41a1c"]);

    const arc = d3.arc()
        .innerRadius(d => yScale(d[0]))
        .outerRadius(d => yScale(d[1]))
        .startAngle(d => xScale(d.data.witnesses))
        .endAngle(d => xScale(d.data.witnesses) + xScale.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius);

    const stack = d3.stack()
        .keys(["Class A", "Class B", "Class C"]);

    svg.append("g")
        .selectAll("g")
        .data(stack(data))
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("path")
        .data(d => d)
        .enter().append("path")
        .attr("d", arc);

    // Add labels for each 'witnesses' value
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("text-anchor", "middle")
        .attr("transform", d => `rotate(${((xScale(d.witnesses) + xScale.bandwidth() / 2) * 180 / Math.PI - 90)}) translate(${outerRadius + 10},0)`)
        .append("text")
        .attr("transform", d => (xScale(d.witnesses) + xScale.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)")
        .text(d => `Witnesses: ${d.witnesses}`)
        .style("font-size", 12)
        .attr("alignment-baseline", "middle");

    // Add gridlines
    const yAxis = svg.append("g")
        .attr("text-anchor", "middle");
    
    svg.append("g")
        .selectAll("line")
        .data(xScale.domain())
        .enter().append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", innerRadius)
        .attr("y2", outerRadius)
        .attr("stroke", "#000")
        .attr("transform", d => `rotate(${xScale(d) * 180 / Math.PI })`);

    const yTick = yAxis
        .selectAll("g")
        .data(yScale.ticks(5).slice(1))
        .enter().append("g");

    yTick.append("circle")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4,4")
        .attr("r", yScale);

    // Modify this part to format the gridlines as plain numbers
    yTick.append("text")
        .attr("y", d => -yScale(d))
        .attr("dy", "0.35em")
        .attr("x", () => 7)
        .text(d => d) // Changed to display the number without the 'k' suffix
        .style("font-size", 10)
        .attr("fill", "black");
});
