// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
function fixTime(time) {
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
function checkValue(value) {
  if (value) {
    if (value == "No") {
      return 0;
    } else if (value == "Yes") {
      return 1;
    } else if (!isNaN(value)) {
      return parseFloat(value);
    }
  }
  //return undefinied otherwise
}

function Chart(params) {

	//Define the data that the chart will use
	this.data = params.data
	this.container = params.container

	//Get container size
	let containerHeight = this.container.clientHeight;
	let containerWidth = this.container.clientWidth;

	//Define chart margin, width and height
	this.margin = { top: 50, right: 50, bottom: 40, left: 60 };
	this.width = containerWidth - this.margin.left - this.margin.right;
	this.height = containerHeight - this.margin.top - this.margin.bottom;
}

Chart.prototype.draw = function(){
	//Append the svg element to the chart container
	this.svg = d3
		.select(this.container)
		.append("svg")
		.attr("viewBox", `0 0 ${this.width} ${this.height}`);

	this.createScales()
	this.addAxes()
	this.addGrid()
	this.addLine()
}

Chart.prototype.createScales = function(){
	//Define the scale of x
	this.xScale = d3
		.scaleTime()
		.domain(d3.extent(this.data, (d) => fixTime(d["Time"])))
		.range([this.margin.left, this.width - this.margin.right]);
	
	//Define the scale of y
	this.yScale = d3
		.scaleLinear()
		.domain(d3.extent(this.data, (d) => checkValue(d["CPU [°C]"])))
		.nice()
		.range([this.height - this.margin.bottom, this.margin.top]);
}

Chart.prototype.addAxes = function(){
	//Define the x axis
	this.xAxis = (g) =>
		g
			.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
			.transition()
			.duration(1000)
			.call(d3.axisBottom(this.xScale).tickSizeOuter(0))
			.attr("class", "x-axis");
			
	//Append the x Axis
	this.svg.append("g").call(this.xAxis);

	//Define the y axis
	this.yAxis = (g) =>
		g
			.attr("transform", `translate(${this.margin.left},0)`)
			.transition()
			.duration(1000)
			.call(d3.axisLeft(this.yScale))
			.call((g) => g.select(".domain").remove())
			.attr("class", "y-axis");
			
	//Append the y Axis
this.svg.append("g").call(this.yAxis);
}

Chart.prototype.addGrid = function(){
	//Append the grid line in y axis
	this.svg
		.append("g")
		.attr("class", "grid")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.call(d3.axisLeft(this.yScale)
			.tickSize(-this.width + this.margin.right * 2)
			.tickFormat(""))
		.call((g) => g.select(".domain").remove());
}


Chart.prototype.addLine = function(){
	//Define the chart line that will be drawn. The x point is the Time value and the Y point is the CPU temperature value
	let line = d3.line()
		.defined((d) => checkValue(d["CPU [°C]"]) !== undefined)
		.x((d) => this.xScale(fixTime(d["Time"])))
		.y((d) => this.yScale(checkValue(d["CPU [°C]"])));
		
	//Append the path that contains the chart line
	this.svg
		.append("path")
		.datum(this.data)
		.attr("fill", "none")
		.attr("stroke", "#4E7BFF")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("class", "line")
		.attr("d", line);
}

//Update chart with the specified field data
Chart.prototype.update = function(field){
	//Update domain of y scale
	this.yScale.domain(d3.extent(this.data, (d) => checkValue(d[field]))).nice();

	//Select all y axis and update values by calling yAxis
	this.svg.selectAll(".y-axis")
		.transition()
		.duration(1000)
		.call(this.yAxis);

	//Select all grid lines in y axis and update positions
	this.svg.selectAll(".grid")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.call(d3.axisLeft(this.yScale)
			.tickSize(-this.width + this.margin.right * 2)
			.tickFormat(""))
		.call((g) => g.select(".domain").remove());

	// If there is only 1 grid line, remove it (Not necessary to have just 1 line)
	if (this.svg.selectAll(".grid").selectAll(".tick").size() == 1) {
		this.svg.select(".grid").select(".tick").remove();
	}

	//After update the y-axis, update the line in path object with new data
	this.svg
		.selectAll(".line")
		.transition()
		.duration(1000)
		.attr("d",d3.line()
			.defined((d) => checkValue(d[field]) !== undefined)
			.x((d) => this.xScale(fixTime(d["Time"])))
			.y((d) => this.yScale(checkValue(d[field])))
		);
}