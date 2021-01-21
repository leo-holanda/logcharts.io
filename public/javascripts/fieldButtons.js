// Each field in the csv file becomes a button
function createButtons(fields) {
    let btn;
    for (field of fields) {
        if (field && !field.includes("Time") && !field.includes("Date")) {
            btn = document.createElement("button");
            btn.id = field;
            btn.innerHTML = field;
            btn.classList.add("field-btn");
            document.querySelector(".btn-container").appendChild(btn);
        }
    }

    let cpuBtn = document.getElementById("CPU [°C]");
    cpuBtn.focus();
    cpuBtn.scrollIntoView({ block: "center" });
}

//When user click in a field button, update chart and statistics with field data
function addUpdateByField() {
    document
        .querySelector(".btn-container")
        .addEventListener("click", (event) => {
            if (event.target.className == "field-btn") {
                updateByField(event.target.innerHTML)
            }
        })
}

function updateByField(selectedField) {
    let selector = document.querySelector(".selector-btn:checked")
    selector.parentNode.querySelector("label").innerHTML = selectedField

    //If the selector is the first, it means it is the main selector
    //Which means we change more stuff (like stats and context line) than the normal selectors
    let firstSelector = document.querySelector(".selector-btn:first-of-type")
    if (selector.id == firstSelector.id) {
        chart.updateMainLine(selectedField);
        updateStats(chart.log, selectedField);
    }
    else {
        chart.updateLineByField(selectedField, selector.id)
    }
}