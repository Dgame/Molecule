function File() {
    this._modes = {
        js: 'javascript',
        cs: 'csharp',
        rb: 'ruby',
        pl: 'perl',
        py: 'python',
        txt: 'text'
    };

    this.PathOf = function(fileName) {
        var path = __dirname + '/' + fileName;
        var stat = window.FS.statSync(path);

        if (stat && stat.isDirectory()) {
            return null;
        }

        return path;
    };

    this.Edit = function(event) {
        if (event === undefined) {
            return false;
        }

        var fileName = event.object.text;
        var path = this.PathOf(fileName);
        if (path === null) {
            return false;
        }

        console.log('edit ' + path);

        if ($('#filename').val() == path) {
            return false;
        }

        $('#filename').val(path);

        try {
            var data = window.FS.readFileSync(path);

            this.DetectModeOf(fileName);

            window.Editor.setValue(data.toString());
            window.Editor.clearSelection();
        } catch (err) {
            window.Editor.setValue('');
            console.log('No such file: ' + err);
        }
    };

    this.DetectModeOf = function(fileName) {
        var dot_pos = fileName.lastIndexOf('.');
        if (dot_pos !== -1) {
            var mode = fileName.substr(dot_pos + 1);
            if (mode in this._modes) {
                mode = this._modes[mode];
            }

            window.Editor.getSession().setMode('ace/mode/' + mode);
        }
    };

    this.Save = function(editor) {
        var path = $('#filename').val();
        if (path.length !== 0) {
            window.FS.writeFileSync(path, editor.getValue(), 'utf8');
        }
    };
}
