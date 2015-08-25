module.exports = {
    File: function() {
        this.State = {
            Saved: 0,
            UnSaved: 1
        };

        Object.freeze(this.State);

        this.Modes = {
            json: 'application/json',
            js: 'text/javascript',
            html: 'text/html',
            xml: 'text/html',
            tpl: 'text/html',
            c: 'text/x-csrc',
            cpp: 'text/x-c++src',
            java: 'text/x-java',
            cs: 'text/x-csharp',
            d: 'text/x-d',
            rust: 'text/x-rustsrc',
            swift: 'text/x-swift',
            rb: 'text/x-ruby',
            pl: 'text/x-perl',
            dart: 'application/dart'
        };

        Object.freeze(this.Modes);

        var self = this;

        this.edit = function(fileName) {
            $('#fileName').val(fileName);

            var dot_pos = fileName.lastIndexOf('.');
            var mode = null;
            if (dot_pos !== -1) {
                mode = fileName.substr(dot_pos + 1);
                if (mode in this.Modes) {
                    mode = this.Modes[mode];
                }
            }

            $('#mode').prop('selected', false).val(mode).prop('selected', true);

            var data = fs.readFileSync(fileName, 'utf-8');

            // console.log(mode);

            window.CodeEditor.setValue(data);
            window.CodeEditor.setOption('mode', mode);
        };

        this.openFile = function(fileName) {
            if (fileName == $('#fileName').val())
                return false;

            this.edit(fileName);
            window.Tab.openTab(fileName);
        };

        this.openFiles = function(files) {
            if (files !== undefined && files.length !== 0) {
                for (var i = 0; i < files.length; i++) {
                    this.openFile(files[i]);
                }

                return true;
            }

            dialog.showOpenDialog({
                    properties: [
                        'openFile',
                        'openDirectory',
                        'multiSelections'
                    ]
                },
                function(fileNames) {
                    if (fileNames === undefined)
                        return false;

                    this.openFiles(fileNames);

                    return false;
                }
            );
        };

        this.saveFile = function(files) {
            var fileName = $('#fileName').val();

            if (fileName.length === 0 && files.length !== 0) {
                fileName = files.shift();
            }

            if (fileName.length !== 0) {
                fs.writeFileSync(fileName, window.CodeEditor.getValue(), 'utf-8');
            } else {
                dialog.showSaveDialog(function(fileName) {
                    if (fileName === undefined)
                        return false;

                    fs.writeFileSync(fileName, window.CodeEditor.getValue(), 'utf-8');

                    return false;
                });
            }

            self.setState(self.State.Saved);
        };

        this.setState = function(state) {
            var current = $('#open-files').find('.active');
            var isAlreadChanged = current.hasClass('changed');

            if ((state === undefined || state === self.State.UnSaved) && !isAlreadChanged) {
                current.addClass('changed');
            } else if (state === self.State.Saved && isAlreadChanged) {
                current.removeClass('changed');
            }
        };
    }
};
