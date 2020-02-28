$(document).ready(function() {
  app.initialized().then(function(_client) {
    var client = _client;
    function test1() {
      client.interface
        .trigger("showNotify", {
          type: "warning",
          message: "your 25 mins streak starts again!"
        })
        .then(function(data) {
          console.log(
            "test1 triggerd successfully!\nargs: " + JSON.stringify(data)
          );
        })
        .catch(function(err) {
          console.log("couldn't trigger test1!\nargs: " + JSON.stringify(err));
        });
    }
    function test2(uid) {
      client.interface
        .trigger("showNotify", {
          type: "success",
          message: "take a 5 mins break!"
        })
        .then(function(data) {
          console.log(
            "test2 triggerd successfully!\nargs: " + JSON.stringify(data)
          );
        })
        .catch(function(err) {
          console.log("couldn't trigger test2!\nargs: " + JSON.stringify(err));
        });
      window.t3 = setTimeout(test3, 10000, uid);
      window.t1 = setTimeout(test1, 20000);
    }
    function test3(uid) {
      client.interface
        .trigger("showConfirm", {
          title: "Do you want to continue ?",
          message:
            "your break's about to be over, do you want to start a new pomodoro session ? "
        })
        .then(function(result) {
          // debugger;
          console.log(result);
          if ((result["message"] = "Ok")) {
            console.log("user is continuing with next session!");
          } else {
            console.log("user is stopping sessions!");
            stopPomodoro(uid);
          }
        })
        .catch(function(err) {
          console.log("error with showConfirm: " + JSON.stringify(err));
        });
    }
    function stopPomodoro(uid) {
      client.request.invoke("deleteSchedule", { id: uid }).then(
        function(data) {
          console.log("server method request id: " + data.requestID);
          console.log("response: " + data.response.reply);
        },
        function(error) {
          console.log(error);
        }
      );
      clearTimeout(window.t1);
      clearTimeout(window.t3);
      clearInterval(window.t2);
      $("#apptext").text("Click me to start focus mode!!!");
      $("#ip").html("start");
    }
    var stage = false;
    $("#apptext").text("Click me to start focus mode!!!");
    client.events.on("app.activated", function() {
      let user_id = null;
      client.data.get("loggedInUser").then(
        function(data) {
          console.log("Printing user id...\n");
          user_id = data.loggedInUser.user.id;
          console.log(JSON.stringify(user_id));
        },
        function(err) {
          console.log(JSON.stringify(err));
        }
      );
      $("#ip").click(function() {
        if (!stage) {
          //   let dateValue = new Date().toISOString();
          client.request.invoke("serverMethod", { id: user_id }).then(
            function(data) {
              console.log("server method request id: " + data.requestID);
              console.log("response: " + data.response.reply);
              window.t2 = setInterval(test2, 40000, user_id);
            },
            function(error) {
              console.log(error);
            }
          );
          $("#apptext").text("Click me to stop focus mode!!!");
          $("#ip").html("stop");
          stage = true;
        } else {
          stopPomodoro(user_id);
          stage = false;
        }
      });
      $("#sa").click(function() {
        let hs = [];
        let td = null;
        let uid = user_id.toString();
        client.db.get(uid).then(
          function(data) {
            console.log("showActivity db get data start");
            console.log(data);
            console.log("showActivity db get data end");
            td = data.totalDays;
            data.history.forEach((element, index) => {
              hs.push([index + 1, element.noOfSessions, element.noOfInterruptions]);
            });
            console.log("hs inside sa app: ");
            console.log(hs);
            client.interface.trigger("showModal", {
              title: "sample modal",
              template: "./mod.html",
              data: { totalDays: td, history: hs }
            });
          },
          function(err) {
            console.log(
              "Couldn't get data for ShowActivity!\nargs: " +
                JSON.stringify(err)
            );
          }
        );
      });
      $("#ca").click(function() {
        client.request.invoke("clearActivity", { id: user_id }).then(
          function(data) {
            console.log("server method request id: " + data.requestID);
            console.log("response: " + data.response.reply);
          },
          function(err) {
            console.log(err);
          }
        );
      });
      $("#td").click(function() {
        client.request.invoke("testData", { id: user_id }).then(
          function(data) {
            console.log("server method request id: " + data.requestID);
            console.log("response: " + data.response.reply);
          },
          function(err) {
            console.log(err);
          }
        );
      });
    });
  });
});
