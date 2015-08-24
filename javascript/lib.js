var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

var s = require(__dirname + '/javascript/Settings.js');
var Settings = new s.Settings('json/settings.json');

window.$ = window.jQuery = require(__dirname + '/jquery/jquery-2.1.4.min.js');
window.OpenFiles = [];

require(__dirname + '/jquery/treeview/jquery.treeview.js');

$(document).ready(function() {
    var t0 = performance.now();

    window.CodeEditor = CodeMirror.fromTextArea(
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
    console.log('Call to init window.CodeEditor took ' + (t1 - t0) + ' milliseconds.');

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

    function listTreeViewOf(dir, tree) {
        var entries = fs.readdirSync(dir);

        for (var i = 0; i < entries.length; i++) {
            var file = entries[i];

            var path = dir + '/' + file;
            var stat = fs.statSync(path);

            var path_span = $('<span/>').addClass('hidden').text(path);
            var span = $('<span/>').text(file);

            if (stat && stat.isDirectory()) {
                var files = fs.readdirSync(path);

                span.addClass('folder');

                if (files.length !== 0) {
                    var ul = $('<ul/>').hide();

                    $('<li/>').append(span).append(path_span).append(ul).appendTo(tree);
                    listTreeViewOf(path, ul);
                } else {
                    $('<li/>').append(span).append(path_span).appendTo(tree);
                }
            } else {
                span.addClass('file');
                $('<li/>').append(span).append(path_span).appendTo(tree);
            }
        }
    }

    (function init() {
        var data = fs.readFileSync(Settings.File, 'utf-8');
        var obj = JSON.parse(data);

        if (obj.open_files.length !== 0) {
            for (var i = 0; i < obj.open_files.length; i++) {
                addToOpenFiles(obj.open_files[i]);
            }

            var fileName = obj.open_files.pop();
            edit(fileName);
        }

        var ti0 = performance.now();

        var tree = $('#treeview');
        listTreeViewOf(__dirname, tree);
        tree.treeview();

        var ti1 = performance.now();
        console.log('Call to load treeview took ' + (ti1 - ti0) + ' milliseconds.');

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

        window.CodeEditor.setOption('mode', obj.mode);
        window.CodeEditor.setOption('theme', obj.theme);
    })();

    $('#treeview').on('click', 'li', function() {
        var path = $(this).find('.hidden').text();
        if (path.length !== 0) {
            openFile(path);
        }
    });

    $('#open-files').on('click', 'li', function() {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        var fileName = $(this).find('.hidden').text();
        edit(fileName);
    });

    function closeTab(event) {
        var parent = $(event.toElement).parent('li');

        var fileName = parent.find('.hidden').text();
        var index = window.OpenFiles.indexOf(fileName);

        parent.removeClass('active');

        var newOpen = parent.prev();
        if (!newOpen)
            newOpen = parent.next();

        if (newOpen) {
            newOpen.addClass('active');

            var newFile = newOpen.find('.hidden').text();
            if (newFile) {
                edit(newFile);
            }
        }

        if (index !== -1) {
            window.OpenFiles.splice(index, 1);
            parent.remove();

            if (window.OpenFiles.length === 0) {
                window.CodeEditor.setValue('');
            }
        }
    }

    function addToOpenFiles(fileName) {
        var index = window.OpenFiles.indexOf(fileName);
        if (index !== -1) {
            return false;
        }

        window.OpenFiles.push(fileName);

        var name = fileName.split('/').pop();

        var of = $('#open-files');
        of.children().removeClass('active');

        var span = $('<span>').text(fileName).addClass('hidden');
        var close = $('<span>').addClass('close').click(closeTab);

        var li = $('<li/>').text(name).addClass('active').append(span).append(close);
        of.append(li);
    }

    function edit(fileName) {
        $('#fileName').val(fileName);

        var data = fs.readFileSync(fileName, 'utf-8');
        window.CodeEditor.setValue(data);
    }

    function openFile(fileName) {
        if (fileName == $('#fileName').val())
            return false;

        edit(fileName);
        addToOpenFiles(fileName);
    }

    function openFiles(files) {
        if (files.length !== 0) {
            for (var i = 0; i < files.length; i++) {
                openFile(files[i]);
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

                openFiles(fileNames);

                return false;
            }
        );
    }

    function saveFile(files) {
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
    }

    $('#theme').change(function() {
        var theme = $(this).find('option:selected').val();
        window.CodeEditor.setOption('theme', theme);

        return false;
    });

    $('#mode').change(function() {
        var mode = $(this).find('option:selected').val();
        window.CodeEditor.setOption('mode', mode);

        return false;
    });

    var t2 = performance.now();
    console.log('Call to load everything left took ' + (t2 - t1) + ' milliseconds.');
});

$(window).unload(function() {
    var t0 = performance.now();

    var settings = {
        'open_files': window.OpenFiles,
        'theme': $('#theme').find('option:selected').val(),
        'mode': $('#mode').find('option:selected').val(),
    };

    var json = JSON.stringify(settings, null, 4);
    fs.writeFileSync(Settings.File, json, 'utf-8');

    var t1 = performance.now();
    console.log('Call to unload took ' + (t1 - t0) + ' milliseconds.');
});
