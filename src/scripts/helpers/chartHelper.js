// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
export function parseTime(time) {
  if (time) {
    const data = time.split(':');

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
    if (value == 'No') return 0;
    if (value == 'Yes') return 1;
    if (!isNaN(value)) return parseFloat(value);
  }
  //return undefinied otherwise
}

/*
We need to find the left location of the tiny circle
If that location + the width of tooltip > the width of the chart
So it means that the tooltip is outside the chart
Then we must change the location of the tooltip to the left side
We need to calculte areaOutisdeChart to have a more accurate condition to change location
*/

export function checkTooltipHorizontalPosition(tooltipParams) {
  let bodyWidth = document.body.clientWidth;
  let chartWidth = document
    .querySelector('.chart-svg')
    .getBoundingClientRect().width;
  let areaOutsideChart = bodyWidth - chartWidth;

  let circleLocation = tooltipParams.tooltipCircle
    .node()
    .getBoundingClientRect();
  let tooltipBox =
    circleLocation.left +
    tooltipParams.tooltipBackground.node().getBoundingClientRect().width -
    areaOutsideChart;

  return tooltipBox > tooltipParams.chart.width ? true : false;
}

export function repositionTooltipHorizontally(
  tooltipParams,
  isTooltipOutOfScreen
) {
  let tooltipWidth =
    tooltipParams.tooltipBackground.node().getBoundingClientRect().width + 15;

  let xValue = isTooltipOutOfScreen ? -tooltipWidth : 15;
  let dXValue = isTooltipOutOfScreen ? -tooltipWidth + 5 : 20;

  tooltipParams.tooltip.node().setAttribute('x', xValue);
  tooltipParams.tooltipBackground.node().setAttribute('x', xValue);
  tooltipParams.tooltipBackgroundStroke.node().setAttribute('x', xValue);
  tooltipParams.tooltipTime.node().setAttribute('dx', dXValue);
}

/*
In this case, we need to find the bottom location of the tiny circle
If that location + a little margin of 20 + offset which is the space occupied by values
is > than the y coordinate of the x axis, it means that the tooltip is above the x axis
To prevent that, we need to change the y coordinate of some elements in tooltip
*/

export function checkTooltipVerticalPosition(tooltipParams) {
  let circleLocation = tooltipParams.tooltipCircle
    .node()
    .getBoundingClientRect();
  let offset = (document.querySelectorAll('.selector-btn').length - 1) * 15;
  let tooltipVerticalLocation = circleLocation.bottom + 20 + offset;
  let chartHeight = document.querySelector('.domain').getBoundingClientRect().y;

  return tooltipVerticalLocation > chartHeight ? true : false;
}

export function repositionTooltipVertically(
  tooltipParams,
  isTooltipOutOfScreen
) {
  let circleLocation = tooltipParams.tooltipCircle
    .node()
    .getBoundingClientRect();
  let offset = (document.querySelectorAll('.selector-btn').length - 1) * 15;
  let tooltipVerticalLocation = circleLocation.bottom + 20 + offset;

  let chartHeight = document.querySelector('.domain').getBoundingClientRect().y;

  let difference = tooltipVerticalLocation - chartHeight + offset;

  let yValue = isTooltipOutOfScreen ? -21 - difference : -21;
  let dYValue = isTooltipOutOfScreen ? 15 - difference : 15;

  tooltipParams.tooltip.node().setAttribute('y', yValue);
  tooltipParams.tooltipBackground.node().setAttribute('y', yValue);
  tooltipParams.tooltipBackgroundStroke.node().setAttribute('y', yValue);
  tooltipParams.tooltipTime.node().setAttribute('dy', dYValue);
}

export function getRow(tooltipParams, xScale) {
  const bisector = d3.bisector((d) => parseTime(d['Time'])).center;
  const currentTime = xScale.invert(d3.pointer(event, this)[0]);
  const index = bisector(tooltipParams.chart.log, currentTime, 1);
  const previousRow = tooltipParams.chart.log[index - 1];
  const currentRow = tooltipParams.chart.log[index];

  //Honestly I don't know why this line work or why it is here
  //I just got this here https://observablehq.com/@d3/line-chart-with-tooltip
  return currentRow &&
    currentTime - parseTime(previousRow['Time']) >
      parseTime(currentRow['Time']) - currentTime
    ? currentRow
    : previousRow;
}

export function addFieldInTooltip(
  field,
  row,
  tooltipParams,
  isTooltipOutOfScreen
) {
  let value = field + ': ' + fixValue(row[field]);
  let tooltipWidth =
    tooltipParams.tooltipBackground.node().getBoundingClientRect().width + 15;
  let xValue = isTooltipOutOfScreen ? -tooltipWidth + 5 : 20;

  tooltipParams.tooltipText
    .append('tspan')
    .text(value)
    .attr('id', field)
    .attr('class', 'tooltip-value')
    .attr('x', xValue)
    .attr('dy', 15);
}
