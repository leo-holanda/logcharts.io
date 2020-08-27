function Chart(params) {

	//Define the data that the chart will use
	this.log = params.parsedLog
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
		.domain(d3.extent(this.log, (row) => parseTime(row["Time"])))
		.range([this.margin.left, this.width - this.margin.right]);
	
	//Define the scale of y
	this.yScale = d3
		.scaleLinear()
		.domain(d3.extent(this.log, (row) => fixValue(row["CPU [°C]"])))
		.nice()
		.range([this.height - this.margin.bottom, this.margin.top]);
}

//g is a container used to group other SVG elements
//In this case to group ticks and values in axis
Chart.prototype.addAxes = function(){
	//Define the x-axis
	this.xAxis = (g) =>
		g
			.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
			.transition()
			.duration(1000)
			.call(d3.axisBottom(this.xScale))
			.attr("class", "x-axis");
			
	//Append the x-axis
	this.svg.append("g").call(this.xAxis);

	//Define the y-axis
	this.yAxis = (g) =>
		g
			.attr("transform", `translate(${this.margin.left},0)`)
			.transition()
			.duration(1000)
			.call(d3.axisLeft(this.yScale))
			.call((g) => g.select(".domain").remove())
			.attr("class", "y-axis");
			
	//Append the y-axis
	this.svg.append("g").call(this.yAxis);
}

Chart.prototype.addGrid = function(){
	//Append the grid line in y-axis
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
		.defined((row) => fixValue(row["CPU [°C]"]) !== undefined)
		.x((row) => this.xScale(parseTime(row["Time"])))
		.y((row) => this.yScale(fixValue(row["CPU [°C]"])));
		
	//Append the path that contains the chart line
	this.svg
		.append("path")
		.datum(this.log)
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
	this.yScale.domain(d3.extent(this.log, (row) => fixValue(row[field]))).nice();

	//Select y-axis and update ticks and values by calling yAxis function
	this.svg.select(".y-axis")
		.transition()
		.duration(1000)
		.call(this.yAxis);

	//Select grid in y-axis and update grid lines position
	this.svg.select(".grid")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.call(d3.axisLeft(this.yScale)
			.tickSize(-this.width + this.margin.right * 2)
			.tickFormat(""))
		.call((g) => g.select(".domain").remove());

	// If there is only 1 grid line, remove it (Not necessary to have just 1 line)
	if (this.svg.select(".grid").selectAll(".tick").size() == 1) {
		this.svg.select(".grid").select(".tick").remove();
	}

	//Update the line in path object with new data
	this.svg
		.select(".line")
		.transition()
		.duration(1000)
		.attr("d", d3.line()
			.defined((row) => fixValue(row[field]) !== undefined)
			.x((row) => this.xScale(parseTime(row["Time"])))
			.y((row) => this.yScale(fixValue(row[field])))
		);
}