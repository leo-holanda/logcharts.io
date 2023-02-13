import { chart } from './index.js';
import { updateStats } from './stats.js';

export function createButtons(fields, defaultField, searchText = undefined) {
  if (searchText) {
    fields = fields.filter(
      (field) => field && field.toLowerCase().includes(searchText.toLowerCase())
    );

    if (fields.length == 0) {
      document.querySelector('.btn-container').innerHTML =
        "The search didn't found a field with your search string.";
      return;
    }
  }

  let btn;
  fields.forEach((field) => {
    if (field && !field.includes('Time') && !field.includes('Date')) {
      btn = document.createElement('button');
      btn.id = field;
      btn.innerHTML = field;
      btn.classList.add('field-btn');
      document.querySelector('.btn-container').appendChild(btn);
    }
  });

  let defaultBtn = document.getElementById(defaultField);
  defaultBtn.scrollIntoView({ block: 'center' });
}

export function addUpdateByField() {
  document
    .querySelector('.btn-container')
    .addEventListener('click', (event) => {
      if (event.target.className == 'field-btn') {
        updateByField(event.target.innerHTML);
      }
    });
}

function updateByField(selectedField) {
  let selector = document.querySelector('.selector-btn:checked');
  selector.parentNode.querySelector('label').innerHTML = selectedField;

  //If the selector is the first, it means it is the main selector
  //Which means we change more stuff (like stats and context line) than the normal selectors
  let firstSelector = document.querySelector('.selector-btn:first-of-type');
  if (selector.id == firstSelector.id) {
    chart.updateMainLine(selectedField);
    updateStats(chart.log, selectedField);
  } else {
    chart.updateLineByField(selectedField, selector.id);
  }
}
