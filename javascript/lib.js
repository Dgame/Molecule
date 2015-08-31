var start = window.performance.now();

$(function() {
    $('#tabs').w2tabs({
        name: 'tabs',
        active: 'tab1',
        tabs: [{
            id: 'tab1',
            caption: 'Untitled',
            closable: true
        }],
        onClick: function(event) {
            window.Tab.Exchange(event);
        },
        onClose: function(event) {
            window.Tab.Close(event);
        }
    });

    $('#layout').w2layout({
        name: 'layout',
        panels: [
            {
                type: 'left',
                size: 200,
                resizable: true,
                style: 'background-color: #F5F6F7;',
                content: 'left'
            },
            {
                type: 'main',
                style: 'background-color: #F5F6F7; padding: 5px;'
            }
        ]
    });

    $('#cmd').keypress(function(event) {
        if (event.which === 13) {
            event.preventDefault();
            alert($(this).val());
            $(this).hide();
        }
    });

    var sidebarNr = 0;

    function readDirectory(folder) {
        var entries = window.FS.readdirSync(folder);
        var len = entries.length;

        var nodes = new Array(len);

        for (var i = 0; i < len; i++) {
            var file = entries[i];
            var path = folder + '/' + file;

            var obj = {
                text: file,
                path: path,
                img: 'icon-page'
            };

            var stat = window.FS.statSync(path);

            if (stat && stat.isDirectory()) {
                if (file.split('/').pop()[0] === '.') {
                    continue;
                }

                obj.id = 'Folder-' + sidebarNr;
                obj.img = 'icon-folder';

                sidebarNr += 1;

                obj.nodes = readDirectory(path);
            } else {
                obj.id = 'File-' + sidebarNr;
                obj.img = 'icon-page';
            }

            sidebarNr += 1;

            nodes[i] = obj;
        }

        return nodes;
    }

    w2ui.layout.content('left', $().w2sidebar({
        name: 'sidebar',
        img: null,
        nodes: readDirectory(__dirname),
        onClick: function(event) {
            window.Tab.Open(event);
        }
    }));
});

var end = window.performance.now();
console.log('lib took ' + (end - start) + ' ms');
