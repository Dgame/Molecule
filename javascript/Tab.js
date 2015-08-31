function Tab() {
    this.IsOpen = function(fileName) {
        var len = w2ui.tabs.tabs.length;
        for (var i = 0; i < len; i++) {
            var tab = w2ui.tabs.tabs[i];
            if (tab.caption == fileName) {
                return tab;
            }
        }

        return null;
    };

    this.Open = function(event) {
        console.log('open ' + event.object.path);

        if (!window.File.IsFile(event.object.path)) {
            return false;
        }

        var fileName = event.object.text;
        var tab = this.IsOpen(fileName);

        if (tab !== null) {
            w2ui.tabs.click(tab.id);

            return false;
        }

        tab = this.IsOpen('Untitled');

        if (tab === null) {
            var len = w2ui.tabs.tabs.length;
            tab = {
                id: 'tab' + (len + 1),
                caption: fileName,
                path: event.object.path,
                closable: true
            };

            w2ui.tabs.add(tab);
            w2ui.tabs.click(tab.id);
        } else {
            tab.caption = fileName;
            tab.path = event.object.path;

            w2ui.tabs.refresh();

            window.File.Edit(event);
        }
    };

    this.Close = function(event) {
        var fileName = event.object.text;
        var tab = this.IsOpen(fileName);

        if (tab) {
            var len = w2ui.tabs.tabs.length;

            if (len === 1) {
                event.preventDefault();

                tab.caption = 'Untitled';
                w2ui.tabs.refresh();

                window.Editor.setValue('');

                return false;
            } else if (w2ui.tabs.active == tab.id) {
                var next_tab = this.FindAfter(tab);
                if (next_tab) {
                    w2ui.tabs.click(next_tab.id);
                }
            }
        }
    };

    this.FindAfter = function(after_tab) {
        var len = w2ui.tabs.tabs.length;
        if (len === 0) {
            console.log('Nothing there');
            return null;
        }

        for (var i = 0; i < len; i++) {
            if (w2ui.tabs.tabs[i] == after_tab) {
                if ((i + 1) < len) {
                    console.log('After');
                    return w2ui.tabs.tabs[i + 1];
                } else if (i > 0) {
                    console.log('Previous');
                    return w2ui.tabs.tabs[i - 1];
                } else {
                    console.log('Nothing before/after');
                    return null;
                }
            }
        }

        console.log('Nothing found');

        return w2ui.tabs.tabs[0];
    };

    this.Exchange = function(event) {
        window.File.Edit(event);
    };
}
