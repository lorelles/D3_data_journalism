// Set H/W/M
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "income";

// Update x-scale on click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(hairData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// Update xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale); 
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis); 
    return xAxis;
}

// Update circles group with transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis])); 
    return circlesGroup;
}

// Update circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    let label; 
    if (chosenXAxis === "income") {
      label = "Household Income (Median)";
    }
    else {
      label = "Age";
    }
  
    const toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(d => `${d.income}<br>${label} ${d[chosenXAxis]}`);
  
    circlesGroup.call(toolTip);

    // onmouseover event
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });
  
    return circlesGroup;
  }

// Retrieve data from data.csv file and execute everything below
d3.csv("data.csv").then(data => {

    // parse data
    data.forEach(data => {
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    const yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.smokes)])
        .range([height, 0]);

    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
    .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", 0.5)
        .attr("stroke", "pink");

    // Create group for two x-axis labels
    const labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income (Median)");
        
    const ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Smokes (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            const value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                console.log(chosenXAxis)

                // functions here found above csv import
                
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    incomeLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    ageLabel
                      .classed("active", true)
                      .classed("inactive", false);
                }
            }
        });
}).catch(error => console.log(error));
    








    








