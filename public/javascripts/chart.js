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
	
	//Append the clip path to the svg to clip the line chart
	this.clip = this.chartSVG.append("clipPath")
		.attr("id", "line_clip")
			.append("rect")
		.attr("transform", `translate(${this.margin.left}, 0)`)
		.attr("width", this.width - (this.margin.right * 2) - 9)
		.attr("height", this.height)

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
		.attr("id", "line1")
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

Chart.prototype.addNewLine = function(id, xScale = this.xScale.copy(), yScale = this.yScale.copy()){
	//https://css-tricks.com/snippets/javascript/random-hex-color/
	let randomColor = Math.floor(Math.random()*16777215).toString(16);
	
	//When adding a new line, verify if scale was modified by brush
	//if yes, use modified scale. if not, use normal scale
	this.brushedXScale ? xScale = this.brushedXScale : xScale.domain(d3.extent(this.log, (row) => parseTime(row["Time"])))
	yScale.domain(d3.extent(this.log, (row) => fixValue(row["CPU [°C]"]))).nice();

	this.chartSVG
		.append("path")
		.datum(this.log)
		.attr("clip-path", "url(#line_clip)")
		.attr("fill", "none")
		.attr("stroke", "#" + randomColor)
		.attr("stroke-width", 2)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("class", "chart-line")
		.attr("field", "CPU [°C]")
		.attr("id", id)
		.attr("d", d3.line()
			.defined((row) => fixValue(row["CPU [°C]"]) !== undefined)
			.x((row) => xScale(parseTime(row["Time"])))
			.y((row) => yScale(fixValue(row["CPU [°C]"]))))
}

Chart.prototype.updateLineByField = function(field, id, xScale = this.xScale.copy(), yScale = this.yScale.copy()){
	//When adding a new line, verify if scale was modified by brush
	//if yes, use modified scale. if not, use normal scale
	this.brushedXScale ? xScale = this.brushedXScale : xScale.domain(d3.extent(this.log, (row) => parseTime(row["Time"])))
	yScale.domain(d3.extent(this.log, (row) => fixValue(row[field]))).nice();

	this.chartSVG
		.select('#' + id)
		.transition()
		.duration(1000)
		.attr("field", field)
		.attr("d", d3.line()
			.defined((row) => fixValue(row[field]) !== undefined)
			.x((row) => xScale(parseTime(row["Time"])))
			.y((row) => yScale(fixValue(row[field])))
		);
}

//Update chart with the specified field data
Chart.prototype.updateByField = function(field){
	//When updating the main line field, reset the scale modified by brush
	//So new lines can be created with normal scale
	//This makes sense because the brush will reset in the end of this function
	this.brushedXScale = undefined

	//We need this to be accessible in updateByBrush method
	this.selectedField = field

	//And this in addTooltip method
	this.chartSVG.select(".chart-line")._groups[0][0].setAttribute("field", field)

	//Update domain of x, y and context scale
	this.xScale.domain(d3.extent(this.log, (row) => parseTime(row["Time"])))
	this.yScale.domain(d3.extent(this.log, (row) => fixValue(row[field]))).nice();
	this.yContextScale.domain(d3.extent(this.log, (row) => fixValue(row[field])));

	//Updating x-axis and y-axis ticks and values
	this.chartSVG.select(".x-axis").call(this.xAxis);
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

	//We reset the brush so we must reset the lines too
	yScale = this.yScale.copy()
	for (selector of document.querySelectorAll(".line-selector")){
		field = selector.parentNode.querySelector("label").innerHTML
		yScale.domain(d3.extent(this.log, (row) => fixValue(row[field]))).nice();
		
		this.chartSVG.select("#" + selector.id)
			.transition()
			.duration(1000)
			.attr("d", d3.line()
				.defined((row) => fixValue(row[field]) !== undefined)
				.x((row) => this.xScale(parseTime(row["Time"])))
				.y((row) => yScale(fixValue(row[field]))))
	}
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
			 	this.updateByBrush(selection)
			 }
		})
	
	//Append the brush in context svg
	this.contextSVG.append("g")
		.attr("class", "brush")
		.call(this.brush)
		.call(this.brush.move, this.xScale.range());
}

//Update chart by brush's selection.
Chart.prototype.updateByBrush = function(selection, xScale = this.xScale.copy(), yScale = this.yScale.copy()){
	//We need to convert the brush's selection to the equivalent Date values using scale.invert
	//So we can use it in scale's domain
	xScale.domain([xScale.invert(selection[0]), xScale.invert(selection[1])])

	//Store the scale modified by brush so adding and changing lines can use this scale as reference while brushing
	this.brushedXScale = xScale

	//Update x-axis
	this.chartSVG.select(".x-axis").call(this.xAxis, 0, xScale);

	//For every line selector, update the respective line in chart
	let field
	for (selector of document.querySelectorAll(".line-selector")){
		field = selector.parentNode.querySelector("label").innerHTML
		yScale.domain(d3.extent(this.log, (row) => fixValue(row[field]))).nice();
		
		this.chartSVG.select("#" + selector.id)
			.attr("d", d3.line()
				.defined((row) => fixValue(row[field]) !== undefined)
				.x((row) => xScale(parseTime(row["Time"])))
				.y((row) => yScale(fixValue(row[field]))))
	}
}

// Given the pointer position, find the equivalent time in x scale
// Then, find the equivalent row using the index given by bisector
// Find the value of the main field in the row and calculate the coordinates
// Move the tooltip to the coordinates
Chart.prototype.addTooltip = function(){

	const tooltip = this.chartSVG.append("g")
		.attr("class", "tooltip")
		
	const line = this.chartSVG.append('line')
		.attr("class", "tooltip-line")
		.style("stroke", "black")
		.style("stroke-width", 2)
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", -this.height)
		.attr("y2", 587);
	
	tooltip.append("circle")
		.attr("class", "tooltip-circle")
		.attr("r", 5)

	tooltip.append("rect")
		.attr("class", "tooltip-background-stroke")
	 	.attr("width", 100)
		.attr("height", 30)
		.attr("x", 15)
		.attr("y", -21)

	tooltip.append("rect")
		.attr("class", "tooltip-background")
	 	.attr("width", 100)
		.attr("height", 30)
		.attr("x", 15)
		.attr("y", -21)

	let tooltipText = tooltip.append("text")
		.attr("class", "tooltip-value-container")
		.attr("width", 100)
		.attr("height", 30)
		.attr("dx", 15)
		.attr("y", -15)

	tooltipText.append("tspan")
		.attr("class", "tooltip-time")
		.attr("dy", 15)

	const chart = this
	let xScale
	let yScale = chart.yScale
	let tooltipElement = document.querySelector(".tooltip")
	let tooltipBackground = document.querySelector(".tooltip-background")
	let tooltipBackgroundStroke = document.querySelector(".tooltip-background-stroke")
	let tooltipTextContainer = document.querySelector(".tooltip-value-container")
	let tooltipCircle = document.querySelector(".tooltip-circle")
	let isTooltipOutOfScreen = false
	let tooltipTime = document.querySelector(".tooltip-time")

	this.chartSVG.on("touchmove mousemove", function(event){
		//Reset values in tooltip
		tooltip.selectAll(".tooltip-value").remove()

		//Verify if scale was modified by brush
		//If yes, use modified scale. if not, use normal scale
		xScale = chart.brushedXScale ? chart.brushedXScale : chart.xScale

		const bisector = d3.bisector((d) => parseTime(d["Time"])).center;
		const currentTime = xScale.invert(d3.pointer(event, this)[0]);
		const index = bisector(chart.log, currentTime, 1);
		const previousRow = chart.log[index - 1];
		const currentRow = chart.log[index];

		//Honestly I don't know why this line work or why it is here
		//I just got this here https://observablehq.com/@d3/line-chart-with-tooltip
		let row = currentRow && currentTime - parseTime(previousRow["Time"]) > parseTime(currentRow["Time"]) - currentTime ? currentRow : previousRow;

		/*
		We need to find the left location of the tiny circle
		If that location + the width of tooltip > the width of the chart
		So it means that the tooltip is outside the chart
		Then we must change the location of the tooltip to the left side
		We need to calculte areaOutisdeChart to have a more accurate condition to change location
		*/

		bodyWidth = document.body.clientWidth
		chartWidth = document.querySelector(".chart-svg").getBoundingClientRect().width
		areaOutsideChart = bodyWidth - chartWidth
		circleLocation = tooltipCircle.getBoundingClientRect()
		chartWidth = document.querySelector(".chart-svg").getBoundingClientRect().width
		tooltipBox = circleLocation.left + tooltipBackground.getBoundingClientRect().width  - areaOutsideChart

		tooltipWidth = tooltipBackground.getBoundingClientRect().width + 15

		if (tooltipBox > chart.width) {
			isTooltipOutOfScreen = true
			tooltipElement.setAttribute("x", -tooltipWidth)
			tooltipBackground.setAttribute("x", -tooltipWidth)
			tooltipBackgroundStroke.setAttribute("x", -tooltipWidth)
			tooltipTime.setAttribute("dx", -tooltipWidth + 5)
		}
		else{
			isTooltipOutOfScreen = false
			tooltipElement.setAttribute("x", 15)
			tooltipBackground.setAttribute("x", 15)
			tooltipBackgroundStroke.setAttribute("x", 15)
			tooltipTime.setAttribute("dx", 20)
		}

		/*
		In this case, we need to find the bottom location of the tiny circle
		If that location + a little margin of 20 + offset which is the space occupied by values
		is > than the y coordinate of the x axis, it means that the tooltip is above the x axis
		To prevent that, we need to change the y coordinate of some elements in tooltip
		*/
		
		offset = (document.querySelectorAll(".line-selector").length - 1) * 15
		chartHeight = document.querySelector(".domain").getBoundingClientRect().y
		tooltipVerticalLocation = circleLocation.bottom + 20 + offset

		if (tooltipVerticalLocation > chartHeight)
		{
			difference = tooltipVerticalLocation - chartHeight + offset
			tooltipElement.setAttribute("y", -21 - difference)
			tooltipBackground.setAttribute("y", -21 - difference)
			tooltipBackgroundStroke.setAttribute("y", -21 - difference)
			tooltipTime.setAttribute("dy", 15 - difference)
		}
		else{
			difference = chartHeight - tooltipVerticalLocation
			tooltipElement.setAttribute("y", -21)
			tooltipBackground.setAttribute("y", -21)
			tooltipBackgroundStroke.setAttribute("y", -21)
			tooltipTime.setAttribute("dy", 15)	
		}

		//Populate the tooltip with the values
		let field, value, firstField, first = true
		for (selector of document.querySelectorAll(".line-selector")){
			field = selector.parentNode.querySelector("label").innerHTML
			
			//We need to store the first field because it is the main field
			//Which we use as a reference
			if (first) firstField = field
			first = false

			value = field + ": " +  fixValue(row[field])
			xValue = isTooltipOutOfScreen ? -tooltipWidth + 5 : 20
			tooltipText.append("tspan")
				.text(value)
				.attr("id", field)
				.attr("class", "tooltip-value")
				.attr("x", xValue)
				.attr("dy", 15)
		}

		//For every tooltip value, increase tooltip background height in 15 to accommodate all values
		//Same thing with width, but we get the width of the most wider value (which is the width of text container).
		currentSize = tooltipTextContainer.getBoundingClientRect()
		currentHeight = currentSize.height + 10
		currentWidth = currentSize.width + 10

		tooltipBackground.setAttribute("height", currentHeight)
		tooltipBackground.setAttribute("width", currentWidth)
		tooltipBackgroundStroke.setAttribute("height", currentHeight)
		tooltipBackgroundStroke.setAttribute("width", currentWidth)
		
		line.attr("transform", "translate(" + xScale(parseTime(row["Time"])) + "," + 0 + ")");
		tooltip.attr("transform", "translate(" + xScale(parseTime(row["Time"])) + "," + yScale(fixValue(row[firstField])) + ")");
		tooltip.select(".tooltip-time").text(parseTime(row["Time"]).toLocaleTimeString());
	});

	this.chartSVG.on("mouseover", function() { 
		tooltip.style("display", null) 
		line.style("display", null);
	})
	this.chartSVG.on("mouseout", function() { 
		tooltip.style("display", "none");
		line.style("display", "none");
	})
}