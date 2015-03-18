var convnetjs = require('convnetjs');
var featureParser = require('./featureParser.js');

var net = new convnetjs.Net();

featureParser.parse(function (training_set, test_set) {
    train(training_set);
    test(test_set);
});

function train(training_set) {

    console.log('train start');

    var dimension = training_set[0].length - 1; // why -1? label.

    var layer_defs = [];
    layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:dimension});
    layer_defs.push({type:'fc', num_neurons:300, activation:'sigmoid'});
    layer_defs.push({type:'fc', num_neurons:200, activation:'relu'});
    layer_defs.push({type:'fc', num_neurons:100, activation:'relu'});
    layer_defs.push({type:'softmax', num_classes:2})
    
    net.makeLayers(layer_defs);
    
    //var trainer = new convnetjs.Trainer(net, {method: 'adagrad', l2_decay: 0.001, l1_decay: 0.001, batch_size: 10});
    var trainer = new convnetjs.Trainer(net, {method: 'adadelta',
                                              learning_rate: 0.0000001, l2_decay: 0.001, batch_size: 10});
    //var trainer = new convnetjs.Trainer(net, {method: 'sgd', learning_rate: 0.0000002, 
                                              //l2_decay: 0.001, momentum: 0.9, batch_size: 10,
                                              //l1_decay: 0.001});
    
    for (var i = 0; i < training_set.length; i++) {
        if (!(i % 1000)) process.stdout.write('.');

        var ith_data = training_set[i];
        trainer.train(new convnetjs.Vol(ith_data.slice(0, -1)), ith_data.slice(-1)[0]);
    }

    console.log('\ntrain finish');
}

function test(test_set) {

    var count_TP = 0;
    var count_TN = 0;
    var count_FP = 0;
    var count_FN = 0;

    console.log('test start');

    for (var i = 0; i < test_set.length; i++) {

        var ith_data = test_set[i];

        var real_label = ith_data.slice(-1)[0];

        var probability = net.forward(new convnetjs.Vol(ith_data.slice(0, -1)));
        var predicted_label = Number(probability.w[1] > probability.w[0]);

        console.log(i, ' ith probability: ', probability.w[0].toPrecision(5),
                    ', predicted label: ', predicted_label,
                    ', real label: ', real_label);

        if (predicted_label) {
            if (real_label) {
                count_TP += 1;
            } else {
                count_FP += 1;
            }
        } else {
            if (real_label) {
                count_FN += 1;
            } else {
                count_TN += 1;
            }
        }
    }
    console.log('test finish');

    console.log('TP: ', count_TP);
    console.log('FP: ', count_FP);
    console.log('TN: ', count_TN);
    console.log('FN: ', count_FN);

    console.log('Accuracy : ', (count_TP + count_TN) / (count_TP + count_TN + count_FP + count_FN));
    console.log('Precision: ', count_TP / (count_TP + count_FP));
    console.log('Recall   : ', count_TP / (count_TP + count_FN));
    console.log('FPR      : ', count_FP / (count_TN + count_FP));
}
