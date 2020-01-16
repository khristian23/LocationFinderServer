const express = require('express');
const app = express();
var ODataServer = require('simple-odata-server');

const hostname = '127.0.0.1';
const port = 3000;

const Adapter = require('./db-adapter.js');
console.log(Adapter)


const { Client } = require('pg');
var connectionString = "postgres://postgres:root@localhost:5432/Test";
const client = new Client({
    connectionString: connectionString
});
client.connect(function (err, db) {
    odataServer.adapter(Adapter(function(es, cb) { 
        console.log("Adaapter callback " + cb)
        cb(null, db);
    }));
});



 
function query (setName, query, req, cb) {
    console.log(setName + " query called");
    client.query('SELECT * FROM users', (error, result) => {
        cb(null, result.rows);
    });
    
}

var model = {
    namespace: "jsreport",
    entityTypes: {
        "UserType": {
            "id": {"type": "Edm.String", key: true},
            "name": {"type": "Edm.String"},            
        }
    },   
    entitySets: {
        "users": {
            entityType: "jsreport.UserType"
        }
    }
};
 
var odataServer = ODataServer(`http://${hostname}:${port}`)
    .model(model);
 
//odataServer.query(query);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-CSRF-Token, OData-Version, odata-maxversion');
    res.header("Access-Control-Expose-Headers", "OData-Version");

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      //respond with 200
      res.sendStatus(200);
    }
    else {
    //move on
      next();
    }
});
/*
app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-CSRF-Token, odata-version, odata-maxversion');
    res.sendStatus(200);
});*/

app.use("/", function (req, res) {
    odataServer.handle(req, res);
});

app.listen(port);

