# My Car

> Vehicle important data


## Usage

``` bash
# Install dependencies
npm install

# Build for production
tns build <platform> --bundle

# Build, watch for changes and debug the application
tns debug <platform> --bundle

# Build, watch for changes and run the application
tns run <platform> --bundle
```


## Solve issues:
Uncomment `implementation "com.google.firebase:firebase-storage:17.0.0"` on `node_modules/nativescript-plugin-firebase/platforms/android/include.gradle`