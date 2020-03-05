let client = null;
let user_id = null;
let stage = false;
let t1 = null, t2 = null, t3 = null;
$(document).ready(function() {
  app.initialized().then(function(_client) {
    client = _client;

    client.events.on("app.activated", function() {

      /**
       * get the id of the user loged in using the data API
       */
      client.data.get("loggedInUser").then(
        function(data) {
          user_id = data.loggedInUser.user.id.toString();
        },
        function(err) {
          console.log(JSON.stringify(err));
        }
      );

      /**
       * a click event handler to start and stop pomodoro sessions
       */
      $("#ip").click(function() {
        if (!stage) {
          makeSMICall("serverMethod");
          t2 = setInterval(takeBreak, 40000, user_id);
          session();
          stopText();
          stage = true;
        } else {
          stopPomodoro();
          startText();
          stage = false;
        }
      });

      /** a click event handler to get user's past sessions data pass it to a modal to show output in chart form 
       * refer mod.js for further flow
      */
      $("#sa").click(function() {
        let hs = [];
        let td = null;
        client.db.get(user_id).then(
          function(data) {
            td = data.totalDays;
            data.history.forEach((element, index) => {
              hs.push([
                index + 1,
                element.noOfSessions,
                element.noOfInterruptions
              ]);
            });
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

      /** a click event handler to clear all of the user's activity and schedules using clearActivity server.js method */
      $("#ca").click(function() {
        makeSMICall("clearActivity");
      });

      /** a click event handler to populate user data randomly using testData server.js method */
      $("#td").click(function() {
        makeSMICall("testData");
      });
    });
  });
});


/**
 * a helper function to triggers notifications
 * @param {string} notificationType - type of notification to be triggered
 * @param {string} notificationMessage - notification message to be displayed
 */
function notifyUser(notificationType, notificationMessage) {
  client.interface
    .trigger("showNotify", {
      type: notificationType,
      message: notificationMessage
    })
    .then(function(data) {
      console.log(
        "Notification for " + notificationMessage + " showed successfully!"
      );
      console.log(JSON.stringify(data));
    })
    .catch(function(err) {
      console.log(
        "Notification for " + notificationMessage + " couldn't be shown!"
      );
      console.log(JSON.stringify(err));
    });
}


/**
 * simple function to change UI
 */
function startText() {
  $("#apptext").text("Click me to start focus mode!!!");
  $("#ip").html("start");
}


/**
 * simple function to change UI
 */
function stopText() {
  $("#apptext").text("Click me to stop focus mode!!!");
  $("#ip").html("stop");
}

/**
 * Function to show user that his session has started using a helper function
 */
function session() {
  notifyUser("warning", "your 25 mins streak starts!");
}

/**
 * a function to tell users that they should take thier 5 mins break using a helper function
 * It also triggers nextSessionCheck and session functions to notfy about thier progress using js setTimeout
 */
function takeBreak() {
  notifyUser("success", "take a 5 mins break!");
  t3 = setTimeout(nextSessionCheck, 10000);
  t1 = setTimeout(session, 20000);
}


/**
 * This function is executed before the break period's end time to ask if the user
 * wants to continue having pomodoro sessions or not
 * They can give thier response using the showConfirm interface triggered by this method
 */
function nextSessionCheck() {
  client.interface
    .trigger("showConfirm", {
      title: "Do you want to continue ?",
      message:
        "your break's about to be over, do you want to start a new pomodoro session ? "
    })
    .then(function(result) {
      // debugger;
      console.log(JSON.stringify(result));
      if (result["message"] == "Cancel") {
        console.log("user is stopping sessions!");
        stopPomodoro();
      } else {
        console.log("user is continuing with next session!");
      }
    })
    .catch(function(err) {
      console.log("error with showConfirm: " + JSON.stringify(err));
    });
}


/**
 * This function invokes deleteSchedule server.js methods via a helper function
 * It also clears the setTimeout and setInterval events put forth by takeBreak and takebreak itself
 */
function stopPomodoro() {
  makeSMICall("deleteSchedule");
  clearTimeout(t1);
  clearTimeout(t3);
  clearInterval(t2);
  startText();
}


/**
 * This is a helper function which calls server.js methods using client.request.invoke API (SMI)
 * Data for a particular user has been atached to his ID in the database, hence the need for pasing user_id via SMI
 * @param {string} - methodName name of the server.js method you wish to call
 */
function makeSMICall(methodName) {
  client.request.invoke(methodName, { id: user_id }).then(
    function(data) {
      console.log("server method request id: " + data.requestID);
      console.log("response: " + data.response.reply);
    },
    function(err) {
      console.log(JSON.stringify(err));
    }
  );
}
