require("shelljs/global");
var path = require("path");
var ora = require("ora");
var fs = require("fs");
var config = {
  buildPath: '.' + path.resolve(__dirname, '/dist'),
  sourceRoot: '.' + path.resolve(__dirname, '/src')
}

var spinner = ora('Prepearing');
spinner.start();
rm('-rf', config.buildPath);
mkdir('-p', config.buildPath);

require("babel-core").transformFile(path.join(config.sourceRoot, "test.js"), { presets: ["env"]},
  (err, result) => {
    spinner.stop();
    if (err) {
      console.log("Error occurred")
      console.error(err);
      return;
    }
    spinner = ora('Writing File');
    spinner.start();
    fs.writeFile(path.join(config.buildPath,'hifi-js-wrap.js'), result.code, (err) => {
      spinner.stop();
      if (err) {
        return console.error(err)
      }
      console.log("Build Complete");
    });
  }
);
