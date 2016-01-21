// 为可点击元素添加"activated"样式
!(function (window, document) {

    var ACTIVATED_CLASS = 'activated';
    var ACTIVATED_SELECTOR = '.clickable';

    document.addEventListener('touchstart', activateElements, false);
    document.addEventListener('touchmove', deactivateElements, false);
    document.addEventListener('touchend', deactivateElements, false);

    function activateElements(evt) {
        var cur = evt.target;

        if (!cur.nodeType) {
            return;
        }

        for (; cur !== this; cur = cur.parentNode || this) {
            if (cur.nodeType === 1 && cur.disabled !== true) {
                var elems = this.querySelectorAll(ACTIVATED_SELECTOR);

                for (var i = 0, n = elems.length; i < n; i++) {
                    if (elems[i] === cur) {
                        elems[i].classList.add(ACTIVATED_CLASS);
                        break;
                    }
                }
            }
        }
    }

    function deactivateElements(evt) {
        var cur = evt.target;

        if (!cur.nodeType) {
            return;
        }

        for (; cur !== this; cur = cur.parentNode || this) {
            if (cur.nodeType === 1 && cur.disabled !== true) {
                cur.classList.remove(ACTIVATED_CLASS);
            }
        }
    }

})(window, document);
