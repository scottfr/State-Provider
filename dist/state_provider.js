(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _state_provider = require('./state_provider.js');

var _state_provider2 = _interopRequireDefault(_state_provider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.StateProvider = _state_provider2.default;

},{"./state_provider.js":2}],2:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StateProvider = (function () {
  function StateProvider(config) {
    _classCallCheck(this, StateProvider);

    config = Object.assign({
      timeFunction: function timeFunction() {
        return new Date().getTime();
      },
      deleteOnRestore: false
    }, config);

    this._timeFunction = config.timeFunction;

    // Enabeling can create incompatibilities with data binding libraries
    this._deleteOnRestore = config.deleteOnRestore;

    this._items = new Map();
    this._times = [];

    this._dontLog = false;
  }

  _createClass(StateProvider, [{
    key: "time",
    value: function time() {
      return this._timeFunction();
    }
  }, {
    key: "undo",
    value: function undo() {
      var steps = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      var t = this._activeTime;
      if (t === undefined) {
        t = this._times[this._times.length - 1];
      }

      var ts = this._times.filter(function (ct) {
        return ct < t;
      });
      ts = ts.slice(ts.length - steps);

      if (ts.length) {
        this.restore(ts[0]);
      } else {
        this.restore(-Infinity);
      }
    }
  }, {
    key: "redo",
    value: function redo() {
      var _this = this;

      var steps = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

      if (this._activeTime !== undefined) {
        var ts = this._times.filter(function (t) {
          return t > _this._activeTime;
        });
        ts = ts.slice(0, steps);
        if (ts.length) {
          this.restore(ts[ts.length - 1]);
        }
      }
    }
  }, {
    key: "savedTimes",
    value: function savedTimes() {
      return this._times;
    }
  }, {
    key: "restore",
    value: function restore() {
      var time = arguments.length <= 0 || arguments[0] === undefined ? this.time() : arguments[0];

      this._activeTime = time;

      this._dontLog = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _Object;

          var _step$value = _slicedToArray(_step.value, 2);

          var obj = _step$value[0];
          var changelog = _step$value[1];

          if (this._deleteOnRestore) {
            for (var member in obj) {
              delete obj[member];
            }
          }
          // Note this won't handle deleting properties
          (_Object = Object).assign.apply(_Object, [obj].concat(_toConsumableArray(changelog.filter(function (item) {
            return item.time <= time;
          }).map(function (x) {
            return x.data;
          }))));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._dontLog = false;
    }
  }, {
    key: "add",
    value: function add(obj) {
      this._items.set(obj, [{
        time: -Infinity,
        data: Object.assign({}, obj)
      }]);

      var handler = {
        set: (function (obj, property, value) {
          var _this2 = this;

          if (!this._dontLog) {

            var time = this.time();

            var changelog = this._items.get(obj);

            if (this._activeTime !== undefined) {
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = this._items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var _step2$value = _slicedToArray(_step2.value, 2);

                  var _changelog = _step2$value[1];

                  while (_changelog.length && _changelog[_changelog.length - 1].time > this._activeTime) {
                    _changelog.pop();
                  }
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              this._times = this._times.filter(function (t) {
                return t <= _this2._activeTime;
              });
              this._activeTime = undefined;
            }

            var entry = { time: time, data: {} };
            if (changelog.length && changelog[changelog.length - 1].time == time) {
              entry = changelog[changelog.length - 1];
            } else {
              changelog.push(entry);
              this._times.push(time);
            }

            entry.data[property] = value;
          }

          obj[property] = value;
          return value;
        }).bind(this)
      };

      return new Proxy(obj, handler);
    }
  }]);

  return StateProvider;
})();

exports.default = StateProvider;

},{}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL3NyYy9hcHAuanMiLCJzcmMvc3JjL3N0YXRlX3Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNFQSxNQUFNLENBQUMsYUFBYSwyQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNGaEIsYUFBYTtBQUM5QixXQURpQixhQUFhLENBQ2xCLE1BQU0sRUFBRTswQkFESCxhQUFhOztBQUU1QixVQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNyQixrQkFBWSxFQUFJO2VBQU0sQUFBQyxJQUFJLElBQUksRUFBRSxDQUFFLE9BQU8sRUFBRTtPQUFBLEFBQUM7QUFDN0MscUJBQWUsRUFBRSxLQUFLO0tBQ3ZCLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRVgsUUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsWUFBWTs7O0FBQUMsQUFHekMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN4QixRQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7R0FDdkI7O2VBaEJnQixhQUFhOzsyQkFrQnZCO0FBQ0wsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDN0I7OzsyQkFFZTtVQUFYLEtBQUsseURBQUcsQ0FBQzs7QUFDWixVQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUNuQixTQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztPQUN6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cm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFN0YXRlUHJvdmlkZXIgZnJvbSAnLi9zdGF0ZV9wcm92aWRlci5qcyc7XG5cbndpbmRvdy5TdGF0ZVByb3ZpZGVyID0gU3RhdGVQcm92aWRlcjtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRlUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgY29uZmlnID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIHRpbWVGdW5jdGlvbjogICgoKSA9PiAobmV3IERhdGUoKSkuZ2V0VGltZSgpKSxcbiAgICAgICAgZGVsZXRlT25SZXN0b3JlOiBmYWxzZVxuICAgICAgfSwgY29uZmlnKTtcblxuICAgICAgdGhpcy5fdGltZUZ1bmN0aW9uID0gY29uZmlnLnRpbWVGdW5jdGlvbjtcblxuICAgICAgLy8gRW5hYmVsaW5nIGNhbiBjcmVhdGUgaW5jb21wYXRpYmlsaXRpZXMgd2l0aCBkYXRhIGJpbmRpbmcgbGlicmFyaWVzXG4gICAgICB0aGlzLl9kZWxldGVPblJlc3RvcmUgPSBjb25maWcuZGVsZXRlT25SZXN0b3JlO1xuXG4gICAgICB0aGlzLl9pdGVtcyA9IG5ldyBNYXAoKTtcbiAgICAgIHRoaXMuX3RpbWVzID0gW107XG5cbiAgICAgIHRoaXMuX2RvbnRMb2cgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aW1lKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3RpbWVGdW5jdGlvbigpO1xuICAgIH1cblxuICAgIHVuZG8oc3RlcHMgPSAxKSB7XG4gICAgICBsZXQgdCA9IHRoaXMuX2FjdGl2ZVRpbWU7XG4gICAgICBpZiAodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHQgPSB0aGlzLl90aW1lc1t0aGlzLl90aW1lcy5sZW5ndGggLSAxXTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRzID0gdGhpcy5fdGltZXMuZmlsdGVyKGN0ID0+IGN0IDwgdCk7XG4gICAgICB0cyA9IHRzLnNsaWNlKHRzLmxlbmd0aCAtIHN0ZXBzKTtcblxuICAgICAgaWYgKHRzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlc3RvcmUodHNbMF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXN0b3JlKC1JbmZpbml0eSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVkbyhzdGVwcyA9IDEpIHtcbiAgICAgIGlmICh0aGlzLl9hY3RpdmVUaW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IHRzID0gdGhpcy5fdGltZXMuZmlsdGVyKHQgPT4gdCA+IHRoaXMuX2FjdGl2ZVRpbWUpO1xuICAgICAgICB0cyA9IHRzLnNsaWNlKDAsIHN0ZXBzKTtcbiAgICAgICAgaWYgKHRzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMucmVzdG9yZSh0c1t0cy5sZW5ndGgtMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2F2ZWRUaW1lcygpIHtcbiAgICAgIHJldHVybiB0aGlzLl90aW1lcztcbiAgICB9XG5cbiAgICByZXN0b3JlKHRpbWUgPSB0aGlzLnRpbWUoKSkge1xuXG4gICAgICB0aGlzLl9hY3RpdmVUaW1lID0gdGltZTtcblxuICAgICAgdGhpcy5fZG9udExvZyA9IHRydWU7XG4gICAgICBmb3IgKGxldCBbb2JqLCBjaGFuZ2Vsb2ddIG9mIHRoaXMuX2l0ZW1zKSB7XG4gICAgICAgIGlmICh0aGlzLl9kZWxldGVPblJlc3RvcmUpIHtcbiAgICAgICAgICBmb3IgKHZhciBtZW1iZXIgaW4gb2JqKSB7XG4gICAgICAgICAgICBkZWxldGUgb2JqW21lbWJlcl07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5vdGUgdGhpcyB3b24ndCBoYW5kbGUgZGVsZXRpbmcgcHJvcGVydGllc1xuICAgICAgICBPYmplY3QuYXNzaWduKG9iaiwgLi4uKGNoYW5nZWxvZy5maWx0ZXIoaXRlbSA9PiAoaXRlbS50aW1lIDw9IHRpbWUpKS5tYXAoeCA9PiB4LmRhdGEpKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9kb250TG9nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgYWRkKG9iaikge1xuICAgICAgdGhpcy5faXRlbXMuc2V0KG9iaiwgW1xuICAgICAgICB7XG4gICAgICAgICAgdGltZTogLUluZmluaXR5LFxuICAgICAgICAgIGRhdGE6IE9iamVjdC5hc3NpZ24oe30sIG9iailcbiAgICAgICAgfVxuICAgICAgXSk7XG5cblxuICAgICAgbGV0IGhhbmRsZXIgPSB7XG4gICAgICAgIHNldDogZnVuY3Rpb24ob2JqLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuX2RvbnRMb2cpIHtcblxuICAgICAgICAgICAgbGV0IHRpbWUgPSB0aGlzLnRpbWUoKTtcblxuICAgICAgICAgICAgbGV0IGNoYW5nZWxvZyA9IHRoaXMuX2l0ZW1zLmdldChvYmopO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fYWN0aXZlVGltZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGZvciAobGV0IFssIGNoYW5nZWxvZ10gb2YgdGhpcy5faXRlbXMpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2hhbmdlbG9nLmxlbmd0aCAmJiBjaGFuZ2Vsb2dbY2hhbmdlbG9nLmxlbmd0aCAtIDFdLnRpbWUgPiB0aGlzLl9hY3RpdmVUaW1lKSB7XG4gICAgICAgICAgICAgICAgICBjaGFuZ2Vsb2cucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRoaXMuX3RpbWVzID0gdGhpcy5fdGltZXMuZmlsdGVyKHQgPT4gdCA8PSB0aGlzLl9hY3RpdmVUaW1lKTtcbiAgICAgICAgICAgICAgdGhpcy5fYWN0aXZlVGltZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGVudHJ5ID0ge3RpbWU6IHRpbWUsIGRhdGE6IHt9fTtcbiAgICAgICAgICAgIGlmIChjaGFuZ2Vsb2cubGVuZ3RoICYmIGNoYW5nZWxvZ1tjaGFuZ2Vsb2cubGVuZ3RoIC0gMV0udGltZSA9PSB0aW1lKSB7XG4gICAgICAgICAgICAgIGVudHJ5ID0gY2hhbmdlbG9nW2NoYW5nZWxvZy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNoYW5nZWxvZy5wdXNoKGVudHJ5KTtcbiAgICAgICAgICAgICAgdGhpcy5fdGltZXMucHVzaCh0aW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZW50cnkuZGF0YVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvYmpbcHJvcGVydHldID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LmJpbmQodGhpcylcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBuZXcgUHJveHkob2JqLCBoYW5kbGVyKTtcbiAgICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
