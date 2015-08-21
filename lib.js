var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

var s = require(__dirname + '/Settings.js');
var Settings = new s.Settings('settings.json');

window.$ = window.jQuery = require(__dirname + '/js/jquery-2.1.4.min.js');

$(document).ready(function() {
    var CodeEditor = CodeMirror.fromTextArea(
        document.getElementById('editor'), {
            placeholder: 'Code goes here...',
            viewportMargin: Infinity,
            rulers: [{
                color: Settings.Values.RulerColor,
                column: Settings.Values.LineLength,
                lineStyle: 'dashed'
            }],
            showTrailingSpace: Settings.Values.ShowTrailingSpace,
            lineNumbers: Settings.Values.ShowLineNumbers,
            styleActiveLine: Settings.Values.StyleActiveLine,
            autoCloseBrackets: Settings.Values.AutoCloseBrackets,
            matchBrackets: Settings.Values.MatchBrackets,
            lineWrapping: Settings.Values.LineWrapping,
            indentUnit: Settings.Values.IndentUnit,
            smartIndent: Settings.Values.SmartIndent,
            tabSize: Settings.Values.TabSize,
            indentWithTabs: Settings.Values.IndentWithTabs,
            autofocus: Settings.Values.AutoFocus,
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-F': 'findPersistent',
                'Ctrl-P': function(cm) {
                    return cm.openDialog(
                        $('#dialog').html(),
                        function(cmd) {
                            return handleCommand(cmd);
                        }
                    );
                },
                'Ctrl-S': saveFile
            },
            globalVars: true
        }
    );

    function handleCommand(commands) {
        var cmds = commands.split(' ');
        if (cmds.length < 1)
            return false;

        var cmd = cmds.shift();
        switch (cmd) {
            case 'open':
                return openFile(cmds);
            case 'save':
                return saveFile(cmds);
        }
    }

    (function init() {
        var data = fs.readFileSync(Settings.File, 'utf-8');
        var obj = JSON.parse(data);
        $.each(obj.open_files, function(idx, name) {
            addFile(name);
        });

        var fileName = obj.open_files.pop();
        openFile(fileName);

        $('#theme option').each(function() {
            if ($(this).text() == obj.theme) {
                $(this).prop('selected', true);
                return false;
            }
        });

        $('#mode option').each(function() {
            if ($(this).text() == obj.mode) {
                $(this).prop('selected', true);
                return false;
            }
        });

        CodeEditor.setOption('mode', obj.mode);
        CodeEditor.setOption('theme', obj.theme);
    })();

    function isOpen(fileName) {
        var open = false;

        $('#open-files li').each(function() {
            if ($(this).text() == fileName) {
                open = true;
                return false;
            }
        });

        return open;
    }

    function isCurrent(fileName) {
        return fileName == $('#fileName').val();
    }

    function edit(fileName, data) {
        $('#fileName').val(fileName);
        $('#content h6').text(fileName);
        CodeEditor.setValue(data);
    }

    function addFile(name) {
        var entry = document.createElement('li');
        $(entry).text(name);
        $('#open-files ul').append(entry);
    }

    function openFile(file) {
        var fileName = __dirname + '/' + file;
        if (isCurrent(fileName))
            return false;

        var data = fs.readFileSync(fileName, 'utf-8');
        edit(fileName, data);

        if (!isOpen(file))
            addFile(file);
    }

    function openFiles(files) {
        if (files !== undefined && files.length !== 0) {
            $.each(files, function(idx, fileName) {
                openFile(fileName);
            });

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
                    return;

                return openFiles(fileNames);
            }
        );
    }

    function saveFile(files) {
        var fileName = $('#fileName').val();
        if (fileName.length === 0 && files !== undefined && files.length !== 0) {
            fileName = files.shift();
        }

        if (fileName.length !== 0) {
            fs.writeFileSync(fileName, CodeEditor.getValue(), 'utf-8');
            return true;
        }

        dialog.showSaveDialog(function(fileName) {
            if (fileName === undefined)
                return false;

            fs.writeFileSync(fileName, CodeEditor.getValue(), 'utf-8');

            return true;
        });
    }

    $('#open-files ul').on('click', 'li', function() {
        var fileName = $(this).text();
        openFile(fileName);
    });

    $('#theme').change(function() {
        var theme = $(this).find('option:selected').val();
        CodeEditor.setOption('theme', theme);
    });

    $('#mode').change(function() {
        var mode = $(this).find('option:selected').val();
        CodeEditor.setOption('mode', mode);
    });
});

$(window).unload(function() {
    var open_files = [];
    $('#open-files ul li').each(function() {
        open_files.push($(this).text());
    });

    var settings = {
        'open_files': open_files,
        'theme': $('#theme').find('option:selected').val(),
        'mode': $('#mode').find('option:selected').val(),
    };

    var json = JSON.stringify(settings, null, 4);
    fs.writeFileSync(Settings.File, json, 'utf-8');
});
