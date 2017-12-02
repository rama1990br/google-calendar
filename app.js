var http = require('http');
var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
const PORT = 3000;


http.createServer(function (request, response) {
    //console.log(request.url);
    
    if (request.url === '/favicon.ico') {           //code to handle favicon.ico image
        response.writeHead(200, {'Content-Type': 'image/x-icon'} );
        response.end();
        return;
    }
    var con = mysql.createConnection({
        host: "localhost",
        user: "custom",
        password: "password",
        database: "calendar_db"
    });

    if (request.method === 'POST' && request.url === '/') {
        var body = '';

        request.on('data', function (data) {
            body =JSON.parse(data);
            if (body.length > 1e6){
                request.connection.destroy();
            }
            con.query('INSERT INTO dummyTable SET ?' ,body, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        });
    }
  
    var filePath = request.url === '/' ? 'index.html' : request.url;
    var extName;

    function getContentType(extName) {
        switch (extName) {
            case 'css': return 'text/css';
            case 'json': return 'application/json';
            case 'js': return 'application/javascript';
            default: return "text/html";
        }
    }

    if (filePath.includes('?')) {
        extName = filePath.split('?')[0].split('.')[1];
    }
    else {
        extName = filePath.split('.')[1];
    }
    
    if(request.url.includes('/getJSONResponse') && request.method === 'GET'){
        var result;
        con.query('SELECT * FROM dummyTable', (err,rows) => {
            if(err) throw err;
            console.log('Data received from Db:\n');
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(rows), 'utf-8');
        });
  
    }
    else{
        fs.readFile('./' + filePath.split('?')[0], function (error, content) {
            if (error) {
                throw error;
            }
            else {
                response.writeHead(200, { 'Content-Type': getContentType(extName) });
                response.end(content, 'utf-8');
            }
        });
    }
}).listen(3000);

