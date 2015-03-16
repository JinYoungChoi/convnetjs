var fs = require('fs');
var parse = require('csv-parse');

var parser = parse({delimiter: ','});
var featureStream = fs.createReadStream('feature-vector-12-37-90000restricted-67feature.csv');

var FeatureParser = function () {

    this.parse = function (callback) {

        var training_set = [];
        var test_set = [];

        featureStream
            .on("readable", function () {
                var data;
                while ((data = featureStream.read()) !== null) {
                    parser.write(data);
                }
            })
            .on('error', function (e) {
                console.error('error: ', e)
            })
            .on("end", function () {
                parser.end();
            });
         
        parser
            .on("readable", function () {
                var data;
                while ((data = parser.read()) !== null) {
                    
                    // convert data to number type
                    data = data.map(function (elem) { return Number(elem); });

                    if (Math.random() > 0.2) {
                        training_set.push(data);
                    } else {
                        test_set.push(data);
                    }
                }
            })
            .on("end", function () {
                console.log("csv parsing done");
                callback(training_set, test_set);
            });
    }

};

module.exports = new FeatureParser();
