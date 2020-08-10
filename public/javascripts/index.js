// Each field in the csv file becomes a button
function createButtons(fields){
  let btn
  for (field of fields){    
    if(field){
      btn = document.createElement("button")
      btn.innerHTML = field 
      document.body.appendChild(btn)     
    }
  }
}

// When user sends csv...
document.getElementById("log_input").addEventListener('change', () => {
  const log = document.getElementById("log_input").files[0]

  // Parse the csv and process the results
  Papa.parse(log, {
    header: true,
    encoding: 'latin3', // Important for degree symbol
    skipEmptyLines: true,
    complete: function(results){
      createButtons(results.meta.fields)
    }
  })  
})
