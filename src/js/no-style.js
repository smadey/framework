// 向下兼容，检查对css3的兼容性：为不支持的样式增加'no-style'
!(function (window, document) {
    var framework = window.framework;

    // 实现requestAnimationFrame
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (fn) {
            window.setTimeout(fn, 0);
        };
    }

    // 监测css3
    var style;
    var csses = ['flex-wrap'];

    framework.checkStyle = checkStyle;

    document.addEventListener('DOMContentLoaded', onReady, false);

    function checkStyle(name) {
        if (typeof style[toCamelCase(name)] === 'undefined') {
            document.querySelector('html').classList.add('no-' + name);
        }
    }

    function onReady() {
        style = document.createElement('div').style;
        csses.forEach(checkStyle);
        style = null;

        document.removeEventListener('DOMContentLoaded', onReady);
    }

    function toCamelCase(name) {
        return name.split('-').map(function (d, i) {
            if (!i) {
                return d;
            }
            return d.slice(0, 1).toUpperCase() + d.slice(1);
        }).join('');
    }

})(window, document);
