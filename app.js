// Set H/W/M
const svgWidth = 960;
const svgHeight = 500;
// const svgText = 

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
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)


// try to add text to circle
// svg.selectAll("text")
// .data(data)
// .enter()
// .append("text")
// .text((d) => d)
// .attr("x", (d, i) => d[0] +5)
// .attr("y", (d, i) => h - d[1]);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

  // try to add label in circle
// .attr("transform", function(d) {
//   return "translate(" + projection([d.longitude, d.latitude]) +")"});

// Try to text in circle
chartGroup.append("text")
  // .text('text');
//   .attr('text-anchor', 'middle')
//   .attr('alignment-baseline', 'middle')
  // .style('font-size', d => d.radius * 0.4 + 'px')
  // .attr('fill-opacity', 0)
  // .attr('fill', 'white')  
  .attr("x", 37.5)
  .attr("y", 237.5)
  .style("stroke", "orange")
  //   .style("font-size", "150%");
  .text("state")
// Initial Params
let chosenXAxis = "income";

// Update x-scale on click on axis label
function xScale(data, chosenXAxis) {

  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8, d3.max(data, d => d[chosenXAxis]) * 1.2])
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
    label = "Household Income (Median): ";
  }
  else {
    label = "Age: ";
  }

  const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      // return (`${ystartlabel}${d[chosenYAxis]}${yendlabel}<br>${xstartlabel}${chosenXAxis}${xendlabel}`)
      return (`${d.abbr}<br>${label}${chosenXAxis}`)
    });

  circlesGroup.call(toolTip);
  
  // Event listeners with transitions
  // let t = d3.transition().duration(1000).ease(d3.easeBounceOut)
  
  // onmouseover event
  circlesGroup.on("mouseover", function(d) { 
    toolTip.show(d, this); });
  
  // circlesGroup.on("mouseover", function (data) {
    // d3.select(this)
      // .interrupt()
      // .transition(t)
      // .attr("r", 20)
      // .attr("fill", "lightblue")
      // .attr("stroke", "yellow")
    // toolTip.show(data);
  // })
    // onmouseout event
  circlesGroup.on("mouseout", function (d) {
    
        // .interrupt()
        // .transition(t)
        // .attr("r", 10)
        // .attr("fill", "lightblue");
        // .attr("stroke", "blue")
    toolTip.hide(d, this);
    });

  // transition on page load
  // chartGroup.selectAll("circle")
  //   .transition(t)
  //   .attr("cx", d => newXScale(d[chosenXAxis]))
  //   .attr("cy", d => yLinearScale(d.smokes))

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
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", 0.5);
    // .attr("stroke", "blue");


  // try to add abbr
  // .attr("r", function(d) {return "abbr"});
  // .text(function(d) { return d.abbr; });

  // let textGroup = chartGroup.selectAll("text")
  let textGroup = chartGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("dx", function(d){return -20})
    .text(function(d) {return "state"})
    .attr("x", (d, i) => d[0])
    .attr("y", (d, i) => d[1]);

  // chartGroup.append("text")
  //   .text("state")
  //   .attr("font-family", "Courier")
  //   .attr("fill", "black")
  //   .attr("text-anchor", "middle");

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
    .text("Smokes (%)")
    .attr("fill", "blue");
  

  // _____Trying to add circle label
  // chartGroup.append("circle")
  //   .attr("dx", function(d){return -20})
  //   .text(function(d){return d.abbr});
  
  // chartGroup.append('g')
  //   .attr('dx', 12)
  //   .attr('dy', '.35em')
  //   .text("state")
  //   .attr('text-anchor', 'middle')
  //   .attr('alignment-baseline', 'middle')
  //   .attr("circle")
    // .style('font-size', d => d.radius * 0.4 + 'px')
    // .text(function(d){return d.abbr})
    // .text("what");


  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, circlesGroup, textGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
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
        if (chosenXAxis === "income") {
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


















