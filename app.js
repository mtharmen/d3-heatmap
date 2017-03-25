// http://bl.ocks.org/mbostock/3202354

const url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json"

d3.json(url, (err, data) => {
  if (err !== null) {
    console.error(err)
  }
  else {
    document.getElementById("chart").onload = makeChart(data)
  }
})


const makeChart = function(dataset) {

  const baseTemp = dataset.baseTemperature
  const temps = dataset.monthlyVariance

  const minDate = d3.min(temps, d => d.year)
  const maxDate = d3.max(temps, d => d.year)+1

  const padding = 40
  const width = (padding*2 + (maxDate-minDate)*3 + padding)
  const height = 600
  const spacing = 0

  const binWidth = (width - padding*3) / (maxDate - minDate)
  const binHeight = (height - padding*4) / 12

  const xScale = d3.scaleLinear()
                    .domain([ minDate, maxDate ])
                    .range([ padding*2, width - padding ])
  
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
  const yScale = d3.scaleLinear()
                    .domain([ 12, 0 ])
                    .range([ height - padding*2, padding*2 ])

  var svg = d3.select("#chart")
                  .append("div")
                    .attr("class", "chart")
                    .style("width", width + "px")
                    .style("height", height + "px")
                  .append("svg")                
                    .attr("width", width)
                    .attr("height", height)

  // Setting up the axes
  var minVar = d3.min(temps, d => d.variance)
  var maxVar = d3.max(temps, d => d.variance)
  
  const colors = ["#253494", "#2C7FB8", "#41B6C4", "#A1DAB4", "#FFFFCC", 
                  "#FECC5C", "#fd8d3c", "#F03B20", "#BD0026"]
  var quantize = d3.scaleQuantize()
                    .domain([minVar, maxVar])
                    .range(colors)

  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSizeOuter(0)
  svg.append("g")
      .call(xAxis)
      .attr("transform", "translate(" + 0 + "," + (height - padding*2) + ")")

  svg.append("text")
      .text("Year")
        .attr("width", width)
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ ((width - padding*3)/2 + padding*2 - 1) + "," + (height - padding)+")")

  var yAxis = d3.axisLeft(yScale).tickFormat(d => months[d]).tickSize(0)
  svg.append("g")
      .call(yAxis)
        .attr("transform", "translate(" + (padding * 2 - 1) + "," + binHeight/2 + ")")
        .attr("class", "y-axis")


  svg.append("text")
      .text("Month")
        .attr("width", height)
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (padding) + "," + (height/2)+")rotate(-90)")

  // Title
  svg.append("text")
      .text("Monthly Global Land Temperature in Celsius (1753-2015)")
        .attr("text-anchor", "middle")
        .attr("font-size", 20)
        .attr("transform", "translate(" + width/2 + "," + (padding) + ")")
  
  svg.append("text")
      .text("Relative to January 1951-December 1980 Average of 8.66°C")
        .attr("text-anchor", "middle")
        .attr("font-size", 15)
        .attr("transform", "translate(" + width/2 + "," + (padding + 20) + ")")
  
  // Legend
  let binSize = 30
  

  var legend = svg.append("g").attr("class", "legend")
  
  legend.selectAll("rect")
          .data(colors).enter().append("rect")
            .attr("x", (d, i) => i * binSize)
            .attr("y", 25)
            .attr("width", binSize)
            .attr("height", binSize)
            .attr("fill", d => d)
  
  let ticks = d3.range(colors.length + 1)  
  legend.selectAll("text")
          .data(ticks).enter()
            .append("text")
              .text(d => formatLegendText(d))
              .attr("x", d => d * binSize)
              .attr("y", 65)
              .attr("fill", "black")
              .attr("font-size", 10)
              .attr("text-anchor", "middle")
  
  legend.attr("transform", "translate(" + (width - binSize * 11) + "," + (height - padding * 2) + ")")
  
  function formatLegendText(i) {
    let binSpread = (maxVar - minVar) / colors.length
    return ((i) * binSpread + minVar).toFixed(1)
  }
            

  // Bins
  var bins = svg.append("g").attr("class", "bins")
                  .selectAll("rect")
                    .data(temps).enter()
                      .append("rect")
                        .attr("x", d => xScale(d.year))
                        .attr("y", d => yScale(d.month-1))
                        .attr("width", binWidth)
                        .attr("height", binHeight)
                        .attr("fill", d => quantize(d.variance))
                      .on("mouseover", mouseOver)
                      .on("mouseout", mouseOut)
                      .on("mousemove", mouseMove)

  var tooltip = d3.select("#chart")
                    .append("div")
                      .attr("class", "tooltip")
                      .style("display", "none")
                      .style("opacity", 0)

  function mouseOver() {
     tooltip.transition()
             .duration(100)
             .style("display", "inline")
             .style("opacity", 1)
   }

  function mouseMove(d) {
    var text = d.year + " " + months[d.month-1] + "<br />" + 
                (baseTemp + d.variance).toFixed(3) + "°C" + "<br />" +
                (d.variance > 0 ? "+" : "-") + Math.abs(d.variance) + "°C"
    tooltip.html(text)
            .style("left", (d3.event.pageX - 85) + "px")
            .style("top", (d3.event.pageY - 35) + "px")        
  }

  function mouseOut() {
    tooltip.transition()
            .duration(100)
            .style("display", "none")
  }
}
