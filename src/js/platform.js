// 给body增加"platform-*"样式、修复iOS中iframe的bug
!(function (window, document) {

    document.addEventListener('DOMContentLoaded', onReady, false);

    function onReady() {
        var body = document.body;

        var params = getQueryParams();

        var IS_IN_APP = !!params.inapp;

        if (IS_IN_APP) {
            window.sessionStorage.setItem('IN_APP', IS_IN_APP);
        }
        else {
            IS_IN_APP = !!window.sessionStorage.getItem('IN_APP');
        }

        if (IS_IN_APP) {
            body.classList.add('platform-inapp');

            var width = params._width;
            var height = params._height;

            if (width > 0 && height > 0) {
                window.sessionStorage.setItem('APP_INNER_WIDTH', width);
                window.sessionStorage.setItem('APP_INNER_HEIGHT', height);
            }
            else {
                width = window.sessionStorage.getItem('APP_INNER_WIDTH');
                height = window.sessionStorage.getItem('APP_INNER_HEIGHT');
            }

            if (width > 0 || height > 0) {
                var div = document.createElement('div');
                // div.style.webkitOverflowScrolling = 'touch';

                if (width > 0) {
                    div.style.width = width + 'px';
                    div.style.overflowX = 'hidden';
                }

                if (height > 0) {
                    div.style.height = height + 'px';
                    div.style.overflowY = 'scroll';
                }

                while (body.firstChild) {
                    div.appendChild(body.firstChild);
                }

                body.appendChild(div);
            }
        }
        else {
            body.classList.add('platform-browser');
        }

        document.removeEventListener('DOMContentLoaded', onReady);
    }

    function getQueryParams() {
        var params = {};
        var queryString = window.location.search.replace(/^\?/, '').split('&');
        var param;

        queryString.forEach(function (d, i) {
            if (d) {
                param = d.split('=');

                try {
                    params[param[0]] = decodeURIComponent(param[1]);
                }
                catch (ex) {
                    params[param[0]] = param[1];
                }
            }
        });

        return params;
    }

})(window, document);
