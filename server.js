let express = require('express');
let morgan = require('morgan');
let fs = require('fs');
let path = require('path');
let exphbs = require('express-handlebars');
let favicon = require('serve-favicon');
let exec = require('child_process').exec;

let hostname = '0.0.0.0';
let port = 8888;

let app = express();
let staticPath = path.resolve(process.argv[2] || __dirname);

app.use(morgan('dev'));
app.use(favicon(path.join(__dirname, 'images', 'favicon.ico')));

app.set('views', path.join(__dirname, 'views'));

let createViewModel = (prefix, s) => {
    let a = s.split('\n');
    a.pop();
    let ans = {
        'path': prefix,
        'elements': []
    };
    for (let x of a) {
        ans.elements.push({
            'uri': path.join(prefix, x),
            'name': x
        });
    }
    return ans;
};

app.engine('hbs', exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts')
}).engine);

app.set('view engine', 'hbs');

app.get('*', (req, res) => {
    let URI = decodeURI(req.originalUrl);
    let p = path.join(staticPath, URI);
    fs.stat(p, (err, stats) => {
        if (err) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(p + ' not found');
        } else  if (stats.isDirectory()) {
            exec('ls "' + p + '"', (err, stdout, stderr) => {
                res.render('index', createViewModel(URI, stdout));
            });
        } else {
            res.sendFile(p, {}, () => {
                res.end();
            });
        }
    });
});

app.listen(port, hostname, (res) => {
    console.log("Server running at port", port);
});
