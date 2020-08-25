//Remove form so buttons and graph can be displayed
function removeForm() {
  document.querySelector("form").remove();
}

//Create a container for field buttons
function createBtnContainer() {
  document.querySelector("main").classList.remove("aligned");
  let div = document.createElement("div");
  div.classList.add("btn-container");
  document.querySelector("main").appendChild(div);

  let title = document.createElement("a");
  title.innerHTML = "FIELDS";
  title.classList.add("btn-container-title");
  document.querySelector(".btn-container").appendChild(title);
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
  let container = document.createElement("div");
  container.classList.add("report-container");
  document.querySelector("main").appendChild(container);

  container = document.createElement("div");
  container.classList.add("stats-container");
  document.querySelector(".report-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("chart-container");
  document.querySelector(".report-container").appendChild(container);
}

function addUpdateByField(chart) {
  //When user click in a field button, update chart and statistics with field data
  document
    .querySelector(".btn-container")
    .addEventListener("click", function (event) {
      if (event.target.className == "field-btn") {
        let selectedField = event.target.innerHTML;
        chart.update(selectedField);
        updateStats(chart.data, selectedField);
      }
    });
}

// When user sends csv...
document.getElementById("log_input").addEventListener("change", () => {
  const log = document.getElementById("log_input").files[0];

  // Parse the csv and process the results
  Papa.parse(log, {
    header: true,
    encoding: "latin3", // Important for degree symbol
    skipEmptyLines: true,
    complete: function (results) {
      removeForm();
      createBtnContainer();
      createButtons(results.meta.fields);
      createContainers();

      let chart = new Chart({
        container: document.querySelector(".chart-container"),
        data: results.data,
      });
      chart.draw();

      createStats(results.data);
      addUpdateByField(chart);
    },
  });
});
