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
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append the SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


//ADD IN FUNCTIONS TO MAKE THE BELOW CODE WORK
function updateToolTip(chosenXAxis, circlesGroup) {
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
        .attr("class", "d3-tip")
        .offset([50, -60])
        .html(d => `${d}`)
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
        // commenting these out just in case im not able to get to them:
        // data.age = +data.age;
        // data.income = +data.income;
        // data.obesity = +data.obesity;
        // data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(riskData, chosenXAxis);
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(riskData, d => d.healthcare)])
        .range([height, 0]);
    
    // Create initaial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAcis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    
    // append initial circles
    var chartGroup = chartGroup.selectAll("circle")
        .data(riskData)
        .join("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "lightblue")
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
    
    // updateToolTip function (above csv import - need to make)
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroupX.selectAll("text")
        .on("click", function() {
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAXis with value
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
                if (chosenXAxis === "num_albums") {
                    albumsLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    hairLengthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    albumsLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    hairLengthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
            }
        });

}).catch(error => console.log(error));
