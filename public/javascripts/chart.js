// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
function fixTime(time){
	
	//If time is a missing value
    if(time){
        let data = time.split(":")

        let new_time = new Date()
        new_time.setHours(data[0])
        new_time.setMinutes(data[1])
        new_time.setSeconds(data[2])
	
		//This validation is required because sometimes the string "Time" (header name) appears between the times
		if(!isNaN(new_time.getTime())){
			return new_time
		}
    }
}

//To remove missing values or strings with the PC component name
function checkValue(value){
    if(value && !isNaN(value)){
        return value
    }
    return 0
}

function createChart(data){

	//Define the chart size
    var containerHeight = document.querySelector(".chart-container").clientHeight
    var containerWidth = document.querySelector(".chart-container").clientWidth

    var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = containerWidth - margin.left - margin.right
    , height = containerHeight - margin.top - margin.bottom;
	
	//Define the scale of x
    x = d3.scaleTime()
    .domain(d3.extent(data, d => fixTime(d["Time"])))
    .range([margin.left + 10, width - margin.right]) // + 10 so the line doesn't touch the y axis
	
	//Define the x axis
    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))

	//Define the scale of y
    y = d3.scaleLinear()
        .domain(d3.extent(data, d => checkValue(d["CPU [°C]"]))).nice()
        .range([height - margin.bottom, margin.top])

	//Define the y axis
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data["CPU [°C]"]))

	//Define the chart line that will be drawn. The x point is the Time value and the Y point is the CPU temperature value
    line = d3.line()
        .defined(d => !isNaN(d["CPU [°C]"]))
        .x(d => x(fixTime(d["Time"])))
        .y(d => y(checkValue(d["CPU [°C]"])))
	
	//Append the svg element to the chart container
    const svg = d3.select(".chart-container").append("svg")
		.attr("viewBox", `0 0 ${width} ${height}`)
	
	//Append the x Axis
    svg.append("g")
		.call(xAxis);
		
	//Append the y Axis
    svg.append("g")
        .call(yAxis);
	
	//Append the path that contains the chart line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4E7BFF")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
		.attr("d", line);
}

