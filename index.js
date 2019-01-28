var express = require('express');
var ping = require('ping');

var app = express();

app.get('/', function (req, res) {
    var hosts = ['capgov.cos.ufrj.br' , 'cos.ufrj.br', 'ufrj.br', 'fiocruz.br'];
    promises = []
    msgs = []

    hosts.forEach(function (host) {
        promises.push(ping.promise.probe(host))
    });
    Promise.all(promises).then(arrayping => {
        arrayping.forEach(resp =>
            msgs.push(resp.host + " está " + resp.alive)
        )
        res.send(msgs)
    }
    );
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
