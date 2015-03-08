var convnetjs = require('convnetjs');
var fs = require('fs');
var parse = require('csv-parse');

var net = new convnetjs.Net();
var training_set = [];
var test_set = [];

var parser = parse({delimiter: ','});
var featureStream = fs.createReadStream('feature-vector-12-37-90000restricted-67feature.csv');

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
            if (Math.random() > 0.2) {
                training_set.push(data)
            } else {
                test_set.push(data)
            }
        }
    })
    .on("end", function () {
        console.log("csv parsing done");
        train();
        test();
    });

function train() {

    var layer_defs = [];
    layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:67});
    layer_defs.push({type:'fc', num_neurons:200, activation:'sigmoid'});
    layer_defs.push({type:'fc', num_neurons:200, activation:'sigmoid'});
    layer_defs.push({type:'softmax', num_classes:2})
    
    net.makeLayers(layer_defs);
    
    var trainer = new convnetjs.Trainer(net, {method: 'adadelta', l2_decay: 0.001, batch_size: 10});
    //var trainer = new convnetjs.Trainer(net, {method: 'adagrad', l2_decay: 0.001, l1_decay: 0.001, batch_size: 10});

    console.log('train start');
    for (var i = 0; i < training_set.length; i++) {
        console.log('ith-training: ', i);
        var ith_data = training_set[i];
        var x = new convnetjs.Vol(ith_data.slice(0, -1));
        trainer.train(x, ith_data.slice(-1)[0]);
    }
    console.log('train finish');
}

function test() {

    var count_TP = 0;
    var count_TN = 0;
    var count_FP = 0;
    var count_FN = 0;

    console.log('test start');
    for (var i = 0; i < test_set.length; i++) {
        var ith_data = test_set[i];
        var x = new convnetjs.Vol(ith_data.slice(0, -1));
        var probability = net.forward(x);

        var real_label = ith_data.slice(-1)[0];

        console.log('probability: ', probability.w[0]);
        if (probability.w[0] > probability.w[1]) {
            if (real_label == 0) {
                count_TN += 1
            } else {
                count_FN += 1
            }
        } else {
            if (real_label == 0) {
                count_FP += 1
            } else {
                count_TP += 1
            }
        }
    }
    console.log('test finish');

    console.log('TP: ', count_TP);
    console.log('TN: ', count_TN);
    console.log('FP: ', count_FP);
    console.log('FN: ', count_FN);

    console.log('Accuracy : ', (count_TP + count_TN) / (count_TP + count_TN + count_FP + count_FN));
    console.log('Precision: ', count_TP / (count_TP + count_FP));
    console.log('Recall   : ', count_TP / (count_TP + count_FN));
    console.log('FPR      : ', count_FP / (count_TN + count_FP));
}
