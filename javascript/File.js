function File() {
    this._modes = {
        js: 'javascript',
        cs: 'csharp',
        rb: 'ruby',
        pl: 'perl',
        py: 'python',
        txt: 'text'
    };

    this.IsCurrent = function(fileName) {
        var path = __dirname + '/' + fileName;

        return $('#filename').val() == path;
    };

    this.Open = function(fileName) {
        if (this.IsCurrent(fileName)) {
            return false;
        }

        var stat = window.FS.statSync(__dirname + '/' + fileName);
        if (stat && stat.isDirectory()) {
            return false;
        }

        window.Tab.Open(fileName);
    };

    this.Edit = function(fileName) {
        console.log('File edit');
        var path = __dirname + '/' + fileName;
        $('#filename').val(path);

        var data = window.FS.readFileSync(path);

        var dot_pos = fileName.lastIndexOf('.');
        if (dot_pos !== -1) {
            var mode = fileName.substr(dot_pos + 1);
            if (mode in this._modes) {
                mode = this._modes[mode];
            }

            window.Editor.getSession().setMode('ace/mode/' + mode);
        }

        window.Editor.setValue(data.toString());
        window.Editor.clearSelection();
    };

    this.Save = function(editor) {
        var path = $('#filename').val();
        if (path.length !== 0) {
            window.FS.writeFileSync(path, editor.getValue(), 'utf8');
        }
    };
}
