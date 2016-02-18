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

        self.init();

        return self;
    };

    InputWithCounter.getStrLocalLength = getStrLocalLength;

    InputWithCounter.prototype = {
        init: function () {
            var self = this;

            self.$counter.css({
                bottom: self.$parent.css('paddingBottom'),
                right: self.$parent.css('paddingRight'),
            });

            self.calcCounter();
            self.calcMaxLength();

            self._bindChange();
        },
        _bindChange: function () {
            var self = this;
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
        },
        calcCounter: function () {
            var self = this;
            var length;

            if (self.options.local) {
                length = getStrLocalLength(self.$.val());
                length = Math.ceil(length / 2);
            }
            else {
                length = self.$.val().length;
            }

            self.$counter.text(length + '/' + self.options.maxLength);
        },
        calcMaxLength: function () {
            var self = this;
            var maxLength = self.options.maxLength;
            var value = self.$.val();

            if (self.options.local) {
                var localLength = getStrLocalLength(value);

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
        },
    };

    function getStrLocalLength(str) {
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
