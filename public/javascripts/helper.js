// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
function parseTime(time) {
  if (time) {
    const data = time.split(":");

    const newTime = new Date();
    newTime.setHours(data[0]);
    newTime.setMinutes(data[1]);
    newTime.setSeconds(data[2]);

    //This validation is required because sometimes the string "Time" (header name) appears between the times
    //Besides any time that may come wrong (if it happens)
    if (!isNaN(newTime.getTime())) {
      return newTime;
    }
  }
}

//Check if value ins't missing, convert Yes/No to 1/0 if necesssary or return the value in float
function fixValue(value) {
  if (value) {
    if (value == "No") return 0;  
    if (value == "Yes") return 1;  
    if (!isNaN(value)) return parseFloat(value);
  }
  //return undefinied otherwise
}

function changeTooltipData(g, value){
  let tooltipText = value.split("|");
  tooltipText[0] = `Value: ${tooltipText[0]}`;
  tooltipText[1] = `Time: ${tooltipText[1]}`;

  g.style("display", null)
    .style("pointer-events", "none")
    .style("font", "10px sans-serif");

  const path = g
    .selectAll("path")
    .data([null])
    .join("path")
    .attr("fill", "white")
    .attr("stroke", "black");

  const text = g
    .selectAll("text")
    .data([null])
    .join("text")
    .call((text) =>
      text
        .selectAll("tspan")
        .data(tooltipText)
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i) => `${i * 1.1}em`)
        .style("font-weight", (_, i) => (i ? null : "bold"))
        .text((d) => d)
    );

  const { x, y, width: w, height: h } = text.node().getBBox();

  text.attr("transform", `translate(${-w / 2},${15 - y})`);
  path.attr(
    "d",
    `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
  );
};


async function getLogExample(){
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  return await fetch(proxyurl + "https://raw.githubusercontent.com/leo-holanda/logcharts.io/master/public/example.CSV")
    .then((response) => { 
      return response.text() 
    })
}

function isCSV(file){
  if (file.type == "text/csv" || !file.type) return true;
}