var convnetjs = require('convnetjs');
var featureParser = require('./feature_csv_parser.js');

featureParser.parse(function (training_set, test_set) {
    train(training_set, test_set);
});

function train(training_set, test_set) {

    console.log('train start');

    var training_feature_vectors = training_set.map(function (data) {
        return new convnetjs.Vol(data.slice(0, -1));
    });

    var training_labels = training_set.map(function (data) {
        return data.slice(-1)[0];
    });

    var net = new convnetjs.MagicNet(training_feature_vectors,
                                     training_labels,
                                     {
                                         num_folds: 5,
                                         num_candidates: 50,
                                         num_epochs: 10,
                                         ensemble_size: 5,
                                         neurons_min: 100,
                                         neurons_max: 300
                                     });

    net.onFinishBatch(function () {
        console.log('train finish');
        test(net, test_set);
    });
 
    // start training MagicNet. Every call trains all candidates in current batch on one example
    setInterval(function(){ net.step() }, 0);
}

function test(net, test_set) {

    var count_TP = 0;
    var count_TN = 0;
    var count_FP = 0;
    var count_FN = 0;

    console.log('test start');

    for (var i = 0; i < test_set.length; i++) {

        var ith_data = test_set[i];

        var real_label = ith_data.slice(-1)[0];
        var predicted_label = net.predict(new convnetjs.Vol(ith_data.slice(0, -1)));

        console.log('ith predicted label: ', i, predicted_label, ', real label: ', real_label);

        if (predicted_label) {
            if (real_label) {
                count_TP += 1
            } else {
                count_FP += 1
            }
        } else {
            if (real_label) {
                count_FN += 1
            } else {
                count_TN += 1
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
