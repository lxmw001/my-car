import firebase from "nativescript-plugin-firebase";
import store from "../store";

export default {
  getProfile() {
    firebase.getCurrentUser().then(function(currentuser) {
    console.log("TCL: getProfile -> currentuser", currentuser)
      firebase.firestore.getDocument("users", currentuser.uid).then(docdata => {
      // console.log("TCL: getProfile -> docdata", docdata)
        var userdata = {};
        userdata.id = currentuser.uid;
        if (docdata.exists) {
          var fbdata = docdata.data();
          userdata.name = fbdata.name;
          userdata.bio = fbdata.bio;
          userdata.profile_pic = fbdata.profile_pic;
        } else {
          firebase.firestore.set("users", currentuser.uid, {});
        }
        store.commit("setProfile", userdata);
      }, error => {
        console.log('error', error)
        // store.commit("isLoggedIn", false);
        }
      )
    });
  }
};
