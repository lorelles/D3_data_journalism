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

// Create an SVG wrapper, append an SVG group that will hold chart, shift the latter by left and top margins.
const svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "income";
let chosenYAxis = "smokes";

// Update x-scale on click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  return xLinearScale;
}

// Update y-scale 
function yScale(data, chosenYAxis) {
  // create scales
  const yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}

// Update xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// Update yAxis const upon click on axis label
function renderAxes(newYScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// Update circles group with transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// Update text group with transition to new circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
    .attr("text-anchor", "middle");
  return textGroup;
}

// Update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
  let label;
  if (chosenXAxis === "income") {
    label = "Household Income (Median): ";
  }
  else {
    label = "Age: ";
  }
  if (chosenYAxis === "smokes") {
    label = "Smokes (%): ";
  }
  else {
    label = "Obesity (%): ";
  }


  // Set up toolTip
  const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function (d) {
      // return (`${ystartlabel}${d[chosenYAxis]}${yendlabel}<br>${xstartlabel}${chosenXAxis}${xendlabel}`)
      return (`${d.abbr}<br>${label}${d[chosenXAxis]}<br>${label}${d[chosenYAxis]}`)
    });

  // Set toolTip for circles
  circlesGroup.call(toolTip);

  // Event listeners with transitions
  // let t = d3.transition().duration(1000).ease(d3.easeBounceOut)

  // onmouseover event
  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })

    // onmouseout event
    .on("mouseout", function (data) {
      // .attr("stroke", "blue")
      toolTip.hide(data, this);
    });

  // Set up toolTip for text
  textGroup.call(toolTip);

  // onmouseover event
  textGroup.on("mouseover", function (data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function (data) {
      toolTip.hide(data, this);
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
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  let xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  let yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  const bottomAxis = d3.axisBottom(xLinearScale);
  const leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  let yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  let circlesGroup = chartGroup.selectAll(".stateCircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "stateCircle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    // .attr("fill", "lightblue")
    .attr("opacity", 0.8);
  // .attr("stroke", "blue");

  // append initial textGroup
  let textGroup = chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => (d.abbr))
    .attr("fill", "white")
    .attr("font-size", "10px")
    .attr("text-anchor", "middle");

  // let textGroup = chartGroup.selectAll("text")
  // let textGroup = chartGroup.selectAll("text")
  //   .attr("class", "circle")
  //   .data(data)
  //   .enter()
  //   .append("text")
  //   .attr("dx", function (d) { return -20 })
  //   .text(function (d) { return "state" })
  //   .attr("x", (d, i) => d[0])
  //   .attr("y", (d, i) => d[1]);

  // Create group for two x-axis labels
  const xLabel = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const incomeLabel = xLabel.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Household Income (Median)");

  const ageLabel = xLabel.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // Create group for two y-axis labels
  const yLabel = chartGroup.append("g");
    // .attr("transform", `translate(${width / 2}, ${height + 20})`);

  const smokesLabel = yLabel.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Smokes (%)");
  // .attr("fill", "blue");

  const obesityLabel = yLabel.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("active", true)
    .text("Obesity (%)");

  // _____Trying to add circle label

  // chartGroup.append('text')
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
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

  // x axis labels event listener
  xLabel.selectAll("text")
    .on("click", function () {
      // get value of selection
      const value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)

        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates circles with new x values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

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

  // y axis labels event listener
  yLabel.selectAll("text")
    .on("click", function () {
      // get value of selection
      const value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenYAxis with value
        chosenYAxis = value;
        console.log(YAxis)

        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates circles with new y values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

}).catch(error => console.log(error));


















