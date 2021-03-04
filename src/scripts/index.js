import { isCSV, isHWLog, getLogExample } from './helper.js'
import { Chart } from './chart.js'
import { createStats } from './stats.js'
import { createButtons, addUpdateByField } from './fieldButtons.js'
import { createAddSelectorBtn } from './lineSelectors.js'

//Remove form so buttons and graph can be displayed
function removeForm() {
  document.querySelector(".form-container").remove();
  let loader
  if ((loader = document.querySelector(".loader-wrapper"))) loader.remove();

  document.querySelector(".header").remove();
}

//Add an alert if there isn't one
function addAlert(message) {
  if (document.querySelector(".form-alert") != null) {
    document.querySelector(".form-alert").innerHTML = message;
    return;
  }

  let alert = document.createElement("h3");
  alert.innerHTML = message;
  alert.classList.add("form-alert");
  document.querySelector(".third-step").appendChild(alert);
}

function addLoadingOverlay() {
  let loaderWrapper = document.createElement("div");
  loaderWrapper.classList.add("loader-wrapper");

  let loading = document.createElement("div");
  loading.classList.add("loader");

  loaderWrapper.appendChild(loading);
  document.querySelector("main").appendChild(loaderWrapper);
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
  container.classList.add("selector-container");
  document.querySelector(".report-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("selector-btn-container");
  document.querySelector(".selector-container").appendChild(container);

  container = document.createElement("div");
  container.classList.add("chart-container");
  document.querySelector(".report-container").appendChild(container);
}

// When user sends csv or click on example button...
document.getElementById("log_input").addEventListener("change", showUserLog);
document.getElementById("example").addEventListener("click", showExample);

function showUserLog() {
  let log = document.getElementById("log_input").files[0];
  if (!isCSV(log)) return addAlert("Please upload only CSV files!");
  createChart(log);
}

async function showExample() {
  addLoadingOverlay();
  createChart(await getLogExample());
}

export let chart = undefined
function createChart(log) {
  // Parse the csv and process the results
  Papa.parse(log, {
    header: true,
    encoding: "latin3", // Important for degree symbol
    skipEmptyLines: true,
    transformHeader: function (header) {
      return header.replace("�", "°");
    },
    complete: function (results) {
      if (isHWLog(results.meta.fields)) {
        removeForm();
        createContainers();
        createButtons(results.meta.fields);
        addUpdateByField();
        createAddSelectorBtn();

        chart = new Chart({
          container: document.querySelector(".chart-container"),
          parsedLog: results.data,
        });

        chart.draw();

        createStats(results.data);
      } else {
        addAlert("Please send only logs from HWInfo!");
      }
    },
  });
}
