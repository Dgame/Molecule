module.exports = {
    Settings: function(fileName) {
        this.File = __dirname + '/_settings.json';
        this.Values = {};

        var data = fs.readFileSync(__dirname + '/' + fileName);
        this.Values = JSON.parse(data);
    }
};
