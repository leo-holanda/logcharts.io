//We will use 4 statistics measures: minimum value, maximum value,
//mean and standard deviation
function createStats(log) {
  let element;
  let title;
  let value;

  let mappedLog = log.map((row) => fixValue(row["CPU [°C]"]));
  let extent = d3.extent(mappedLog);

  for (step = 0; step <= 3; step++) {
    //For each measure, create a div that contains a title and a value
    element = document.createElement("div");
    title = document.createElement("h6");
    value = document.createElement("h4");

    element.classList.add("stats");
    title.classList.add("stats-title");
    value.classList.add("stats-value");

    //Insert the respective id, value and title
    //Each step represents one measure
    switch (step) {
      case 0:
        element.id = "min_value";
        value.innerHTML = extent[0];
        title.innerHTML = "Minimum Value";
        break;
      case 1:
        element.id = "mean";
        value.innerHTML = d3.mean(mappedLog).toFixed(2);
        title.innerHTML = "Mean";
        break;
      case 2:
        element.id = "max_value";
        value.innerHTML = extent[1];
        title.innerHTML = "Maximum Value";
        break;
      case 3:
        element.id = "deviation";
        value.innerHTML = d3.deviation(mappedLog).toFixed(2);
        title.innerHTML = "Deviation";
        break;
    }

    //Append each measure to container
    document.querySelector(".stats-container").appendChild(element);
    element.appendChild(value);
    element.appendChild(title);
  }
}

//Get data by the selected field, calculate measures and
//change innerHTML to receive respective results
function updateStats(log, field) {
  let mappedLog = log.map((row) => fixValue(row[field]));

  //May not be the most efficient way of calculate
  //Passing through the array 4 times (d3.deviation may count as 2)
  //I will implement something better later
  let extent = d3.extent(mappedLog);
  let mean = d3.mean(mappedLog).toFixed(2);
  let deviation = d3.deviation(mappedLog).toFixed(2);

  let minValue = document.querySelector("#min_value");
  let meanValue = document.querySelector("#mean");
  let maxValue = document.querySelector("#max_value");
  let deviationValue = document.querySelector("#deviation");

  minValue.children[0].innerHTML = extent[0];
  meanValue.children[0].innerHTML = mean;
  maxValue.children[0].innerHTML = extent[1];
  deviationValue.children[0].innerHTML = deviation;
}
