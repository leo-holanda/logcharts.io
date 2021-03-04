// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
export function parseTime(time) {
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
export function fixValue(value) {
  if (value) {
    if (value == "No") return 0;  
    if (value == "Yes") return 1;  
    if (!isNaN(value)) return parseFloat(value);
  }
  //return undefinied otherwise
}

export function repositionTooltipHorizontally(isTooltipOutOfScreen){
  let tooltip = document.querySelector(".tooltip")
  let tooltipBackground = document.querySelector(".tooltip-background")
  let tooltipBackgroundStroke = document.querySelector(".tooltip-background-stroke")
  let tooltipTime = document.querySelector(".tooltip-time")

  let tooltipWidth = tooltipBackground.getBoundingClientRect().width + 15

  tooltip.setAttribute("x", isTooltipOutOfScreen? -tooltipWidth : 15)
  tooltipBackground.setAttribute("x", isTooltipOutOfScreen ? -tooltipWidth : 15)
  tooltipBackgroundStroke.setAttribute("x", isTooltipOutOfScreen ? -tooltipWidth : 15)
  tooltipTime.setAttribute("dx", isTooltipOutOfScreen ? -tooltipWidth + 5: 20)
}

export function repositionTooltipVertically(isTooltipOutOfScreen, difference = null){
  let tooltip = document.querySelector(".tooltip")
  let tooltipBackground = document.querySelector(".tooltip-background")
  let tooltipBackgroundStroke = document.querySelector(".tooltip-background-stroke")
  let tooltipTime = document.querySelector(".tooltip-time")

  tooltip.setAttribute("y", isTooltipOutOfScreen? -21 - difference : -21)
  tooltipBackground.setAttribute("y", isTooltipOutOfScreen? -21 - difference : -21)
  tooltipBackgroundStroke.setAttribute("y", isTooltipOutOfScreen? -21 - difference : -21)
  tooltipTime.setAttribute("dy", isTooltipOutOfScreen ? 15 - difference : 15)
}

export async function getLogExample(){
  return await fetch("./assets/example.CSV")
  .then((response) => {
    return response.text()
  })
} 

//Sometimes file type can be empty. In this case
//We will assume that is an CSV and validate in isHWLog()
export function isCSV(file){
  if (file.type == "text/csv" || file.type == "application/vnd.ms-excel" || !file.type) return true;
}

export function isHWLog(fields){
  if(fields.includes("Time") && fields.includes("CPU [°C]")) return true
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/2450976#2450976
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//https://gomakethings.com/a-better-better-way-to-generate-a-random-color-with-vanilla-js/
export function generateRandomColor(){
  // The available hex options
  var hex = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var color = '#';

  // Create a six-digit hex color
  for (var i = 0; i < 6; i++) {

    // Shuffle the hex values
    shuffle(hex);

    // Append first hex value to the string
    color += hex[0];
  }

  return color
}