var xlsx = require('xlsx');
var async = require('async');

var feature_accept_charset = require('./feature/feature_accept_charset.js');

var workbook = xlsx.readFile('ICS-12-90000restricted-37.xlsx');
var sheet1 = workbook.Sheets[workbook.SheetNames[0]];
var sheet1_range = xlsx.utils.decode_range(sheet1['!ref']);

const http_methods = ['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'];

for(var row = sheet1_range.s.r; row < sheet1_range.e.r; row++)
{
    var cell_address = xlsx.utils.encode_cell({c:7, r:row});
    var raw_data = sheet1[cell_address].v;

    if(is_normal_form(raw_data))
    {
        async.parallel([
            function(callback) { callback(null, feature_accept_charset(raw_data)); }
        ], function(err, results) {
            console.log('FINAL feature vector: ', results);
        });
    }
}


function is_normal_form(http_request)
{
    var terms = http_request.split(/\s+/, 1);
    
    return terms.length > 0 &&
           http_methods.indexOf(terms[0].toUpperCase());
}
