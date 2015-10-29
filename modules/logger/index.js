var colors = require('colors/safe');

module.exports = {
    info: function(content){console.log(colors.white("INFO : "+content))},
    warning: function(content){console.log(colors.yellow("WARN : "+content))},
    error: function(content){console.log(colors.red("ERR : "+content))},
    success: function(content){console.log(colors.green("SUCC : "+content))}
}