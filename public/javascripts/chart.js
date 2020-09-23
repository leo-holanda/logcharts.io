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
	this.height = containerHeight - this.margin.top - this.margin.bottom - 100;
	this.brushHeight = 80;
}

Chart.prototype.draw = function(){
	//Append the svg to the chart container
	this.chartSVG = d3
		.select(this.container)
		.append("svg")
		.attr("class", "chart-svg")
		.attr("viewBox", `0 0 ${this.width} ${this.height}`);

	//Append the context svg to the chart container
	this.contextSVG = d3
		.select(this.container)
		.append("svg")
		.attr("class", "context-svg")
		.attr("viewBox", `0 0 ${this.width} 100`)
	
	this.addScales()
	this.addAxes()
	this.addGrid()
	this.addLine()
	this.addBrush()
	this.addTooltip()
}

Chart.prototype.addScales = function(){
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

	//Define the special y scale for the context svg
	this.yContextScale = d3
		.scaleLinear()
		.domain(d3.extent(this.log, (row) => fixValue(row["CPU [°C]"])))
		.range([this.brushHeight, this.margin.top]);
}

//g is a container used to group other SVG elements
//In this case to group ticks and values in axis
Chart.prototype.addAxes = function(){
	//Define the x-axis
	this.xAxis = (g, duration = 1000, scale = this.xScale, height = this.height, margin = this.margin.bottom) =>
		g
			.attr("transform", `translate(0, ${height - margin})`)
			.transition()
			.duration(duration)
			.call(d3.axisBottom(scale))
			.attr("class", "x-axis");
			
	//Append the x-axis
	this.chartSVG.append("g").call(this.xAxis);
	this.contextSVG.append("g").call(this.xAxis, 1000, this.xScale, 100, 20)

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
	this.chartSVG.append("g").call(this.yAxis);
}

Chart.prototype.addGrid = function(){
	//Append the grid line in y-axis
	this.chartSVG
		.append("g")
		.attr("class", "grid")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.call(d3.axisLeft(this.yScale)
			.tickSize(-this.width + this.margin.right * 2)
			.tickFormat(""))
		.call((g) => g.select(".domain").remove());
}

Chart.prototype.addLine = function(){
	//Append the clip path to the svg to clip the line chart
	this.clip = this.chartSVG.append("clipPath")
		.attr("id", "line_clip")
	.append("rect")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.attr("width", this.width - (this.margin.right * 2) - 9)
		.attr("height", this.height)
	
	//Append the path that contains the chart line
	this.chartSVG
		.append("path")
		.datum(this.log)
		.attr("clip-path", "url(#line_clip)")
		.attr("fill", "none")
		.attr("stroke", "#4E7BFF")
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("class", "chart-line")
		.attr("d", d3.line()
			.defined((row) => fixValue(row["CPU [°C]"]) !== undefined)
			.x((row) => this.xScale(parseTime(row["Time"])))
			.y((row) => this.yScale(fixValue(row["CPU [°C]"]))))

	//Append the path that contains the line for the context svg
	this.contextSVG.append("path")
      .datum(this.log)
	  .attr("fill", "none")
	  .attr("stroke", "#4E7BFF")
	  .attr("stroke-width", 2)
	  .attr("stroke-linejoin", "round")
	  .attr("stroke-linecap", "round")
	  .attr("class", "context-line")
      .attr("d", d3.line()
		.defined((row) => fixValue(row["CPU [°C]"]) !== undefined)
		.x((row) => this.xScale(parseTime(row["Time"])))
		.y((row) => this.yContextScale(fixValue(row["CPU [°C]"]))));
}

//Update chart with the specified field data
Chart.prototype.updateByField = function(field){
	//We need this to be accessible in updateByBrush method
	this.selectedField = field

	//And this in addTooltip method
	this.chartSVG.select(".chart-line")._groups[0][0].setAttribute("field", field)

	//Update domain of y scale
	this.yScale.domain(d3.extent(this.log, (row) => fixValue(row[field]))).nice();
	this.yContextScale.domain(d3.extent(this.log, (row) => fixValue(row[field])));

	//Select y-axis and update ticks and values by calling yAxis function
	this.chartSVG.select(".y-axis")
		.transition()
		.duration(1000)
		.call(this.yAxis);

	//Select grid in y-axis and update grid lines position
	this.chartSVG.select(".grid")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.call(d3.axisLeft(this.yScale)
			.tickSize(-this.width + this.margin.right * 2)
			.tickFormat(""))
		.call((g) => g.select(".domain").remove());

	// If there is only 1 grid line, remove it (Not necessary to have just 1 line)
	if (this.chartSVG.select(".grid").selectAll(".tick").size() == 1) {
		this.chartSVG.select(".grid").select(".tick").remove();
	}

	//Update the line in path object with new data
	this.chartSVG
		.select(".chart-line")
		.transition()
		.duration(1000)
		.attr("d", d3.line()
			.defined((row) => fixValue(row[field]) !== undefined)
			.x((row) => this.xScale(parseTime(row["Time"])))
			.y((row) => this.yScale(fixValue(row[field])))
		);

	//Update the line in context
	this.contextSVG
		.select(".context-line")
		.transition()
		.duration(1000)
		.attr("d", d3.line()
			.defined((row) => fixValue(row[field]) !== undefined)
			.x((row) => this.xScale(parseTime(row["Time"])))
			.y((row) => this.yContextScale(fixValue(row[field])))
		);

	//Reset brush
	this.contextSVG.select(".brush")
		.transition()
		.duration(1000)
		.call(this.brush.move, this.xScale.range())

	//Reset domain to prevent tooltip using previous domain
	this.chartSVG.select(".chart-line")._groups[0][0].setAttribute("domain", this.xScale.domain())
}

Chart.prototype.addBrush = function(){
	this.brush = d3.brushX()
		.extent([[this.margin.left, 0], [this.width - this.margin.right, this.brushHeight]])
		.on("brush", (event) => {
			/*
			updateByField resets the brush, generating an event that prevents
			the chart line transition from happening
			Checking if sourceEvent isn't null fix this because
			resetting the brush generates an event with null sourceEvent
			*/
			if(event.sourceEvent){
			 	//Selection gives us the brush's coordinates
			 	let selection = event.selection
			 	this.updateByBrush(selection, this.xScale.copy())
			 }
		})
	
	//Append the brush in context svg
	this.contextSVG.append("g")
		.attr("class", "brush")
		.call(this.brush)
		.call(this.brush.move, this.xScale.range());
}

//Update chart by brush's selection.
Chart.prototype.updateByBrush = function(selection, scale){
	//We need to convert the brush's selection to the equivalent Date values using scale.invert
	//So we can use it in scale's domain

	let field = this.selectedField ? this.selectedField : "CPU [°C]"

	scale.domain([scale.invert(selection[0]), scale.invert(selection[1])])

	//Update domain used by tooltip
	this.chartSVG.select(".chart-line")._groups[0][0].setAttribute("domain", scale.domain())

	this.chartSVG.select(".x-axis").call(this.xAxis, 0, scale);

	this.chartSVG.select(".chart-line")
		.attr("d", d3.line()
			.defined((row) => fixValue(row[field]) !== undefined)
			.x((row) => scale(parseTime(row["Time"])))
			.y((row) => this.yScale(fixValue(row[field]))))
}

Chart.prototype.addTooltip = function(){

	// Given the pointer position, find the equivalent time in x scale
	// Then, find the equivalent row using the index given by bisector
	function findLogRow(scale, pointer) {
		const bisector = d3.bisector((d) => parseTime(d["Time"])).left;
	
		const currentTime = scale.invert(pointer);
		const index = bisector(chart.log, currentTime, 1);
		const previousRow = chart.log[index - 1];
		const currentRow = chart.log[index];
	
		return currentRow && currentTime - parseTime(previousRow["Time"]) > parseTime(currentRow["Time"]) - currentTime ? currentRow : previousRow;
	}

	const chart = this;
	const tooltip = this.chartSVG.append("g")

	//Store domain and field data in chart so we can get it later
	this.chartSVG.select(".chart-line")._groups[0][0].setAttribute("domain", this.xScale.domain())
	this.chartSVG.select(".chart-line")._groups[0][0].setAttribute("field", "CPU [°C]")

	this.chartSVG.on("touchmove mousemove", function(event){
		//Get the current x domain and log field
		const domain = this.childNodes[4].getAttribute("domain").split(",")
		const field = this.childNodes[4].getAttribute("field")

		const scale = d3
			.scaleTime()
			.domain(domain.map((d) => new Date(d)))
			.range([chart.margin.left, chart.width - chart.margin.right]);

		const row = findLogRow(scale, d3.pointer(event, this)[0]);
			
		tooltip
			.attr("transform", `translate(${scale(parseTime(row["Time"]))},${chart.yScale(fixValue(row[field]))})`)
			.call(changeTooltipData, `${fixValue(row[field])}|${parseTime(row["Time"]).toLocaleTimeString()}`)
	})

	this.chartSVG.on("touchend mouseleave", () => tooltip.style("display", "none"));
}