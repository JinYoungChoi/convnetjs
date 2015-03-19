const charset_types = ['windows-949','windows-1258','utf-8','urf-8','utf-16','iso-8859-1','gb2312','gbk','euc-kr','*'];

var feature_accept_charset = function(http_request) {

    var feature_vector = [0,0,0,0,0,0,0,0,0,0];

    var lines = http_request.split('\n');

    lines.forEach(function(line) {
        if(line.toLowerCase().startsWith('accept-charset')) {
            try {
                var types = line.split(':', 2)[1].split(',');
                types.forEach(function(type) {
                    type = type.trim().toLowerCase();
                
                });
            } catch(e) {
            
            }
        }
    });

    return feature_vector;
};

module.exports = feature_accept_charset;
