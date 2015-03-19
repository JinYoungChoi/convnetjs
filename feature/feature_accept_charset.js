const charset_types = ['windows-949','windows-1258','utf-8','urf-8','utf-16','iso-8859-1','gb2312','gbk','euc-kr','*'];

if(typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}

var feature_accept_charset = function(http_request) {

    var feature_vector = [0,0,0,0,0,0,0,0,0,0];

    var lines = http_request.split('\n');

    lines.some(function(line) {
        if(line.toLowerCase().startsWith('accept-charset')) {
            try {
                var types = line.split(':', 2)[1].split(',');
                types.forEach(function(type) {

                    type = type.trim().toLowerCase();

                    var q_value = 1;
                    try {
                        splitted = type.split(';', 2);
                        type = splitted[0];
                        q_value = splitted[1].split('=')[1];
                    } catch(e) { }

                    var index_charset = charset_types.indexOf(type);
                    if(index_charset > -1) {
                        feature_vector[index_charset] = q_value;
                    }

                });
            } catch(e) { }

            return true;
        }
    });

    return feature_vector;
};

module.exports = feature_accept_charset;
