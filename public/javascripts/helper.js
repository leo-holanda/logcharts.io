// HWInfo store time in a string with this format: HH:MM:SS
// So we must convert the string in a Date object so d3.scaleTime() can use it
function parseTime(time) {
  if (time) {
    const data = time.split(":");

    const newTime = new Date();
    newTime.setHours(data[0]);
    newTime.setMinutes(data[1]);
    newTime.setSeconds(data[2]);

    //This validation is required because sometimes the string "Time" (header name) appears between the times
    //Besides any time that may come wrong (if it happens)
    if (!isNaN(newTime.getTime())) {
      return newTime;
    }
  }
}

//Check if value ins't missing, convert Yes/No to 1/0 if necesssary or return the value in float
function fixValue(value) {
  if (value) {
    if (value == "No") return 0;  
    if (value == "Yes") return 1;  
    if (!isNaN(value)) return parseFloat(value);
  }
  //return undefinied otherwise
}

async function getLogExample(){
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  return await fetch(proxyurl + "https://raw.githubusercontent.com/leo-holanda/logcharts.io/master/public/example.CSV")
    .then((response) => { 
      return response.text() 
    })
}

//Sometimes file type can be empty. In this case
//We will assume that is an CSV and validate in isHWLog()
function isCSV(file){
  if (file.type == "text/csv" || !file.type) return true;
}

function isHWLog(fields){
  if(fields.includes("Time") && fields.includes("CPU [°C]")) return true
}