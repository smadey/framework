// alert 组件
!(function (window, document) {
    var framework = window.framework;

    framework.alert = {
        _elem: null,
        callback: null,
        getElem: function () {
            var self = this;

            if (self._elem) {
                return self._elem;
            }

            var elem = document.createElement('div');
            elem.className = 'framework-alert framework-backdrop';

            var dialog = document.createElement('div');
            dialog.className = 'framework-dialog';

            var body = document.createElement('div');
            body.className = 'framework-dialog-body';

            var content = document.createElement('p');
            content.className = 'framework-dialog-content';

            var footer = document.createElement('div');
            footer.className = 'framework-dialog-footer';

            var btnOK = document.createElement('button');
            btnOK.className = 'framework-dialog-button clickable';
            btnOK.innerText = '确定';

            body.appendChild(content);
            dialog.appendChild(body);

            footer.appendChild(btnOK);
            dialog.appendChild(footer);

            elem.appendChild(dialog);
            document.body.appendChild(elem);

            self._elem = elem;

            return elem;
        },
        show: function (text, callback) {
            if (!text) {
                return;
            }

            var self = this;

            var elem = self.getElem();
            elem.style.display = '';
            elem.style.opacity = 0;

            var content = elem.querySelector('.framework-dialog-content');
            content.innerHTML = text;

            var btnOK = elem.querySelector('.framework-dialog-button');
            btnOK.addEventListener('click', self.hide.bind(self), false);

            self.callback = callback;

            window.requestAnimationFrame(function () {
                elem.style.opacity = 1;
            });

            document.addEventListener('touchmove', preventDefault, false);
        },
        hide: function (delay) {
            var self = this;

            if (delay > 0) {
                setTimeout(hide, +delay);
            }
            else {
                window.requestAnimationFrame(hide);
            }

            function hide() {
                var elem = self.getElem();
                elem.style.display = 'none';
                elem.style.opacity = 0;

                var btnOK = elem.querySelector('.framework-dialog-button');
                btnOK.removeEventListener('click', self.hide);

                if (typeof self.callback === 'function') {
                    self.callback();
                    self.callback = null;
                }

                document.removeEventListener('touchmove', preventDefault, false);
            }
        }
    };

    function preventDefault(e) {
        e.preventDefault();
    }

})(window, document);
