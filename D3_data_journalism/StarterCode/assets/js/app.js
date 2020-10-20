// Assignment requrements:
// Create a scatterplot for Healthcare vs. Poverty OR Smokers vs. Age

// To do it you'll:
// Need to pull in the data from data.csv using the d3.csv function

// Scatterplot should include:
    // State abbreviations in circles
    // create and situate axes and labels to left and bottom of chart

// Chart Params
var svgWidth = 960;
var svgHeight = 500;

// Chart Margin
var margin = {
    top: 30,
    right: 60,
    bottom: 80,
    left: 70
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//ADD IN FUNCTIONS
// function used for updating x-scale var upon click on axis label
function xScale(riskData, chosenXAxis) {
    // create the scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(riskData, d => d[chosenXAxis]) * 0.8,
            d3.max(riskData, d => d[chosenXAxis]) * 1.2 
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(riskData, chosenYAxis) {
    // create the scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(riskData, d => d[chosenYAxis]) * 0.7,
            d3.max(riskData, d => d[chosenYAxis]) * 1.2 
        ])
        .range([0, width]);
    return yLinearScale;
}

// function used for updating xAxis upon label click
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating yAxis upon label click
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }


// function used to update circles text with a transition on new circles for X coordinates
function renderXText(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// function used to update circles text with a transition on new circles for y coordinates
function renderYText(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis])+7);
    return circlesGroup;
} 

// format number to USD
// documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat
let formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
    var xlabel;
    if (chosenXAxis === "poverty") {
        xlabel = "Percent in Poverty";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age (Median)";
    }
    else {
        xlabel = "Household Income";
    }
    var ylabel;
    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokers";
    }
    else {
        ylabel = "Obesity"
    }
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([50, -60])
        .html(function(d) {
            if(chosenXAxis === "income"){
                let incomeLevel = formatter.format(d[chosenXAxis]);
                return (`${d.state}<br>${xlabel}: ${incomeLevel.substring(0, incomeLevel-3)}<br>${ylabel}: ${d[chosenYAxis]}`)
            } else {
                return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`)
            };
        });
        circlesGroup.call(toolTip);

    //mouseover
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

// Load in the data from data.csv using d3.csv
d3.csv("./assets/data/data.csv").then(riskData => {
    // Print the data
    console.log(riskData);

    // First chart will be Healthcare vs. Poverty
    // Initial Param
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // Parse data/cast as numbers
    riskData.forEach(data => {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(riskData, chosenXAxis);
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(riskData, d => d.healthcare)])
        .range([height, 0]);
    
    // Create initaial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append the SVG group
    let chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`); 

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    
    // append initial circles
    chartGroup = chartGroup.selectAll("circle")
        .data(riskData)
        .join("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "blue")
        .attr("opacity", 0.5)
        .attr("stroke", "white");

    // State abbreviation
    var circleText = chartGroup.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
        .classed("stateText", true);


    // create group for 3 x-axis labels
    var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height})`);
    
    var povertyLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Percent in Poverty");
    
    var ageLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    
    // create group for 3 y-axis labels
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height})`);
    
    var healthcareLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -40)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lack Healthcare (%)");
    
    var smokesLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokers (%)");

    var obeseLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -80)
        .attr("value", "obeasity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");
    
    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

    // x axis labels event listener
    labelsGroupX.selectAll("text")
        .on("click", function() {
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;

                //make these functions above the import
                xLinearScale = xScale(riskData, chosenXAxis);

                //update x axis with transition
                xAxis = renderCircles(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

            }
        });

        // y axis labels event listener
    labelsGroupY.selectAll("text")
    .on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
            // replaces chosenYAxis with value
            chosenYAxis = value;

            //updates y scale for data
            yLinearScale = yScale(riskData, chosenYAxis);

            //update y axis with transition
            yAxis = renderCircles(yLinearScale, YAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "smokes") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

        }
    });
}).catch(error => console.log(error));
