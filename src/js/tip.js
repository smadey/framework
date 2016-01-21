// tip 组件
!(function (window, document) {
    var framework = window.framework;

    framework.tip = {
        _elem: null,
        getElem: function () {
            var self = this;

            if (self._elem) {
                return self._elem;
            }

            var elem = document.createElement('div');
            elem.className = 'framework-tip framework-backdrop';

            var toast = document.createElement('p');
            toast.className = 'framework-toast';

            elem.appendChild(toast);
            document.body.appendChild(elem);

            self._elem = elem;

            return elem;
        },
        show: function (text, duration, callback) {
            if (!text) {
                return;
            }

            if (typeof duration === 'function') {
                callback = duration;
                duration = null;
            }

            var self = this;

            var elem = self.getElem();
            elem.style.opacity = 0;
            elem.style.display = '';

            var toast = elem.querySelector('p');
            toast.innerHTML = text;

            self.callback = callback;

            requestAnimationFrame(function () {
                elem.style.opacity = 1;
                self.hide(duration || 1500);
            });

            elem.addEventListener('touchstart', self.hide.bind(self), false);
        },
        hide: function (delay) {
            var self = this;

            if (delay > 0) {
                setTimeout(hide, +delay);
            }
            else {
                requestAnimationFrame(hide);
            }

            function hide() {
                var elem = self.getElem();
                elem.style.display = 'none';
                elem.style.opacity = 0;

                if (typeof self.callback === 'function') {
                    self.callback();
                    self.callback = null;
                }

                elem.removeEventListener('touchmove', self.hide, false);
            }
        }
    };

    function preventDefault(e) {
        e.preventDefault();
    }

})(window, document);
