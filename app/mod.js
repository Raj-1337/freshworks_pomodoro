app.initialized().then(function(_client) {
  let client = _client;
  let td = null;
  let hs = null;
  client.instance
    .context()
    .then(function(context) {
      console.log("context");
      td = context.data.totalDays;
      
      hs = context.data.history;
      
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        // Create the data table.
        var data = new google.visualization.DataTable();

        data.addColumn("number", "Days");
        data.addColumn("number", "No. of sessions");
        data.addColumn("number", "No. of interuptions");
        data.addRows(hs);
        // Set chart options
        var options = {
          title: "Promodo productivity",
          titleposition: "in",
          width: 650,
          height: 500,
          animation: {
            startup: true,
            easing: "inAndOut",
            duration: 1200
          },
          legend: {
              position: "bottom"
          },
          hAxis: {
              title: "no. of days"
          },
          vAxis: {
              title: "no. of sessions / interruptions"
          }
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.LineChart(
          document.getElementById("chart_div")
        );
        chart.draw(data, options);
      }
    })
    .catch(function(err) {
      console.log(JSON.stringify(err));
    });
});