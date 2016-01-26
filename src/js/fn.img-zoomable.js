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
