import { fixValue } from './helpers/chartHelper.js';

//We will use 3 statistics measures: minimum value, maximum value and mean
export function createStats(log, defaultField) {
  let element;
  let title;
  let value;

  let mappedLog = log.map((row) => fixValue(row[defaultField]));
  let extent = d3.extent(mappedLog);

  let step = 0;
  for (step; step < 3; step++) {
    //For each measure, create a div that contains a title and a value
    element = document.createElement('div');
    title = document.createElement('span');
    value = document.createElement('h4');

    element.classList.add('stats');
    title.classList.add('stats-title');
    value.classList.add('stats-value');

    //Insert the respective id, value and title
    //Each step represents one measure
    switch (step) {
      case 0:
        element.id = 'min_value';
        value.innerHTML = extent[0];
        title.innerHTML = 'Minimum';
        break;
      case 1:
        element.id = 'mean';
        value.innerHTML = d3.mean(mappedLog).toFixed(2);
        title.innerHTML = 'Mean';
        break;
      case 2:
        element.id = 'max_value';
        value.innerHTML = extent[1];
        title.innerHTML = 'Maximum';
        break;
    }

    //Append each measure to container
    document.querySelector('.stats-container').appendChild(element);
    element.appendChild(value);
    element.appendChild(title);
  }
}

//Get data by the selected field, calculate measures and
//change innerHTML to receive respective results
export function updateStats(log, field) {
  let mappedLog = log.map((row) => fixValue(row[field]));

  let extent = d3.extent(mappedLog);
  let mean = d3.mean(mappedLog).toFixed(2);

  let minValue = document.querySelector('#min_value');
  let meanValue = document.querySelector('#mean');
  let maxValue = document.querySelector('#max_value');

  minValue.children[0].innerHTML = extent[0];
  meanValue.children[0].innerHTML = mean;
  maxValue.children[0].innerHTML = extent[1];
}
