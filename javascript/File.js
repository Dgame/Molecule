function File() {
    this._modes = {
        js: 'javascript',
        cs: 'csharp',
        rb: 'ruby',
        pl: 'perl',
        py: 'python',
        txt: 'text'
    };

    this.IsFile = function(path) {
        var stat = window.FS.statSync(path);

        if (stat && stat.isDirectory()) {
            return false;
        }

        return true;
    };

    this.Edit = function(event) {
        var path = event.object.path;
        console.log('edit ' + path);

        if (!this.IsFile(path)) {
            return false;
        }

        if ($('#filename').val() == path) {
            return false;
        }

        $('#filename').val(path);

        try {
            var data = window.FS.readFileSync(path);

            this.DetectModeOf(event.object.text);

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
