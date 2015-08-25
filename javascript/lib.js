var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

window.$ = window.jQuery = require(__dirname + '/jquery/jquery-2.1.4.min.js');
window.OpenFiles = [];

require(__dirname + '/jquery/treeview/jquery.treeview.js');

var my_s = require(__dirname + '/javascript/Settings.js');
var my_edit = require(__dirname + '/javascript/File.js');
var my_tab = require(__dirname + '/javascript/Tab.js');

$(document).ready(function() {
    var t0 = performance.now();

    window.Settings = new my_s.Settings('json/settings.json');
    window.File = new my_edit.File();
    window.Tab = new my_tab.Tab();

    window.CodeEditor = CodeMirror.fromTextArea(
        document.getElementById('editor'), {
            placeholder: 'Code goes here...',
            viewportMargin: Infinity,
            rulers: [{
                color: Settings.Values.RulerColor,
                column: Settings.Values.LineLength,
                lineStyle: 'dashed'
            }],
            showTrailingSpace: window.Settings.Values.ShowTrailingSpace,
            lineNumbers: window.Settings.Values.ShowLineNumbers,
            styleActiveLine: window.Settings.Values.StyleActiveLine,
            autoCloseBrackets: window.Settings.Values.AutoCloseBrackets,
            matchBrackets: window.Settings.Values.MatchBrackets,
            lineWrapping: window.Settings.Values.LineWrapping,
            indentUnit: window.Settings.Values.IndentUnit,
            smartIndent: window.Settings.Values.SmartIndent,
            tabSize: window.Settings.Values.TabSize,
            indentWithTabs: window.Settings.Values.IndentWithTabs,
            autofocus: window.Settings.Values.AutoFocus,
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
                'Ctrl-S': window.File.saveFile
            },
            globalVars: true
        }
    );

    window.CodeEditor.on('inputRead', function() {
        window.File.setState(window.File.State.UnSaved);
    });

    function handleCommand(commands) {
        var cmds = commands.split(' ');
        if (cmds.length < 1)
            return false;

        var cmd = cmds.shift();
        switch (cmd) {
            case 'open':
                return window.File.openFiles(cmds);
            case 'save':
                return window.File.saveFile(cmds);
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

    $('#treeview').on('click', 'li', function() {
        var path = $(this).find('.hidden').text();
        if (path.length !== 0) {
            window.File.openFile(path);
        }
    });

    $('#open-files').on('click', 'li', function() {
        window.Tab.switchTo($(this));
    });

    (function init() {
        var data = fs.readFileSync(Settings.File, 'utf-8');
        var obj = JSON.parse(data);

        if (obj.open_files.length !== 0) {
            window.Tab.openTabs(obj.open_files);

            var fileName = obj.open_files.pop();
            window.File.edit(fileName);
        }

        var tree = $('#treeview');
        listTreeViewOf(__dirname, tree);
        tree.treeview();

        $('#theme').prop('selected', false).val(obj.theme).prop('selected', true);

        window.CodeEditor.setOption('theme', obj.theme);
    })();

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

    var t1 = performance.now();
    console.log('Call to load everything took ' + (t1 - t0) + ' milliseconds.');
});

$(window).unload(function() {
    var settings = {
        'open_files': window.OpenFiles,
        'theme': $('#theme').find('option:selected').val()
    };

    var json = JSON.stringify(settings, null, 4);
    fs.writeFileSync(window.Settings.File, json, 'utf-8');
});
