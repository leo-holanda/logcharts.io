import { generateRandomColor } from './helpers/helper.js';
import { chart } from './index.js';

export function createAddSelectorBtn() {
  let addSelectorBtn = document.createElement('button');
  let addSelectorIcon = document.createElement('span');
  addSelectorIcon.classList.add('material-icons-round');
  addSelectorIcon.innerHTML = 'add_circle';
  addSelectorBtn.classList.add('add-selector-btn');
  addSelectorBtn.id = 'add_selector_btn';
  addSelectorBtn.addEventListener('click', createNewLine);
  addSelectorBtn.appendChild(addSelectorIcon);
  document.querySelector('.selector-container').appendChild(addSelectorBtn);
}

export function addNewSelector(selectorID, color, defaultField) {
  let lineContainer = document.querySelector('.selector-btn-container');

  let isFirstSelector = false;
  if (lineContainer.children.length == 0) isFirstSelector = true;

  let selectorDiv = document.createElement('div');
  selectorDiv.classList.add('selector-div');
  selectorDiv.style.borderBottom = '3px solid ' + color;

  let colorPicker = document.createElement('div');
  colorPicker.classList.add('color-picker');
  selectorDiv.appendChild(colorPicker);

  let selectorBtn = document.createElement('input');
  selectorBtn.setAttribute('type', 'radio');
  selectorBtn.setAttribute('id', selectorID);
  selectorBtn.setAttribute('name', 'selector-btn');
  if (isFirstSelector) selectorBtn.checked = true;
  selectorBtn.classList.add('selector-btn');

  let selectorLabel = document.createElement('label');
  selectorLabel.innerHTML = defaultField;

  selectorDiv.appendChild(selectorBtn);
  selectorDiv.appendChild(selectorLabel);

  lineContainer.appendChild(selectorDiv);

  const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'nano',
    default: color,
    defaultRepresentation: 'HEX',

    swatches: [
      'rgba(244, 67, 54, 1)',
      'rgba(233, 30, 99, 1)',
      'rgba(156, 39, 176, 1)',
      'rgba(103, 58, 183, 1)',
      'rgba(63, 81, 181, 1)',
      'rgba(33, 150, 243, 1)',
      'rgba(3, 169, 244, 1)',
      'rgba(0, 188, 212, 1)',
      'rgba(0, 150, 136, 1)',
      'rgba(76, 175, 80, 1)',
      'rgba(139, 195, 74, 1)',
      'rgba(205, 220, 57, 1)',
      'rgba(255, 235, 59, 1)',
      'rgba(255, 193, 7, 1)',
    ],

    components: {
      // Main components
      preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
        input: true,
      },
    },
  });

  pickr.on('change', function(color, source, instance) {
    document
      .querySelector('path#' + selectorID)
      .setAttribute('stroke', color.toHEXA());
    selectorDiv.style.borderBottom = '3px solid ' + color.toHEXA();
    instance.applyColor(instance._lastColor);
  });

  if (!isFirstSelector) {
    let removeSelector = document.createElement('i');
    removeSelector.classList.add('fas');
    removeSelector.classList.add('fa-trash');
    removeSelector.addEventListener('click', function() {
      document.querySelector('path#' + selectorID).remove();
      selectorDiv.remove();
    });

    let selector;
    for (selector of document.querySelectorAll('.pickr')) {
      if (!selector.contains(removeSelector)) {
        selector.appendChild(removeSelector);
      }
    }
  }
}

function createNewLine() {
  let randomColor = generateRandomColor();
  let lineID = 'id' + new Date().valueOf();
  addNewSelector(lineID, randomColor);
  chart.addNewLine(lineID, randomColor);
}
