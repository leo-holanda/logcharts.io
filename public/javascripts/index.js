//Remove form so buttons and graph can be displayed
function removeForm() {
  document.querySelector(".form-container").remove();
}

// Each field in the csv file becomes a button
function createButtons(fields) {
  let btn;
  for (field of fields) {
    if (field && !field.includes("Time") && !field.includes("Date")) {
      btn = document.createElement("button");
      btn.innerHTML = field;
      btn.classList.add("field-btn");
      document.querySelector(".btn-container").appendChild(btn);
    }
  }
}

function createContainers() {
  //Remove aligned layout
  document.querySelector("main").classList.remove("aligned");

  let container = document.createElement("div");
  container.classList.add("field-container");
  document.querySelector("main").appendChild(container);

  //Add btn container title
  let title = document.createElement("h4");
  title.innerHTML = "FIELDS";
  title.classList.add("field-container-title");
  document.querySelector(".field-container").appendChild(title);

  container = document.createElement("div");
  container.classList.add("btn-container");
  document.querySelector(".field-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("report-container");
  document.querySelector("main").appendChild(container);

  container = document.createElement("div");
  container.classList.add("stats-container");
  document.querySelector(".report-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("chart-container");
  document.querySelector(".report-container").appendChild(container);
}

//When user click in a field button, update chart and statistics with field data
function addUpdateByField(chart) {
  document
    .querySelector(".btn-container")
    .addEventListener("click", function (event) {
      if (event.target.className == "field-btn") {
        let selectedField = event.target.innerHTML;
        chart.updateByField(selectedField);
        updateStats(chart.log, selectedField);
      }
    });
}

//Add an alert if there isn't one
function addAlert() {
  if (document.querySelector(".form-alert") == null) {
    let alert = document.createElement("h3");
    alert.innerHTML = "Please upload only CSV files!";
    alert.classList.add("form-alert");
    document.querySelector(".form-container").appendChild(alert);
  }
}

// When user sends csv or click on example button...
document.getElementById("log_input").addEventListener("change", createChart);
document.getElementById("example").addEventListener("click", createChart);

async function createChart(event) {
  let log = undefined;

  if (event.target.id == "example") {
    //Get example log from repository
    log = await getLogExample();
  } else {
    log = document.getElementById("log_input").files[0];

    //Still need to see if log is from HWInfo
    if (!isCSV(log)) return addAlert();
  }

  removeForm();

  // Parse the csv and process the results
  Papa.parse(log, {
    header: true,
    encoding: "latin3", // Important for degree symbol
    skipEmptyLines: true,
    transformHeader: function (header) {
      return header.replace("�", "°");
    },
    complete: function (results) {
      createContainers();
      createButtons(results.meta.fields);

      let chart = new Chart({
        container: document.querySelector(".chart-container"),
        parsedLog: results.data,
      });

      chart.draw();

      createStats(results.data);
      addUpdateByField(chart);
    },
  });
}
