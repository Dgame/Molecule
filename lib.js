var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

var s = require(__dirname + '/Settings.js');
var Settings = new s.Settings('settings.json');

window.$ = window.jQuery = require(__dirname + '/jquery/jquery-2.1.4.min.js');

require(__dirname + '/jquery-treeview/jquery.treeview.js');

$(document).ready(function() {
    var t0 = performance.now();

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

    var t1 = performance.now();
    console.log('Call to init CodeEditor took ' + (t1 - t0) + ' milliseconds.');

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

    function listTreeViewOf(dir) {
        var entries = fs.readdirSync(dir);

        var img = {
            folder: '<img src="jquery-treeview/images/folder.gif" />',
            file: '<img src="jquery-treeview/images/file.gif" />'
        };

        var results = [];
        $.each(entries, function(idx, file) {
            var path = dir + '/' + file;
            var stat = fs.statSync(path);

            if (stat && stat.isDirectory()) {
                var files = listTreeViewOf(path);

                if (files.length !== 0) {
                    results.push('<li>' + img.folder + ' ' + file + '<ul style="display: none;">');
                    results.push(files.join("\n"));
                    results.push('</ul></li>');
                } else {
                    results.push('<li>' + img.folder + ' ' + file + '</li>');
                }
            } else {
                var span = '<span style="display: none;">' + path + '</span>';
                results.push('<li>' + span + img.file + ' ' + file + '</li>');
            }
        });

        return results;
    }

    (function init() {
        var data = fs.readFileSync(Settings.File, 'utf-8');
        var obj = JSON.parse(data);

        // $.each(obj.open_files, function(idx, name) {
        //     addFile(name);
        // });

        var files = listTreeViewOf(__dirname);
        // $('#open-files').append('<li>Foo</li>');
        $('#open-files').html(files.join("\n")).treeview();

        // var fileName = obj.open_files.pop();
        // openFile(fileName);

        $('#mode').each(function() {
            if ($(this).text() == obj.mode) {
                $(this).prop('selected', true);
                return false;
            }
        });

        $('#theme').each(function() {
            if ($(this).text() == obj.theme) {
                $(this).prop('selected', true);
                return false;
            }
        });

        CodeEditor.setOption('mode', obj.mode);
        CodeEditor.setOption('theme', obj.theme);
    })();

    $('#open-files').on('click', 'li', function() {
        var path = $(this).find('span').text();
        if (path !== undefined && path.length !== 0) {
            openFile(path);
        }
    });

    function isCurrent(fileName) {
        return fileName == $('#fileName').val();
    }

    function edit(fileName, data) {
        if (fileName.length === 0)
            return false;

        $('#fileName').val(fileName);

        var name = fileName.split('/').pop();
        $('#title').text(name);

        CodeEditor.setValue(data);
    }

    // function addFile(name) {
    //     if (fileName.length === 0)
    //         return false;
    //
    //     var entry = document.createElement('li');
    //     $(entry).text(name);
    //     $('#open-files').append(entry);
    // }

    function openFile(fileName) {
        if (fileName.length === 0)
            return false;

        if (isCurrent(fileName))
            return false;

        var data = fs.readFileSync(fileName, 'utf-8');
        edit(fileName, data);
        //
        // if (!isOpen(file))
        //     addFile(file);
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
                    return false;

                openFiles(fileNames);

                return false;
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
        } else {
            dialog.showSaveDialog(function(fileName) {
                if (fileName === undefined)
                    return false;

                fs.writeFileSync(fileName, CodeEditor.getValue(), 'utf-8');

                return false;
            });
        }
    }

    $('#theme').change(function() {
        var theme = $(this).find('option:selected').val();
        CodeEditor.setOption('theme', theme);

        return false;
    });

    $('#mode').change(function() {
        var mode = $(this).find('option:selected').val();
        CodeEditor.setOption('mode', mode);

        return false;
    });

    var t2 = performance.now();
    console.log('Call to load everything left took ' + (t2 - t1) + ' milliseconds.')
});

$(window).unload(function() {
    var t0 = performance.now();

    var open_files = [];
    $('#open-files').each(function() {
        open_files.push($(this).text());
    });

    var settings = {
        'open_files': open_files,
        'theme': $('#theme').find('option:selected').val(),
        'mode': $('#mode').find('option:selected').val(),
    };

    var json = JSON.stringify(settings, null, 4);
    fs.writeFileSync(Settings.File, json, 'utf-8');

    var t1 = performance.now();
    console.log('Call to unload took ' + (t1 - t0) + ' milliseconds.')
});
