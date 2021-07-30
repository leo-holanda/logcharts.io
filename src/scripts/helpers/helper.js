export async function getLogExample(){
  return await fetch("./assets/example.CSV")
  .then((response) => {
    return response.text()
  })
} 

//Sometimes file type can be empty. In this case
//We will assume that is an CSV and validate in hasTimeField()
export function isCSV(file){
  if (file.type == "text/csv" || file.type == "application/vnd.ms-excel" || !file.type) return true;
}

export function hasTimeField(fields){
  if(fields.includes("Time")) return true
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/2450976#2450976
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//https://gomakethings.com/a-better-better-way-to-generate-a-random-color-with-vanilla-js/
export function generateRandomColor(){
  // The available hex options
  var hex = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var color = '#';

  // Create a six-digit hex color
  for (var i = 0; i < 6; i++) {

    // Shuffle the hex values
    shuffle(hex);

    // Append first hex value to the string
    color += hex[0];
  }

  return color
}

export function isValidField(field){
  return ['Date', 'Time', ''].includes(field) ? false : true
}