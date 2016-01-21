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
