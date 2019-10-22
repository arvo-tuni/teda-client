# Data visualization tool

## Project setup
```
npm install
```
## Using as a web-app loaded in a browser

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run
```
cd build
node ./app.js
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Building a stand-alone app with ElectronJS

**IMPORTANT!**
The stand-alone build depends on the [server-side code](https://github.com/arvo-tuni/teda-server): please clone it so that both `teda-client` and `teda-server` projects are located in the same folder. After cloning the `teda-server` project, install its dependencies (`npm install`).

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and builds executable file for production
```
npm run electron:build
```
