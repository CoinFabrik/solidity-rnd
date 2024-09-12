module.exports['without-ext'] = function (str) {
    var n = str.lastIndexOf("\\");
    var result = str.substring(n + 1);
    return result.replace('.md', '');
}