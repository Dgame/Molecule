var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

window.$ = window.jQuery = require(__dirname + '/js/jquery-2.1.4.min.js');

$(document).ready(function() {
    var CodeEditor = CodeMirror.fromTextArea(
        document.getElementById('editor'), {
            placeholder: 'Code goes here...',
            viewportMargin: Infinity,
            rulers: [{
                color: '#ccc',
                column: 120,
                lineStyle: 'dashed'
            }],
            showTrailingSpace: true,
            lineNumbers: true,
            styleActiveLine: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            lineWrapping: true,
            indentUnit: 4,
            smartIndent: true,
            tabSize: 4,
            indentWithTabs: false,
            autofocus: true,
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
        fs.readFile(__dirname + '/settings.json', 'utf-8', function(err, data) {
            if (!err) {
                var obj = JSON.parse(data);
                $.each(obj.open_files, function(idx, name) {
                    addFile(name);
                });

                open(__dirname + '/' + obj.open_files.pop());

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

                setOption('mode', obj.mode);
                setOption('theme', obj.theme);
            }
        });
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

    function isLoaded(fileName) {
        return fileName == $('#fileName').val();
    }

    function edit(fileName, data) {
        $('#fileName').val(fileName);
        CodeEditor.setValue(data);
    }

    function addFile(name) {
        $('#open-files ul').append($('<li>').text(name));
    }

    function open(fileName) {
        if (isLoaded(fileName))
            return false;

        fs.readFile(fileName, 'utf-8', function(err, data) {
            edit(fileName, data);

            var name = fileName.split('/').reverse()[0];
            if (!isOpen(name))
                addFile(name);
        });
    }

    function openFile(files) {
        if (files !== undefined && files.length !== 0) {
            return openFiles(files);
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

    function openFiles(fileNames) {
        $.each(fileNames, function(idx, fileName) {
            open(__dirname + '/' + $.trim(fileName));
        });

        return true;
    }

    function save(fileName) {
        fs.writeFile(fileName, CodeEditor.getValue(), function(err) {
            if (err)
                alert(err);
        });
    }

    function saveFile(file) {
        var fileName = $('#fileName').val();

        if (fileName.length === 0 && file !== undefined && file.length !== 0) {
            fileName = file.shift();
        }

        if (fileName.length !== 0) {
            return save(fileName);
        }

        dialog.showSaveDialog(function(fileName) {
            if (fileName === undefined)
                return;

            return save(fileName);
        });
    }

    $('#open-files ul').on('click', 'li', function() {
        var name = $(this).text();
        open(__dirname + '/' + name);
    });

    function setOption(what, val) {
        CodeEditor.setOption(what, val);
    }

    $('#theme').change(function() {
        var theme = $(this).find('option:selected').val();
        setOption('theme', theme);
    });

    $('#mode').change(function() {
        var mode = $(this).find('option:selected').val();
        setOption('mode', mode);
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

    fs.writeFile(__dirname + '/settings.json', json, function(err) {
        if (err)
            alert(err);
    });
});
