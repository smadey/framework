// core.js
!(function (window) {
    if (!window.framework || !window.aid) {
        window.framework = window.aid = {};
    }
})(window);

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

// component: img loader
!(function (window, $, undefined) {
    if (!($ && $.fn)) {
        return;
    }

    var lastestSrc;
    var timer;

    function clearTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    var defaults = {
        SERVER_URL: '',
        afterAdaptive: undefined
    };

    var ImgLoader = function (container, options) {
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

            if ($.fn.imgZoomable) {
                self.$.on('click', 'img,.img', function () {
                    $(this).imgZoomable();
                });
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
                        var oldSize, newSize;

                        oldSize = {
                            w: self.$.width(),
                            h: self.$.height()
                        };

                        self.$.append(img);
                        $img.remove();

                        newSize = {
                            w: self.$.width(),
                            h: self.$.height()
                        };

                        if ($.isFunction(self.options.afterAdaptive)) {
                            self.options.afterAdaptive(newSize, oldSize);
                        }
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

// component: img zoomable
!(function (window, $, PinchZoom, undefined) {
    if (!($ && $.fn && PinchZoom)) {
        return;
    }

    var defaults = {
        scrollSelector: 'body',
    };

    var $backdrop;

    var ImgZoomable = function (container, options) {
        var self = this;

        self.options = $.extend(true, {}, defaults, options);

        self.$ = $(container);
        self.$scoller = self.$.parents(self.options.scrollSelector);

        if (!$backdrop) {
            $backdrop = $('<div />').addClass('img-zoomable-backdrop').appendTo('body');
        }

        self.init();

        return self;
    };

    ImgZoomable.prototype = {
        init: function () {
            var self = this;

            self.$scoller.addClass('modal-open');
            self.$scoller.on('touchmove', preventDefault);
            $backdrop.html('').css({display: 'block', 'background-color': 'transparent'});

            var $pinch = $('<div />').appendTo($backdrop);
            var $img = $('<img />').appendTo($pinch);

            var originalCss = {
                width: self.$.width(),
                height: self.$.height(),
                top: self.$.offset().top - self.$scoller.scrollTop(),
                left: self.$.offset().left - self.$scoller.scrollLeft()
            };

            $img.attr('src', self.getSrc()).css(originalCss);

            window.requestAnimationFrame(function () {
                var wRatio = $backdrop.width() / originalCss.width;
                var hRatio = $backdrop.height() / originalCss.height;

                var ratio = Math.min(wRatio, hRatio);

                $backdrop.transition(500).css('background-color', '');

                $img.transition(500).css({
                    width: originalCss.width * ratio,
                    height: originalCss.height * ratio,
                    top: ($backdrop.height() - originalCss.height * ratio) / 2,
                    left: ($backdrop.width() - originalCss.width * ratio) / 2,
                }).transitionEnd(function () {
                    var pinch = new PinchZoom($pinch);
                });

                $backdrop.on('click', function () {
                    self.$scoller.removeClass('modal-open');
                    self.$scoller.off('touchmove');
                    $backdrop.css('background-color', 'transparent');

                    $img.css(originalCss).transitionEnd(function () {
                        $backdrop.css({display: 'none', 'background-color': ''}).html('');
                    });
                });
            });
        },

        getSrc: function () {
            var self = this;

            if (self.$.is('img')) {
                return self.$.attr('src');
            }
            else if (/url\(.*\)/.test(self.$.css('backgroundImage'))) {
                return self.$.css('backgroundImage').replace(/url\((.*)\)/, '$1');
            }
            return '';
        }
    };

    $.fn.imgZoomable = function (options) {
        var firstInstance;

        this.each(function () {
            var inst = new ImgZoomable(this, options);

            if (!firstInstance) {
                firstInstance = inst;
            }
        });

        return firstInstance;
    };

    $.fn.imgZoomable.defaults = defaults;

    function preventDefault(e) {
        e.preventDefault();
    }
}(window, window.$, window.RTP && window.RTP.PinchZoom));

// component: input with counter
!(function (window, $, undefined) {
    if (!($ && $.fn)) {
        return;
    }

    var defaults = {
        maxLength: 120,
        local: false,
    };

    var InputWithCounter = function (container, options) {
        var self = this;

        self.$ = $(container);
        self.$parent = self.$.parent().addClass('input-with-counter');
        self.$counter = $('<span class="input-counter"></span>').appendTo(self.$parent);

        self.options = $.extend(true, {}, defaults, options);

        self.childrenLength = self.$.children().length;

        self.prevIndex = self.options.initialIndex;
        self.currIndex = self.options.initialIndex;

        self.init = function (options) {
            self.$counter.css({
                bottom: self.$parent.css('paddingBottom'),
                right: self.$parent.css('paddingRight'),
            });

            self.calcCounter();
            self.calcMaxLength();

            self._bindChange();
        };

        self.calcCounter = function () {
            self.$counter.text(self.getLength() + '/' + self.options.maxLength);
        };

        self._bindChange = function () {
            var timer;

            self.$.on('keydown, keyup', function (evt) {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(function () {
                    self.calcCounter();
                    self.calcMaxLength();
                }, 300);
            });
        };

        self.calcCounter = function () {
            var length;

            if (self.options.local) {
                length = self.getStrLocalLength(self.$.val());
                length = Math.ceil(length / 2);
            }
            else {
                length = self.$.val().length;
            }

            self.$counter.text(length + '/' + self.options.maxLength);
        };

        self.calcMaxLength = function () {
            var maxLength = self.options.maxLength;
            var value = self.$.val();

            if (self.options.local) {
                var localLength = self.getStrLocalLength(value);

                maxLength = maxLength * 2 - Math.min(localLength - value.length, maxLength);

                self.$.attr('maxlength', maxLength);
            }
            else if (parseInt(self.$.attr('maxlength')) !== maxLength) {
                self.$.attr('maxlength', maxLength);
            }

            if (value.length > maxLength) {
                self.$.val(value.slice(0, maxLength));
                self.calcCounter();
            }
        };

        self.init();

        return self;
    };

    InputWithCounter.prototype = {
        getStrLocalLength: function (str) {
            if (!str) {
                return 0;
            }

            var length = 0;

            for (var i = 0, n = str.length; i < n; i++) {
                if (/^[\u4e00-\u9fa5]+$/.test(str.charAt(i))) {
                    length += 2;
                }
                else {
                    length++;
                }
            }

            return length;
        }
    };

    $.fn.inputWithCounter = function (options) {
        var firstInstance;

        this.each(function () {
            var inst = new InputWithCounter(this, options);

            if (!firstInstance) {
                firstInstance = inst;
            }
        });

        return firstInstance;
    };

    $.fn.inputWithCounter.defaults = defaults;
})(window, window.$);

// component: list
!(function (window, $, template, undefined) {
    if (!($ && $.fn && template)) {
        return;
    }

    var defaults = {
        data: null,
        extra: null,

        loading: false,
        error: null,

        pagination: {offset: 0, limit: 10, total: 0, page: 1},
        opposite: false,
        lastupdatetime: '',

        scrollSelector: 'body',
        distance: '2.5%',

        template: null,
        getPromise: null,
        getRealtimePromise: null,
    };

    var List = function (container, options) {
        var self = this;

        $.extend(self, defaults, options);

        self.$ = $(container);
        self.$scoller = self.scrollSelector ? $(self.scrollSelector) : self.$.parent();

        self.init();
    };

    List.prototype = {
        addItem: addItem,
        loadFromServer: loadFromServer,
        loadFromServerRealtime: loadFromServerRealtime,
        loadMore: loadMore,
        init: init,
        isNoData: isNoData,
        isValidResult: isValidResult,
        isSafePosition: isSafePosition,
        refresh: refresh,
        removeItem: removeItem,
        render: render,
        scroll: scroll,
        scrollTo: scrollTo,
        scrollToBottom: scrollToBottom,
        scrollToTop: scrollToTop,
    };

    function addItem(item) {
        var self = this;

        if ($.isArray(self.data)) {
            if (self.pagination) {
                self.pagination.total++;
            }

            self.data.push(item);

            var html = template(self.template, {data: [item], extra: self.extra});
            self.$.append(html);
            self.scrollToBottom(300);
            self.afterRender();
        }
    }

    function loadFromServer() {
        var self = this;

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

        promise.then(onSuccess, onError).always(onAlways);

        return promise;

        function onAlways() {
            self.loading = false;
        }

        function onSuccess(result) {
            if (!self.isValidResult(result)) {
                return;
            }

            if (!self.pagination) {
                self.data = result;
                self.render();
            }
            else if (self.pagination.offset === 0) {
                var extra = {};

                $.each(result, function (key, value) {
                    if (['total', 'lastupdatetime', 'list'].indexOf(key) === -1) {
                        extra[key] = value;
                    }
                });

                self.extra = extra;
                self.data = self.opposite ? result.list.reverse() : result.list;

                self.pagination.total = result.total;
                self.lastupdatetime = result.lastupdatetime;
                self.hasMoreData = self.pagination.total > self.data.length;

                self.render();
            }
            else {
                var list = self.opposite ? result.list.reverse() : result.list;
                var html = template(self.template, {data: list, extra: self.extra});

                if (self.opposite) {
                    var oldHeight = self.$.height();
                    var oldScrollTop = self.$scoller.scrollTop();

                    self.data = list.concat(self.data);
                    self.$.prepend(html);

                    self.scrollTo(oldScrollTop + (self.$.height() - oldHeight));
                }
                else {
                    self.data = ($.isArray(self.data) ? self.data : []).concat(list);
                    self.$.append(html);
                }

                self.pagination.total = result.total;
                self.hasMoreData = result.list.length > 0 && self.pagination.total > self.data.length;

                self.afterRender();

            }
        }

        function onError(error) {
            self.error = error;
        }
    }

    function loadFromServerRealtime() {
        var self = this;
        var promise;

        if ($.isFunction(self.getRealtimePromise)) {
            promise = self.getRealtimePromise();
        }

        if (!promise || !promise.then) {
            return $.Deferred().reject();
        }

        promise.always(function () {
            self.loadFromServerRealtime();
        });

        promise.then(function (result) {
            self.addItem(result);
        });

        return promise;
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

    function isNoData() {
        var self = this;
        return $.isArray(self.data) ? !self.data.length : !self.data;
    }

    function isSafePosition() {
        var self = this;

        var maxScrollTop = self.$.outerHeight() + self.$.offset().top - window.innerHeight;
        var curScrollTop = self.$scoller.scrollTop();

        var isPercent = self.distance.indexOf('%') !== -1;
        var distance = isPercent ? maxScrollTop * parseFloat(self.distance) / 100 : parseFloat(self.distance);

        var remainScrollTop = self.opposite ? curScrollTop : (maxScrollTop - curScrollTop);

        return isPercent ?
            (remainScrollTop / maxScrollTop > parseFloat(self.distance) / 100) :
            (remainScrollTop > parseFloat(self.distance));
    }

    function isValidResult(result) {
        var self = this;

        if (self.pagination) {
            return result && $.isArray(result.list);
        }

        return true;
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

    function removeItem(item) {
        var self = this;
        var index = $.isArray(self.data) ? self.data.indexOf(item) : -1;

        if (index > -1) {
            self.data.splice(index, 1);

            if (self.pagination) {
                self.pagination.total--;
            }

            self.$.children().eq(index).remove();
        }
    }

    function render() {
        var self = this;

        var templateData = {data: self.data, extra: self.extra, $init: true};
        var templateHtml = template(self.template, templateData);

        self.$.html(templateHtml);

        if ($.isFunction(self.afterRender)) {
            self.afterRender();
        }

        if (self.opposite) {
            self.scrollToBottom();
        }
    }

    function scroll(height, duration) {
        this.scrollTo(this.$scoller.scrollTop() + height, duration);
    }

    function scrollTo(top, duration) {
        if (duration > 0) {
            this.$scoller.animate({scrollTop: top}, duration);
        }
        else {
            this.$scoller.scrollTop(top);
        }
    }

    function scrollToBottom(duration) {
        var self = this;
        var maxScrollTop = self.$.outerHeight() + self.$.offset().top - window.innerHeight;
        this.scrollTo(maxScrollTop, duration);
    }

    function scrollToTop(duration) {
        this.scrollTo(0, duration);
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
})(window, window.$, window.template);

// component: tab switchs
!(function (window, $, undefined) {
    if (!($ && $.fn)) {
        return;
    }

    var defaults = {
        headerSelector: '.tab-switchs-header',
        contentSelector: '.tab-switchs-content',
        positionClass: 'tab-switchs-position',
        initialIndex: location.hash.match(/tab\d/) ? parseInt(location.hash.match(/tab(\d)/)[1]) : 0,
        duration: 500,
        onChange: undefined,
        afterInit: undefined,
    };

    var TabSwitchs = function (container, options) {
        var self = this;

        self.$ = $(container);
        self.options = $.extend(true, {}, defaults, options);

        self.$header = self.$.find(self.options.headerSelector);
        self.$position = $('<div >').addClass(self.options.positionClass).insertAfter(self.$header);
        self.$content = self.$.find(self.options.contentSelector);

        self.tabsLength = self.$header.children().length;

        self.prevIndex = self.options.initialIndex;
        self.currIndex = self.options.initialIndex;

        self.init = function (options) {
            self.$header.on('click', 'button', function (evt) {
                var index = $(this).parent().index();
                self.switchTo(index);

                if (history.replaceState) {
                    history.replaceState(null, window.title, location.href.split('#')[0] + '#tab' + index);
                }
            });

            self.$position.width(100 / self.tabsLength + '%');

            self.$content.width(self.tabsLength * 100 + '%');
            self.$content.children().width(100 / self.tabsLength + '%');

            self.updateHeader();
            self.updatePosition();
            self.updateContent();

            if ($.isFunction(self.options.afterInit)) {
                self.options.afterInit.call(self);
            }
        };

        self.switchTo = function (index) {
            if (index === self.currIndex) {
                return;
            }

            self.prevIndex = self.currIndex;
            self.currIndex = index;

            self.updateHeader(self.options.duration);
            self.updatePosition(self.options.duration);
            self.updateContent(self.options.duration);

            if ($.isFunction(self.options.onChange)) {
                self.options.onChange.call(self, self.currIndex);
            }
        };

        self.updateHeader = function () {
            var $children = self.$header.children();

            $children.eq(self.prevIndex).removeClass('active');
            $children.eq(self.currIndex).addClass('active');
        };

        self.updatePosition = function (duration) {
            var translate = {marginLeft: 100 * self.currIndex / self.tabsLength + '%'};

            self.$position.transition(duration).css(translate);
        };

        self.updateContent = function (duration) {
            self.$content.transition(duration).css({
                marginLeft: -100 * self.currIndex + '%'
            });

            self.$content.children().transition(duration).each(function (i) {
                var $this = $(this);

                if (i === self.currIndex) {
                    $this.css({opacity: 1});
                    $this.children().css('display', '');
                }
                else if (duration > 0) {
                    $this.css({opacity: 0}).transitionEnd(function () {
                        if ($this.css('opacity') === '0') {
                            $this.children().css('display', 'none');
                        }
                    });
                }
                else {
                    $this.css({opacity: 0});
                }
            });
        };

        self.init();

        return self;
    };

    $.fn.tabSwitchs = function (options) {
        var firstInstance;

        this.each(function () {
            var inst = new TabSwitchs(this, options);

            if (!firstInstance) {
                firstInstance = inst;
            }
        });

        return firstInstance;
    };

    $.fn.tabSwitchs.defaults = defaults;
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
