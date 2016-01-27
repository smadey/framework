// date.js
!(function (undefined) {
    var SECOND_UNIT = 1000;
    var MINUTE_UNIT = 60 * SECOND_UNIT;
    var HOUR_UNIT = 60 * MINUTE_UNIT;
    var DAY_UNIT = 24 * HOUR_UNIT;
    var MONTH_UNIT = 30 * DAY_UNIT;

    if (!Date.prototype.format) {
        Object.defineProperty(Date.prototype, 'format', {
            value: dateFormat
        });
    }

    if (!Date.new) {
        Object.defineProperty(Date, 'new', {
            value: dateNew
        });
    }

    if (!Date.duration) {
        Object.defineProperty(Date, 'duration', {
            value: dateDuration
        });
    }

    function dateDuration(date1, date2) {
        if (!(date1 instanceof Date)) {
            date1 = dateNew(date1);
        }

        if (!(date2 instanceof Date)) {
            date2 = dateNew(date2);
        }

        var milliseconds = date2.getTime() - date1.getTime();

        return {
            milliseconds: milliseconds,
            seconds: milliseconds / SECOND_UNIT,
            minutes: milliseconds / MINUTE_UNIT,
            hour: milliseconds / HOUR_UNIT,
            day: milliseconds / DAY_UNIT,
            month: milliseconds / MONTH_UNIT
        };
    }

    function dateFormat(format) {
        format = format || 'YYYY-MM-DD HH:mm:ss';

        var date = this;

        var keys = {
            'M+': date.getMonth() + 1,
            'D+': date.getDate(),
            'H+': date.getHours(),
            'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            'S': date.getMilliseconds(),
            'E+': '日一二三四五六七'.split('')[date.getDay()]
        };

        if (/(Y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }

        for (var k in keys) {
            if (keys.hasOwnProperty(k)) {
                if (new RegExp('(' + k + ')').test(format)) {
                    var replaceTo = keys[k];

                    if (RegExp.$1.length > 1) {
                        replaceTo = ('00' + replaceTo).substr(('' + replaceTo).length);
                    }

                    format = format.replace(RegExp.$1, replaceTo);
                }
            }
        }

        return format;
    }

    function dateNew(obj) {
        if (!obj) {
            return new Date();
        }

        if (typeof obj === 'string') {
            return new Date(obj.replace(/-/g, '/'));
        }

        return new Date(obj);
    }
})();
