function Tab() {
    this._openTabs = [];

    this.GenID = function(tid) {
        return 'tab' + tid;
    };

    this.Open = function(fileName) {
        var index = this._openTabs.indexOf(fileName);
        if (index !== -1) {
            this.Activate(index + 1);
            return false;
        }

        if (this._openTabs.length !== 0) {
            var tab_id = this.GenID(this._openTabs.length + 1);
            var tab = {id: tab_id, caption: fileName, closable: true};

            w2ui.tabs.add(tab);
            w2ui.tabs.click(tab_id);
        } else {
            w2ui.tabs.tabs[0].caption = fileName;
            w2ui.tabs.refresh();
        }

        this._openTabs.push(fileName);

        /// since no exchange is called, we have to do it manually
        if (this._openTabs.length === 1) {
            window.File.Edit(fileName);
        }
    };

    this.Close = function(fileName) {
        var index = this._openTabs.indexOf(fileName);
        if (index !== -1) {
            this._openTabs.splice(index, 1);
            if (this._openTabs.length !== 0) {
                if (window.File.IsCurrent(fileName)) {
                    this.Activate(this._openTabs.length);
                }
            } else {
                this.Open('Untitled');
            }
        }
    };

    this.Activate = function(tid) {
        var tab_id = this.GenID(tid);
        w2ui.tabs.click(tab_id);
    };

    this.Exchange = function(fileName) {
        window.File.Edit(fileName);
    };
}
