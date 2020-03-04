
//This file contains all the codes 

exports = {

  
  events: [{ event: "onScheduledEvent", callback: "scheduledEventHandler" }],



  serverMethod: function(args) {
    console.log("creating scheduled event...");
    console.log("args are...\n" + JSON.stringify(args));
    let uid = args.id.toString();

    $schedule
      .fetch({
        name: "Increment_Day"
      })
      .then(
        function(data) {
          console.log("schedule already defined for the day!");
          console.log(JSON.stringify(data));
        },
        function(err) {
          console.log("initializing for the day!");
          console.log(JSON.stringify(err));
          // let x = new Date(args["date"]);
          // x.setHours(0, 0, 0, 0);
          // x.setDate(x.getDate() + 1);
          // console.log("printing x from fetch schedule!", x.toString());
          // $schedule.create({
          //   name: "Increment_Day",
          //   data: {type: "incrementDay", id: uid},
          //   schedule_at: x.toISOString()
          // })
          let x = new Date();
          console.log("time now: " + x.toString());
          x.setMinutes(x.getMinutes() + 6);
          console.log("new end of day is!" + x.toString());
          $schedule
            .create({
              name: "Increment_Day",
              data: { type: "incrementDay", id: uid },
              schedule_at: x.toISOString()
            })
            .then(
              function(data) {
                console.log("incrementDay successfully created!");
                console.log(JSON.stringify(data));
              },
              function(err) {
                console.log("Couldn't create incrementDay...");
                console.log(JSON.stringify(err));
              }
            );
        }
      );

    $schedule
      .create({
        name: "test_schedule",
        data: { type: "regular", id: uid },
        schedule_at: new Date().toISOString(),
        repeat: {
          time_unit: "minutes",
          frequency: 1
        }
      })
      .then(
        function(data) {
          console.log("schedule created sucessfully");
          console.log("promise of server method:\n" + JSON.stringify(data));

          $db
            .set(
              uid,
              {
                totalDays: 0,
                history: [
                  {
                    noOfSessions: 0,
                    noOfInterruptions: 0
                  }
                ]
              },
              {
                setIf: "not_exist"
              }
            )
            .done(function(data) {
              console.log(
                "Data skeleton created successfully!\nargs: " +
                  JSON.stringify(data)
              );
            })
            .fail(function(err) {
              console.log(
                "Data skeleton already available, skipping creation!" +
                  JSON.stringify(err)
              );
            });
        },

        function(err) {
          console.log("Couldn't create schedule sucessfully!\n");
          console.log(JSON.stringify(err));
        }
      );

    renderData(null, { reply: "created events sucessfully" });
  },

  scheduledEventHandler: function(args) {
    console.log("args are:\n" + JSON.stringify(args));
    if (args.data.type == "regular") {
      $db.get(args.data.id).then(
        function(data) {
          console.log(
            "printing data from scheduledEventhandler...\ndata: " +
              JSON.stringify(data)
          );
          td = data.totalDays;
          hs = data.history;
          hs[td].noOfSessions += 1;
          $db.update(args.data.id, "set", { history: hs }).then(
            function(data) {
              console.log("updated noOfSessions successfully!");
              console.log("args: " + JSON.stringify(data));
            },
            function(err) {
              console.log("Couldn't update noOfSessions!");
              console.log("args: " + JSON.stringify(err));
            }
          );
        },
        function(err) {
          console.log(
            "couldn't access data from scheduledEventHandler....\nargs: " +
              JSON.stringify(err)
          );
        }
      );
    } else {
      $db.get(args.data.id).then(function(data) {
        // data = JSON.parse(data);
        td = data.totalDays;
        hs = data.history;
        if (data.totalDays < 29) {
          td += 1;
          hs.push({ noOfSessions: 0, noOfInterruptions: 0 });
        } else {
          hs.shift();
          hs.push({ noOfSessions: 0, noOfInterruptions: 0 });
        }
        $db.update(args.data.id, "set", JSON.stringify({ history: hs }));
      });
    }
  },

  deleteSchedule: function(args) {
    console.log("Deleteing schedule...\nargs: " + args);
    let uid = args.id.toString();
    $schedule
      .delete({
        name: "test_schedule"
      })
      .then(
        function(data) {
          console.log(
            "schedule deleted successfully!\nargs: " + JSON.stringify(data)
          );
          $db.get(uid).then(
            function(data) {
              td = data.totalDays;
              hs = data.history;
              hs[td].noOfInterruptions += 1;
              $db.update(uid, "set", { history: hs }).then(
                function(data) {
                  console.log(
                    "Successfully recorded interrupption!\nargs: " +
                      JSON.stringify(data)
                  );
                },
                function(err) {
                  console.log(
                    "couldn't update noOfInterruptions!\nargs: " +
                      JSON.stringify(err)
                  );
                }
              );
            },
            function(err) {
              console.log(
                "couldn't fetch data from deleteSchedule Method\nargs: " +
                  JSON.stringify(err)
              );
            }
          );
        },
        function(err) {
          console.log(
            "Couldn't delete schedule successfully!\n" + JSON.stringify(err)
          );
        }
      );
    renderData(null, { reply: "deleted events sucessfully" });
  },

  clearActivity: function(args) {
    console.log("clearActivity invoked!\nargs: " + JSON.stringify(args));
    let uid = args.id.toString();
    $schedule
      .delete({
        name: "Increment_Day"
      })
      .then(
        function(data) {
          console.log(
            "Increment_Day deleted successfully!\nargs: " + JSON.stringify(data)
          );
        },
        function(err) {
          console.log(
            "Increment_Day couldn't be deleted successfully!\nargs: " +
              JSON.stringify(err)
          );
        }
      );
    $db.delete(uid).then(
      function(data) {
        console.log(
          "cleaned data successfully!\nargs: " + JSON.stringify(data)
        );
      },
      function(err) {
        console.log(
          "couldn't clean data successfully!\nargs: " + JSON.stringify(err)
        );
      }
    );
    renderData(null, { reply: "deleted events sucessfully" });
  },

  testData: function(args) {
    console.log("testData invoked!");
    let uid = args.id.toString();
    let td = 29;
    let hs = [];
    for (let i = 0; i < 29; i++) {
      hs.push({
        noOfSessions: Math.ceil(Math.random() * 10),
        noOfInterruptions: Math.ceil(Math.random() * 10)
      });
    }
    $db
      .set(uid, { totalDays: td, history: hs })
      .done(function(data) {
        console.log(
          "Test data successfully inserted!\nargs: " + JSON.stringify(data)
        );
      })
      .fail(function(err) {
        console.log(
          "Test data couldn't be set up!\nargs: " + JSON.stringify(err)
        );
      });
    renderData(null, { reply: "Test data updated sucessfully" });
  }
};
