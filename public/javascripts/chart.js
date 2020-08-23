// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
function fixTime(time){
	
	//If time is a missing value
    if(time){
        const data = time.split(":")

        const newTime = new Date()
        newTime.setHours(data[0])
        newTime.setMinutes(data[1])
        newTime.setSeconds(data[2])
	
		//This validation is required because sometimes the string "Time" (header name) appears between the times
		if(!isNaN(newTime.getTime())){
			return newTime
		}
    }
}

//Check if value ins't missing, convert Yes/No to 1/0 if necesssary or return the value in float
function checkValue(value){
    if(value){
        if(value == "No"){
            return 0
        }
        else if(value == "Yes"){
            return 1
        }
        else if(!isNaN(value)){
            return parseFloat(value)
        }
    }
    //return undefinied otherwise
}

function createChart(data){

	//Define the chart size
    const containerHeight = document.querySelector(".chart-container").clientHeight
    const containerWidth = document.querySelector(".chart-container").clientWidth

    //Define chart margin
    const margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = containerWidth - margin.left - margin.right
    , height = containerHeight - margin.top - margin.bottom;
	
	//Define the scale of x
    const x = d3.scaleTime()
    .domain(d3.extent(data, d => fixTime(d["Time"])))
    .range([margin.left + 10, width - margin.right]) // + 10 so the line doesn't touch the y axis
	
	//Define the x axis
    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).tickSizeOuter(0))

	//Define the scale of y
    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => checkValue(d["CPU [°C]"]))).nice()
        .range([height - margin.bottom, margin.top])

	//Define the y axis
    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .attr("class", "y-axis")

	//Define the chart line that will be drawn. The x point is the Time value and the Y point is the CPU temperature value
    let line = d3.line()
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
    
    //Append the grid line in y axis
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y)
            .tickSize((-width) + (margin.right * 2))
            .tickFormat(""))
        .call(g => g.select(".domain").remove())
	
	//Append the path that contains the chart line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4E7BFF")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("class", "line")
        .attr("d", line);

    //Update chart with the specified field data
    function updateChart(field){

        //Update domain of y scale
        y.domain(d3.extent(data, d => checkValue(d[field]))).nice()
        //Select all y axis and update values by calling yAxis
        svg.selectAll(".y-axis")
            .transition()
            .duration(1000)
            .call(yAxis)
        
        //Select all grid lines in y axis and update positions
        svg.selectAll(".grid")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y)
                .tickSize((-width) + (margin.right * 2))
                .tickFormat(""))
            .call(g => g.select(".domain").remove())

        //After update the y-axis, update the line in path object with new data
        svg.selectAll(".line")
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(d => x(fixTime(d["Time"])))
                .y(d => y(checkValue(d[field]))))
    }

    //When user click in a field button, update chart with field data
    document.querySelector(".btn-container").addEventListener('click', function(event){
        if(event.target.className == "field-btn"){
            let selectedField = event.target.innerHTML
            updateChart(selectedField)
        }
    })
}