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
