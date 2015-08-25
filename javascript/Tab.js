module.exports = {
    Tab: function() {
        var self = this;

        this.switchTo = function(elem) {
            $('#open-files').children().removeClass('active');
            elem.addClass('active');

            var fileName = elem.find('.hidden').text();
            window.File.edit(fileName);
        };

        this.closeTab = function(event) {
            var tab = $(event.toElement).parent('li');
            var fileName = tab.find('.hidden').text();

            tab.remove();

            var index = window.OpenFiles.indexOf(fileName);
            if (index !== -1) {
                window.OpenFiles.splice(index, 1);
                if (window.OpenFiles.length === 0) {
                    window.CodeEditor.setValue('');
                } else {
                    var next_tab = $('#open-files').find('li');
                    self.switchTo(next_tab);
                }
            }
        };

        this.openTab = function(fileName) {
            var index = window.OpenFiles.indexOf(fileName);
            if (index !== -1) {
                return false;
            }

            window.OpenFiles.push(fileName);

            var name = fileName.split('/').pop();

            var of = $('#open-files');
            of.children().removeClass('active');

            var span = $('<span>').text(fileName).addClass('hidden');
            var close = $('<span>').addClass('close').click(self.closeTab);

            var li = $('<li/>').text(name).addClass('active').append(span).append(close);
            of.append(li);
        };
    }
};
