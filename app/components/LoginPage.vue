<template>
  <Page actionBarHidden="true" backgroundSpanUnderStatusBar="true">
    <ScrollView>
      <FlexboxLayout class="page">
        <StackLayout v-bind:class="getClass()">
          <StackLayout class="form">
            <Image class="logo" src="~/assets/images/NativeScript-Vue.png" />
            <Label class="header" text="APP NAME" />
            <StackLayout v-show="!isInitialized">
              <Label text="Loading" class="loading-label" />
              <ActivityIndicator busy="true" class="activity-indicator" />
            </StackLayout>
            <StackLayout v-show="isInitialized" class="input-field" marginBottom="25">
              <TextField
                class="input"
                hint="Email"
                keyboardType="email"
                autocorrect="false"
                autocapitalizationType="none"
                v-model="user.email"
                returnKeyType="next"
                @returnPress="focusPassword"
                fontSize="18"
              />
              <StackLayout class="hr-light" />
            </StackLayout>

            <StackLayout v-show="isInitialized" class="input-field" marginBottom="25">
              <TextField
                ref="password"
                class="input"
                hint="Password"
                secure="true"
                v-model="user.password"
                :returnKeyType="isLoggingIn ? 'done' : 'next'"
                @returnPress="focusConfirmPassword"
                fontSize="18"
              />
              <StackLayout class="hr-light" />
            </StackLayout>

            <StackLayout v-show="(isInitialized && !isLoggingIn)" class="input-field">
              <TextField
                ref="confirmPassword"
                class="input"
                hint="Confirm password"
                secure="true"
                v-model="user.confirmPassword"
                returnKeyType="done"
                fontSize="18"
              />
              <StackLayout class="hr-light" />
            </StackLayout>

            <Button
              v-show="(isLoggingIn && isInitialized)"
              :text="isLoggingIn ? 'Log In' : 'Sign Up'"
              @tap="submit"
              class="btn btn-primary m-t-20"
            />
            <Button
              v-show="(isLoggingIn && isInitialized)"
              :text="'\uf09a' +' Facebook login'"
              @tap="loginFacebook"
              class="fab btn btn-active"
            />
            <Button
              v-show="(isLoggingIn && isInitialized)"
              :text="'\uf1a0' +' Google login' "
              @tap="loginGoogle"
              class="fab btn btn-active"
            />
            <Label
              v-show="(isLoggingIn && isInitialized)"
              text="Forgot your password?"
              class="login-label"
              @tap="forgotPassword"
            />
          </StackLayout>

          <Label v-show="isInitialized" class="login-label sign-up-label" @tap="toggleForm">
            <FormattedString>
              <Span :text="isLoggingIn ? 'Don’t have an account? ' : 'Back to Login'" />
              <Span :text="isLoggingIn ? 'Sign up' : ''" class="bold" />
            </FormattedString>
          </Label>
        </StackLayout>
      </FlexboxLayout>
    </ScrollView>
  </Page>
</template>

<script>
// A stub for a service that authenticates users.
import { mapState } from "vuex";
import firebase from "nativescript-plugin-firebase";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import HomeVue from "./Home.vue";
import DashboardPage from "./DashboardPage.vue";
// const timerModule = require("tns-core-modules/timer");

// A stub for the main page of your app. In a real app you’d put this page in its own .vue file.
const HomePage = {
  template: `
<Page>
	<Label class="m-20" textWrap="true" text="You have successfully authenticated. This is where you build your core application functionality."></Label>
</Page>
`
};

var LoadingIndicator = require("nativescript-loading-indicator")
  .LoadingIndicator;
var loader = new LoadingIndicator();

export default {
  computed: {
    ...mapState(["isLoggedIn"])
  },
  watch: {
     isLoggedIn(val) {
      if (!val) {
        this.isInitialized = true;
      }else{
        this.$store.dispatch("fetchProfile");
      }
    },
    profile(val) {
      if (!val) {
      }else{
        this.$navigateTo(DashboardPage, { clearHistory: true });
      }
    }
  },
  created() {
    // if (this.$store.state.isLoggedIn != null) {
      this.isInitialized = true;
    // }
  },
  data() {
    return {
      isLoggingIn: true,
      isInitialized: false,
      user: {
        email: "test@test.com",
        password: "tester",
        confirmPassword: "tester"
      }
    };
  },
  methods: {
    toggleForm() {
      this.isLoggingIn = !this.isLoggingIn;
    },
    submit() {
      if (!this.user.email || !this.user.password) {
        this.alert("Please provide both an email address and password.");
        return;
      }
      loader.show();
      if (this.isLoggingIn) {
        this.login();
      } else {
        this.register();
      }
    },
    login() {
      this.$authService
        .login(this.user)
        .then(() => {
          loader.hide();
          // this.$navigateTo(DashboardPage);
          this.$store.commit("setIsLoggedIn", true);
        })
        .catch(err => {
          console.error(err);
          loader.hide();
          this.alert(err);
        });
    },
    loginFacebook() {
      //loader.show();//Don't use this for facebook logins, as the popup covers the UI on IOS
      if (isIOS) this.isInitialized = false;
      if (isAndroid) loader.show();
      this.$authService
        .loginFacebook(this.user)
        .then(() => {
          //if (isIOS) this.isInitialized = true; //leave this up to avoid weird animation
          if (isAndroid) loader.hide();
          // this.$navigateTo(DashboardPage);
          this.$store.commit("setIsLoggedIn", true);
        })
        .catch(err => {
          if (isIOS) this.isInitialized = true;
          else loader.hide();
          console.error(err);
          this.alert(err);
        });
    },
    loginGoogle() {
      if (isIOS) this.isInitialized = false;
      else loader.show();

      this.$authService
        .loginGoogle(this.user)
        .then(result => {
          //if (isIOS) this.isInitialized = true;
          if (isAndroid) loader.hide();
          // this.$navigateTo(DashboardPage);
          this.$store.commit("setIsLoggedIn", true);
        })
        .catch(error => {
          if (isIOS) this.isInitialized = true;
          else loader.hide();
          console.error(err);
          this.alert(error);
        });
    },
    register() {
      if (this.user.password != this.user.confirmPassword) {
        loader.hide();
        this.alert("Your passwords do not match.");
        return;
      }
      if (this.user.password.length < 6) {
        loader.hide();
        this.alert("Your password must at least 6 characters.");
        return;
      }
      var validator = require("email-validator");
      if (!validator.validate(this.user.email)) {
        loader.hide();
        this.alert("Please enter a valid email address.");
        return;
      }
      this.$authService
        .register(this.user)
        .then(() => {
          loader.hide();
          this.alert("Your account was successfully created.");
          this.isLoggingIn = true;
        })
        .catch(err => {
          console.error(err);
          loader.hide();
          this.alert(err);
        });
    },
    forgotPassword() {
      prompt({
        title: "Forgot Password",
        message:
          "Enter the email address you used to register for APP NAME to reset your password.",
        inputType: "email",
        defaultText: "",
        okButtonText: "Ok",
        cancelButtonText: "Cancel"
      }).then(data => {
        if (data.result) {
          loader.show();
          this.$authService
            .resetPassword(data.text.trim())
            .then(() => {
              loader.hide();
              this.alert(
                "Your password was successfully reset. Please check your email for instructions on choosing a new password."
              );
            })
            .catch(err => {
              loader.hide();
              this.alert(err);
            });
        }
      });
    },
    focusPassword() {
      this.$refs.password.nativeView.focus();
    },
    focusConfirmPassword() {
      if (!this.isLoggingIn) {
        this.$refs.confirmPassword.nativeView.focus();
      }
    },
    alert(message) {
      return alert({
        title: "My Car",
        okButtonText: "OK",
        message: message
      });
    },
    getClass() {
      return {
        "container-loading": this.isInitialized,
        "container-loaded": !this.isInitialized
      };
    }
  }
};
</script>

<style scoped>
.page {
  align-items: center;
  flex-direction: column;
}

.form {
  margin-left: 30;
  margin-right: 30;
  flex-grow: 2;
  vertical-align: middle;
}

.logo {
  margin-bottom: 12;
  height: 90;
  font-weight: bold;
}

.header {
  horizontal-align: center;
  font-size: 25;
  font-weight: 600;
  margin-bottom: 70;
  text-align: center;
  color: #d51a1a;
}

.input-field {
  margin-bottom: 25;
}

.input {
  font-size: 18;
  placeholder-color: #a8a8a8;
}

.input-field .input {
  font-size: 54;
}

.btn-primary {
  height: 50;
  margin: 30 5 15 5;
  background-color: #d51a1a;
  border-radius: 5;
  font-size: 20;
  font-weight: 600;
}

.login-label {
  horizontal-align: center;
  color: #a8a8a8;
  font-size: 16;
}

.sign-up-label {
  margin-bottom: 20;
}

.bold {
  color: #000000;
}

.container-loading {
  animation-name: loading;
  animation-fill-mode: forwards;
  animation-duration: 0.6;
  animation-iteration-count: 1;
}
@keyframes loading {
  0% {
    transform: translate(0, 200);
  }
  100% {
    transform: translate(0, 0);
  }
}
.container-loaded {
  animation-name: loaded;
  animation-fill-mode: forwards;
  animation-duration: 0.6;
  animation-iteration-count: 1;
}

@keyframes loaded {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(0, 200);
  }
}
</style>