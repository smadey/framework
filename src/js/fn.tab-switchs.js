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
