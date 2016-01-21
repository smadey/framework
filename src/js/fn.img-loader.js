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
