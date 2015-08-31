var start = window.performance.now();

var remote = require('remote');

window.Dialog = remote.require('dialog');
window.FS = require('fs');

window.$ = window.jQuery = require(__dirname + '/javascript/jquery/jquery-2.1.4.min.js');

window.File = new File();
window.Tab = new Tab();

window.Editor = ace.edit('editor');
window.Editor.setTheme('ace/theme/chrome');
window.Editor.getSession().setMode('ace/mode/text');
window.Editor.$blockScrolling = Infinity;

window.Editor.commands.addCommand({
    name: 'save',
    bindKey: {
        win: 'Ctrl-S'
    },
    exec: function(editor) {
        window.File.Save(editor);
    }
});

window.Editor.commands.addCommand({
    name: 'cmd',
    bindKey: {
        win: 'Ctrl-P'
    },
    exec: function(editor) {
        var cmd = $('#cmd');
        cmd.show();
        cmd.focus();
    }
});

var end = window.performance.now();
console.log('Init took ' + (end - start) + ' ms');
