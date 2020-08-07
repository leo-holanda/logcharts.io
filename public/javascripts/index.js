const reader = new FileReader()

document.getElementById("form_btn").addEventListener('click', () => {
  const log = document.getElementById("log_input").files[0]

  reader.onload = function(){
    d3.csvParse(reader.result, function(data) {
      console.log(data);
    });
  }

  reader.readAsText(log)
})
