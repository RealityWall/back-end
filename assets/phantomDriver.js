var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

var filePath = system.args[1];
var html = fs.read( filePath );

page.content = html,
page.paperSize = {
    format: 'A3',
    margin: '1cm',
    orientation: 'landscape'
};

page.onLoadFinished = function( status ) {
    if (status !== 'success') {
        console.log('PhantomError: Unable to load the html!');
        phantom.exit(1);
    } else {
        page.render( filePath.replace('.html', '.pdf') );
        phantom.exit();
    }
};