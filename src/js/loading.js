// loading 组件
!(function (window, document) {
    var framework = window.framework;

    framework.loading = {
        _elem: null,
        getElem: function () {
            var self = this;

            if (self._elem) {
                return self._elem;
            }

            var elem = document.createElement('div');
            elem.className = 'framework-loading framework-backdrop';

            var spinning = document.createElement('div');
            spinning.className = 'framework-spinning';

            elem.appendChild(spinning);
            document.body.appendChild(elem);

            self._elem = elem;

            return elem;
        },
        show: function () {
            var self = this;

            var elem = self.getElem();
            elem.style.display = '';
            elem.style.opacity = 0;

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

                document.removeEventListener('touchmove', preventDefault, false);
            }
        }
    };

    function preventDefault(e) {
        e.preventDefault();
    }

})(window, document);
