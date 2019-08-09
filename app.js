window.onload = function () {
  // body event listener

  var div = document.getElementsByClassName("container")[0]; //div is the first class .container
  var inputField = document.getElementsByTagName("input")[0]; //input is the first input element
  var chmodCode = document.getElementById("chmodCode"); //chmodcode
  var eg = document.getElementById("example");
  var clicktocopy = document.getElementById("clicktocopy");
  var clicktocopyInnerText = clicktocopy.innerText;
  var isNotifying = false;

  document.getElementsByTagName("body")[0].onkeydown = function (e) {
    if (e.keyCode !== 9 && e.keyCode !== 13 && e.keyCode !== 32 && e.keyCode !== 16) {
      if (document.activeElement != inputField) {
        inputField.focus();
        inputField.select();
      }
    }
  }

  inputField.value = "777";
  //
  // inputField.onclick = function(e) {
  //   Ui.copyInputContentToClipboard(e.target, clicktocopyInnerText, clicktocopy, null, null, "red-notify");
  // }

  inputField.onclick = function () {
    inputField.select();
  }

  inputField.onkeyup = function (e) {

    var value = inputField.value;
    if (value.length == 3 && Calculate.validOctal(value) && value % 1 == 0) {
      var thing = Ui.updateBoard(inputField.value);
      chmodCode.value = "chmod " + inputField.value + " ";
      inputField.blur()
    } else if (!Calculate.validOctal(value)) {
      Ui.notify(clicktocopy, clicktocopyInnerText, "No > 7!", null, "red-notify");
      inputField.value = ""
    }

  }

  eg.onclick = function (e) {
    Ui.copyInputContentToClipboard(chmodCode, clicktocopyInnerText, clicktocopy, null, null, "red-notify");
  }

  // when clicking buttons

  container.addEventListener("keyup", function (e) {
    // Cancel the default action, if needed
    e.preventDefault();
    // Number 13 is the "Enter" key on the keyboard, for accessibility selections
    if (e.keyCode === 13 || e.keyCode === 32) {
      // Trigger the button element with a click
      e.target.click();
    }
  });

  container.addEventListener("click", function (e) {
    // handles user click
    inputField = document.getElementsByTagName("input")[0];
    // the h2
    var element = e.target;
    // the parent is the div element containing the h2
    var parent = element.parentNode;
    var category = parent.parentNode.id; // user, group, or other
    var permission = Calculate.whichPermission(parent.classList); // read, write, or execute
    var octal = parseInt(inputField.value);

    if (inputField.value.length !== 3 || inputField.value % 1 !== 0) {
      inputField.value = 777;
      octal = 777;
      Ui.updateBoard(777);
    }




    // determines whether item pressed is a button
    if (Calculate.doesThisListHaveThisItem(parent.classList, "permission")) {
      // runs if target is a button
      // if it could before, it cannot now.

      // allowed or not, false means not allowed
      var canOrNot = Calculate.yesOrNo(parent) ? false : true;
      Ui.toggleYesNoText(element, permission);
      Ui.toggleYesNoCssClass(parent);
      octal = Calculate.parseOctal(Calculate.newOctal(octal, category, permission, canOrNot));
      //the magic
      inputField.value = octal;
      chmodCode.value = "chmod " + octal + " ";
      //end magic
    }
  });

}

var Calculate = {
  newOctal: function (currentOctal, category, permission, canOrNot) {
    // currentOctal to modify
    // category to determine multiplier
    // permission to determine factor
    // canOrNot add or subtract
    var multiplier = (category == "user") ? (100) : (category == "group" ? (10) : (1));
    var permissionFactor = (permission == "read") ? 4 : ((permission == "write") ? 2 : 1);
    var preliminary = multiplier * permissionFactor;
    if (canOrNot) {
      currentOctal += preliminary;
    } else {
      currentOctal -= preliminary;
    }
    return currentOctal;
  },
  parseOctal: function (number) { //returns the octal as a string
    var numberText = new String();
    if (number <= 9) {
      numberText = "00" + number.toString();
    } else if (number <= 99) {
      numberText = "0" + number.toString();
    } else {
      numberText = number.toString();
    }
    return numberText;
  },
  yesOrNo: function (element) {
    // whether the premission is set to be allowed
    return (this.doesThisListHaveThisItem(element.classList, "yes", true));
  },
  doesThisListHaveThisItem: function (list, item, wantBoolean) {
    // if wantBoolean is true, returns true if the item exists, otherwise returns index
    for (var i = 0; i < list.length; i++) {
      if (list[i] == item && wantBoolean) {
        return true;
      } else if (list[i] == item && !wantBoolean) {
        return i;
      }
    }
    return false;
  },
  whichPermission: function (list) {
    // true, as we want boolean
    // self-descriptive
    //if the list has "read", return read, if it has write, return write, if it has execute, return execute, otherwise null
    return this.doesThisListHaveThisItem(list, "read", true) ? "read" : (this.doesThisListHaveThisItem(list, "write", true) ? "write" : this.doesThisListHaveThisItem(list, "execute", true) ? "execute" : null);
  },
  octalToVisual: function (octal) {
    if (octal.length > 3) {
      return false;
    }

    var visual = {
      user: {
        read: false,
        write: false,
        execute: false,
      },
      group: {
        read: false,
        write: false,
        execute: false,
      },
      other: {
        read: false,
        write: false,
        execute: false,
      }
    };

    octal = parseInt(octal);

    var input = {};
    var user = Math.floor(octal / 100);
    input.user = user;
    octal %= 100;
    var group = Math.floor(octal / 10);
    input.group = group;
    octal %= 10;
    var other = Math.floor(octal);
    input.other = other;

    for (var person in input) {
      var value = input[person];
      value -= 4;
      if (value >= 0) {
        visual[person]["read"] = true;
      } else {
        value += 4;
      }
      value -= 2;
      if (value >= 0) {
        visual[person]["write"] = true;
      } else {
        value += 2;
      }
      value -= 1;
      if (value >= 0) {
        visual[person]["execute"] = true;
      }
    }
    return visual;
  },
  validOctal: function (octal) {
    var user = Math.floor(octal / 100);
    octal.user = user;
    octal %= 100;
    var group = Math.floor(octal / 10);
    octal.group = group;
    octal %= 10;
    var other = Math.floor(octal);
    octal.other = other;

    if (user > 7 || group > 7 || other > 7) {
      return false;
    } else {
      return true;
    }

  }
}

var Ui = {
  //copies input content to clipboard
  copyInputContentToClipboard: function (element, initialInnerText, notifyElement, notification, notifyLength, notifyClass, isNotifying) {
    notification = notification ? notification : "Copied!";
    element.select();
    document.execCommand("Copy");
    element.blur();
    if (notifyElement) {
      this.notify(notifyElement, initialInnerText, notification, notifyLength, notifyClass, isNotifying);
    }
  },
  notify: function (element, initialInnerText, notification, notifyLength, notifyClass, isNotifying) {
    notifyLength = notifyLength ? notifyLength : 1500; // if is not notifying, notify, set isNotifying to true, and un-notify after notifyLength
    if (!isNotifying) { //if is not notifying
      element.innerText = notification; //notify
      isNotifying = true; //so we know that it is notifying
      var note = window.setTimeout(function () {
        element.innerText = initialInnerText;
        isNotifying = false;
        if (notifyClass) {
          element.classList.remove(notifyClass);
        }
        window.clearTimeout(note);
      }, notifyLength);
    }
    if (notifyClass) {
      element.classList.add(notifyClass);
    }
  },
  toggleYesNoText: function (element, permission) {
    if (Calculate.yesOrNo(element.parentNode)) {
      //if yes, toggle to no
      element.innerText = "not " + permission;
    } else {
      element.innerText = permission;
    }
  },
  toggleYesNoCssClass: function (element) {
    // if yes, remove yes and add no
    // if no, remove no and add yes
    if (Calculate.yesOrNo(element)) {
      element.classList.remove("yes");
      element.classList.add("no");
    } else {
      element.classList.remove("no");
      element.classList.add("yes");
    }
  },
  updateBoard: function (octal) {
    var visual = Calculate.octalToVisual(octal);

    for (var person in visual) {
      // person is user, group, other

      var elementToUpdate = document.getElementById(person); // element to update - column
      var elementToUpdateChildren = elementToUpdate.children;

      for (var permission in visual[person]) { // each permission in the column
        var permissionElementToUpdate; // permission element in column to update

        var permissionAllowed = visual[person][permission];

        for (var i = 0; i < elementToUpdateChildren.length; i++) { // find the permission element in column to update this iteration
          if (elementToUpdateChildren[i].classList.contains(permission)) {
            permissionElementToUpdate = elementToUpdateChildren[i];
          }
        }

        var canOrNot = Calculate.yesOrNo(permissionElementToUpdate);

        if (permissionAllowed != canOrNot) {
          Ui.toggleYesNoText(permissionElementToUpdate.children[0], permission);
          Ui.toggleYesNoCssClass(permissionElementToUpdate);
        }

        // Ui.toggleYesNoText(element, permission);
        // Ui.toggleYesNoCssClass(parent);


      }

    }

    return visual;

  }
}

// var element = e.target;
// // the parent is the div element containing the h2
// var parent = element.parentNode;
// var category = parent.parentNode.id; // user, group, or other
// var permission = Calculate.whichPermission(parent.classList); // read, write, or execute
// var octal = parseInt(inputField.value);
//
//
// // determines whether item pressed is a button
// if (Calculate.doesThisListHaveThisItem(parent.classList, "permission")) {
//   // runs if target is a button
//   // if it could before, it cannot now.
//
//   // allowed or not, false means not allowed
//   var canOrNot = Calculate.yesOrNo(parent) ? false : true;
//   Ui.toggleYesNoText(element, permission);
//   Ui.toggleYesNoCssClass(parent);
//   octal = Calculate.parseOctal(Calculate.newOctal(octal, category, permission, canOrNot));
//   //the magic
//   inputField.value = octal;
//   chmodCode.value = "chmod " + octal + " ";
//   //end magic

// Ui.updateBoard(641);