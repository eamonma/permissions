window.onload = function() {
  // body event listener

  var div = document.getElementsByClassName("container")[0]; //div is the first class .container
  var inputField = document.getElementsByTagName("input")[0]; //input is the first input element
  var chmodCode = document.getElementById("chmodCode"); //chmodcode
  var eg = document.getElementById("example");
  var clicktocopy = document.getElementById("clicktocopy");
  var clicktocopyInnerText = clicktocopy.innerText;
  var isNotifying = false;

  inputField.value = "777";

  inputField.onclick = function(e) {
    Ui.copyInputContentToClipboard(e.target, clicktocopyInnerText, clicktocopy, null, null, "red-notify");
  }

  eg.onclick = function(e) {
    Ui.copyInputContentToClipboard(chmodCode, clicktocopyInnerText, clicktocopy, null, null, "red-notify");
  }

  // when clicking buttons

  container.addEventListener("keyup", function(e) {
  // Cancel the default action, if needed
  e.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13 || event.keyCode === 32) {
    // Trigger the button element with a click
    console.log(e);
    e.target.click();
  }
});

  container.addEventListener("click", function(e) {
    inputField = document.getElementsByTagName("input")[0];
    // the h2
    var element = e.target;
    // the parent is the div element containing the h2
    var parent = element.parentNode;
    var category = parent.parentNode.id; // user, group, or other
    var permission = Calculate.whichPermission(parent.classList); // read, write, or execute
    var octal = parseInt(inputField.value);


    // determines whether item pressed is a button
    if (Calculate.doesThisListHaveThisItem(parent.classList, "permission")) {
      // runs if target is a button
      // if it could before, it cannot now.
      // allowed or not, false means not allowed
      var canOrNot = Calculate.yesOrNo(parent) ? false : true;
      console.log(canOrNot);
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
  newOctal: function(currentOctal, category, permission, canOrNot) {
    // currentOctal to modify
    // category to determine multiplier
    // permission to determine factor
    // canOrNot add or subtract
    var multiplier = (category == "user") ? (100) : (category == "group" ? (10) : (1));
    var permissionFactor = (permission == "read") ? 4 : ((permission == "write") ? 2 : 1);
    var preliminary = multiplier * permissionFactor;
    console.log("preliminary: " + preliminary);
    if (canOrNot) {
      currentOctal += preliminary;
      console.log("add premilinary");
    } else {
      currentOctal -= preliminary;
      console.log("subtract preliminary");
    }
    return currentOctal;
  },
  parseOctal: function(number) { //returns the octal as a string
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
  yesOrNo: function(element) {
    // whether the premission is set to be allowed
    if (this.doesThisListHaveThisItem(element.classList, "yes", true)) {
      return true;
    } else {
      return false;
    }
  },
  doesThisListHaveThisItem: function(list, item, wantBoolean) {
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
  whichPermission: function(list) {
    // true, as we want boolean
    // self-descriptive
    //if the list has "read", return read, if it has write, return write, if it has execute, return execute, otherwise null
    return this.doesThisListHaveThisItem(list, "read", true) ? "read" : (this.doesThisListHaveThisItem(list, "write", true) ? "write" : this.doesThisListHaveThisItem(list, "execute", true) ? "execute" : null);
  }
}

var Ui = {
  //copies input content to clipboard
  copyInputContentToClipboard: function(element, initialInnerText, notifyElement, notification, notifyLength, notifyClass, isNotifying) {
    notification = notification ? notification : "Copied!";
    element.select();
    document.execCommand("Copy");
    element.blur();
    if (notifyElement) {
      this.notify(notifyElement, initialInnerText, notification, notifyLength, notifyClass, isNotifying);
    }
  },
  notify: function(element, initialInnerText, notification, notifyLength, notifyClass, isNotifying) {
    notifyLength = notifyLength ? notifyLength : 1500; // if is not notifying, notify, set isNotifying to true, and un-notify after notifyLength
    if (!isNotifying) { //if is not notifying
      element.innerText = notification; //notify
      isNotifying = true; //so we know that it is notifying
      window.setTimeout(function() {
        element.innerText = initialInnerText;
        isNotifying = false;
        if (notifyClass) {
          element.classList.remove(notifyClass);
        }
      }, notifyLength);
    }
    if (notifyClass) {
      element.classList.add(notifyClass);
    }
  },
  toggleYesNoText: function(element, permission) {
    if (Calculate.yesOrNo(element.parentNode)) {
      element.innerText = "not " + permission;
    } else {
      element.innerText = permission;
    }
  },
  toggleYesNoCssClass: function(element) {
    // if yes, remove yes and add no
    // if no, remove no and add yes
    if (Calculate.yesOrNo(element)) {
      element.classList.remove("yes");
      element.classList.add("no");
    } else {
      element.classList.remove("no");
      element.classList.add("yes");
    }
  }

}
