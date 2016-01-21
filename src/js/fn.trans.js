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
