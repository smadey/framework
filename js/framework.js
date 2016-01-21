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

!(function (window) {
    if (!window.framework) {
        window.framework = {};
    }
})(window);

// component: img loader
!(function (window, $) {
    if (!($ && $.fn)) {
        return;
    }

    var framework = window.framework;

    var lastestSrc;
    var timer;

    function clearTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    var defaults = {
        SERVER_URL: ''
    };

    var ImgLoader = framework.ImgLoader = function (container, options) {
        var self = this;

        self.$ = $(container);

        self.options = $.extend(true, {}, defaults, options);

        self.init();

        return self;
    };

    ImgLoader.prototype = {
        init: function () {
            var self = this;

            self.lastestSrc = null;

            self.$.addClass('img-container');

            if (typeof self.$.attr('avatar') !== 'undefined') {
                self.$.addClass('img-avatar');
                self.avatar = true;
            }

            if (typeof self.$.attr('adaptive') !== 'undefined') {
                self.$.addClass('img-adaptive');
                self.adaptive = true;
            }

            if (self.$.attr('img-src')) {
                self.src = $.trim(self.$.attr('img-src'));
                self.load();
            }
        },

        isSrcChanged: function () {
            return this.lastestSrc !== this.src;
        },

        load: function () {
            var self = this;
            var src = self.src;

            clearTimer();

            if (!src) {
                // 5秒后显示图片加载失败
                timer = setTimeout(function () {
                    self.$.removeClass('img-loading img-loaded').addClass('img-error');
                }, 5000);
                return;
            }

            if (typeof src === 'string' && src[0] === '/') {
                src = self.options.SERVER_URL + src;
            }

            self.$.html('').removeClass('img-loaded img-error').addClass('img-loading');

            var $img = $('<div />').addClass('img').css('opacity', 0).appendTo(self.$);

            var img = document.createElement('img');
            img.src = src;
            img.onload = onLoad;
            img.onerror = onError;

            function clear() {
                $img = null;
                img = null;
            }

            function onError() {
                if (self.isSrcChanged()) {
                    self.$.removeClass('img-loading');
                    self.$.addClass('img-error');
                    $img.remove();
                }

                clear();
            }

            function onLoad() {
                if (self.isSrcChanged()) {
                    self.$.removeClass('img-loading');
                    self.$.addClass('img-loaded');

                    if (self.adaptive) {
                        self.$.append(img);
                        $img.remove();
                    }
                    else {
                        $img.css({'background-image': 'url(' + src + ')', opacity: 1});
                    }
                    self.lastestSrc = self.src;
                }

                clear();
            }
        }
    };

    $.fn.imgLoader = function (options) {
        var firstInstance;

        this.each(function () {
            var inst = new ImgLoader(this, options);

            if (!firstInstance) {
                firstInstance = inst;
            }
        });

        return firstInstance;
    };

    $.fn.imgLoader.defaults = defaults;
}(window, window.$));

// component: list container
!(function (window, $) {
    if (!($ && $.fn)) {
        return;
    }

    var framework = window.framework;

    var PHASES = {
        LOADING: 'loading',
        NO_DATA: 'nodata',
        LOADED: 'loaded',
    };

    var defaults = {
        data: null,
        phase: null,

        loading: false,
        error: null,

        pagination: {offset: 0, limit: 10, total: 0, page: 1},
        opposite: false,
        lastupdatetime: '',

        scrollSelector: 'body',
        distance: '2.5%',

        getPromise: null,
        onPromiseSuccess: null,
    };

    var List = framework.List = function (container, options) {
        var self = this;

        $.extend(self, defaults, options);

        self.$ = $(container);
        self.$scoller = self.scrollSelector ? $(self.scrollSelector) : self.$.parent();

        self.init();
    };

    List.prototype = {
        init: init,
        loadFromServer: loadFromServer,
        loadMore: loadMore,
        refresh: refresh,
        isNoData: isNoData,
        isValidResult: isValidResult,
        isSafePosition: isSafePosition,
        promiseSuccess: promiseSuccess,
        add: add,
        remove: remove
    };

    function init() {
        var self = this;

        if (self.pagination) {
            $(window).on('scroll', function () {
                if (self.hasMoreData && !self.isSafePosition()) {
                    self.loadMore();
                }
            });
        }
    }

    function isSafePosition() {
        var self = this;

        var maxScrollTop = self.$.outerHeight() + self.$.offset().top - window.innerHeight;
        var curScrollTop = self.$scoller.scrollTop();

        var remainScrollTop = maxScrollTop - curScrollTop;

        var isPercent = self.distance.indexOf('%') !== -1;
        var distance = isPercent ? maxScrollTop * parseFloat(self.distance) / 100 : parseFloat(self.distance);

        return isPercent ?
            (remainScrollTop / maxScrollTop > parseFloat(self.distance) / 100) :
            (remainScrollTop > parseFloat(self.distance));
    }

    function add(item) {
        var self = this;

        if ($.isArray(self.data)) {
            self.data.push(item);

            if (self.pagination) {
                self.pagination.total++;
            }
        }
    }

    function loadFromServer() {
        var self = this;

        if (!self.phase) {
            self.phase = PHASES.LOADING;
        }

        self.error = null;
        self.loading = true;

        var params;

        if (self.pagination) {
            params = {
                offset: self.pagination.offset,
                limit: self.pagination.limit,
                page: self.pagination.page,
            };

            if (self.pagination.offset > 0 && self.lastupdatetime) {
                params.lastupdatetime = self.lastupdatetime;
            }
        }

        var promise = self.getPromise(params);

        promise.then(onSuccess, onError);

        return promise;

        function onSuccess(result) {
            self.promiseSuccess(result);
            onFinally();
        }

        function onError(error) {
            self.error = error;
            onFinally();
        }

        function onFinally() {
            self.phase = self.isNoData() ? PHASES.NO_DATA : PHASES.LOADED;

            self.loading = false;
        }
    }

    function loadMore() {
        var self = this;

        if (self.loading || !self.pagination) {
            return $.Deferred().resolve();
        }

        self.pagination.offset += self.pagination.limit;
        self.pagination.page++;

        return self.loadFromServer();
    }

    function isNoData() {
        var self = this;
        return $.isArray(self.data) ? !self.data.length : !self.data;
    }

    function isValidResult(result) {
        var self = this;

        if (self.pagination) {
            return result && $.isArray(result.list);
        }

        return true;
    }

    function promiseSuccess(result) {
        var self = this;

        if (!self.isValidResult(result)) {
            return;
        }

        if (!self.pagination) {
            self.data = result;
        }
        else {
            self.pagination.total = result.total;

            if (self.pagination.offset === 0) {
                self.lastupdatetime = result.lastupdatetime;

                if (self.opposite) {
                    self.data = result.list.reverse();
                }
                else {
                    self.data = result.list;
                }
            }
            else {
                if (self.opposite) {
                    self.data = result.list.reverse().concat(self.data);
                }
                else {
                    self.data = self.data.concat(result.list);
                }
            }

            self.hasMoreData = result.list.length > 0 && self.pagination.total > self.data.length;
        }

        if ($.isFunction(self.onPromiseSuccess)) {
            self.onPromiseSuccess(result);
        }
    }

    function remove(item) {
        var self = this;

        if ($.isArray(self.data) && self.data.indexOf(item) > -1) {
            self.data.splice(self.data.indexOf(item), 1);

            if (self.pagination) {
                self.pagination.total--;
            }

            if (self.isNoData()) {
                self.phase = PHASES.NO_DATA;
            }
        }
    }

    function refresh() {
        var self = this;

        if (self.loading) {
            return $.Deferred().resolve();
        }

        if (self.pagination) {
            self.pagination.offset = 0;
            self.pagination.page = 1;
        }

        return self.loadFromServer();
    }

    $.fn.list = function (options) {
        var firstInstance;

        this.each(function () {
            var inst = new List(this, options);

            if (!firstInstance) {
                firstInstance = inst;
            }
        });

        return firstInstance;
    };

    $.fn.list.defaults = defaults;
})(window, window.$);

// 为$.fn添加 transform transtion transitionEnd方法
!(function (window, $) {
    if (!($ && $.fn)) {
        return;
    }

    if (!('transform' in $.fn)) {
        $.fn.transform = function (transform) {
            for (var i = 0, n = this.length; i < n; i++) {
                var elStyle = this[i].style;

                elStyle.webkitTransform =
                    elStyle.MsTransform =
                    elStyle.msTransform =
                    elStyle.MozTransform =
                    elStyle.OTransform =
                    elStyle.transform = transform;
            }
            return this;
        };
    }

    if (!('transition' in $.fn)) {
        $.fn.transition = function (duration) {
            if (typeof duration !== 'string') {
                duration = duration + 'ms';
            }

            for (var i = 0, n = this.length; i < n; i++) {
                var elStyle = this[i].style;

                elStyle.webkitTransitionDuration =
                    elStyle.MsTransitionDuration =
                    elStyle.msTransitionDuration =
                    elStyle.MozTransitionDuration =
                    elStyle.OTransitionDuration =
                    elStyle.transitionDuration = duration;
            }

            return this;
        };
    }

    if (!('transitionEnd' in $.fn)) {
        $.fn.transitionEnd = function (callback) {
            var $this = this;

            var events = ['webkitTransitionEnd', 'transitionend',
                'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];

            var i;
            var n;

            if (typeof callback === 'function') {
                for (i = 0, n = events.length; i < n; i++) {
                    $this.on(events[i], fireCallBack);
                }
            }

            return this;

            function fireCallBack(evt) {
                if (evt.target !== this) {
                    return;
                }

                callback.call(this, evt);

                for (i = 0, n = events.length; i < n; i++) {
                    $this.off(events[i], fireCallBack);
                }
            }
        };
    }
})(window, window.$);

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
