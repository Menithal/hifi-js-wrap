require("shelljs/global");
var path = require("path");
var ora = require("ora");
var fs = require("fs");
var args = require("process").argv;


var config = {
  distPath: '.' + path.resolve(__dirname, '/dist'),
  sourceRoot: '.' + path.resolve(__dirname, '/src')
}
var spinner = ora('Prepearing');

spinner.start();
rm('-rf', config.distPath);
mkdir('-p', config.distPath);

require("babel-core").transformFile(path.join(config.sourceRoot, "wrap.js"), { presets: ["env"]},
  (err, result) => {
    spinner.stop();
    if (err) {
      console.log("Error occurred")
      console.error(err);
      return;
    }
    spinner = ora('Writing File');
    spinner.start();
    fs.writeFile(path.join(config.distPath,'hifi-js-wrap.js'), result.code, (err) => {
      spinner.stop();
      if (err) {
        return console.error(err)
      }
      console.log("Build Complete");
    });
  }
);
