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
  /* Config object defines the properties for the state provider */

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

  /* Returns the current time as defined by the timeFunction */

  _createClass(StateProvider, [{
    key: "time",
    value: function time() {
      return this._timeFunction();
    }

    /* Undo's one or more recent changes */

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

    /* Redo's one ore more changes */

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

    /* Get's the list of times changes have been saved at */

  }, {
    key: "savedTimes",
    value: function savedTimes() {
      return this._times;
    }

    /* Restores the state to a specific point in time */

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

    /* Adds an object to be tracked. Changes to the first level of object properties will be logged. */

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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL3NyYy9hcHAuanMiLCJzcmMvc3JjL3N0YXRlX3Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNFQSxNQUFNLENBQUMsYUFBYSwyQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNGaEIsYUFBYTs7O0FBRWhDLFdBRm1CLGFBQWEsQ0FFcEIsTUFBTSxFQUFFOzBCQUZELGFBQWE7O0FBRzlCLFVBQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3JCLGtCQUFZLEVBQUk7ZUFBTSxBQUFDLElBQUksSUFBSSxFQUFFLENBQUUsT0FBTyxFQUFFO09BQUEsQUFBQztBQUM3QyxxQkFBZSxFQUFFLEtBQUs7S0FDdkIsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFWCxRQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxZQUFZOzs7QUFBQyxBQUd6QyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDOztBQUVqQixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztHQUN2Qjs7O0FBQUE7ZUFqQmtCLGFBQWE7OzJCQW9CekI7QUFDTCxhQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztLQUM3Qjs7Ozs7OzJCQUdlO1VBQVgsS0FBSyx5REFBRyxDQUFDOztBQUNaLFVBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDekIsVUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO0FBQ25CLFNBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FB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YixhQUFhIiwiZmlsZSI6InN0YXRlX3Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgU3RhdGVQcm92aWRlciBmcm9tICcuL3N0YXRlX3Byb3ZpZGVyLmpzJztcblxud2luZG93LlN0YXRlUHJvdmlkZXIgPSBTdGF0ZVByb3ZpZGVyO1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGVQcm92aWRlciB7XG4gIC8qIENvbmZpZyBvYmplY3QgZGVmaW5lcyB0aGUgcHJvcGVydGllcyBmb3IgdGhlIHN0YXRlIHByb3ZpZGVyICovXG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgdGltZUZ1bmN0aW9uOiAgKCgpID0+IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkpLFxuICAgICAgZGVsZXRlT25SZXN0b3JlOiBmYWxzZVxuICAgIH0sIGNvbmZpZyk7XG5cbiAgICB0aGlzLl90aW1lRnVuY3Rpb24gPSBjb25maWcudGltZUZ1bmN0aW9uO1xuXG4gICAgLy8gRW5hYmVsaW5nIGNhbiBjcmVhdGUgaW5jb21wYXRpYmlsaXRpZXMgd2l0aCBkYXRhIGJpbmRpbmcgbGlicmFyaWVzXG4gICAgdGhpcy5fZGVsZXRlT25SZXN0b3JlID0gY29uZmlnLmRlbGV0ZU9uUmVzdG9yZTtcblxuICAgIHRoaXMuX2l0ZW1zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3RpbWVzID0gW107XG5cbiAgICB0aGlzLl9kb250TG9nID0gZmFsc2U7XG4gIH1cblxuICAvKiBSZXR1cm5zIHRoZSBjdXJyZW50IHRpbWUgYXMgZGVmaW5lZCBieSB0aGUgdGltZUZ1bmN0aW9uICovXG4gIHRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWVGdW5jdGlvbigpO1xuICB9XG5cbiAgLyogVW5kbydzIG9uZSBvciBtb3JlIHJlY2VudCBjaGFuZ2VzICovXG4gIHVuZG8oc3RlcHMgPSAxKSB7XG4gICAgbGV0IHQgPSB0aGlzLl9hY3RpdmVUaW1lO1xuICAgIGlmICh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHQgPSB0aGlzLl90aW1lc1t0aGlzLl90aW1lcy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBsZXQgdHMgPSB0aGlzLl90aW1lcy5maWx0ZXIoY3QgPT4gY3QgPCB0KTtcbiAgICB0cyA9IHRzLnNsaWNlKHRzLmxlbmd0aCAtIHN0ZXBzKTtcblxuICAgIGlmICh0cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMucmVzdG9yZSh0c1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzdG9yZSgtSW5maW5pdHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qIFJlZG8ncyBvbmUgb3JlIG1vcmUgY2hhbmdlcyAqL1xuICByZWRvKHN0ZXBzID0gMSkge1xuICAgIGlmICh0aGlzLl9hY3RpdmVUaW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCB0cyA9IHRoaXMuX3RpbWVzLmZpbHRlcih0ID0+IHQgPiB0aGlzLl9hY3RpdmVUaW1lKTtcbiAgICAgIHRzID0gdHMuc2xpY2UoMCwgc3RlcHMpO1xuICAgICAgaWYgKHRzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlc3RvcmUodHNbdHMubGVuZ3RoLTFdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiBHZXQncyB0aGUgbGlzdCBvZiB0aW1lcyBjaGFuZ2VzIGhhdmUgYmVlbiBzYXZlZCBhdCAqL1xuICBzYXZlZFRpbWVzKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lcztcbiAgfVxuXG4gIC8qIFJlc3RvcmVzIHRoZSBzdGF0ZSB0byBhIHNwZWNpZmljIHBvaW50IGluIHRpbWUgKi9cbiAgcmVzdG9yZSh0aW1lID0gdGhpcy50aW1lKCkpIHtcblxuICAgIHRoaXMuX2FjdGl2ZVRpbWUgPSB0aW1lO1xuXG4gICAgdGhpcy5fZG9udExvZyA9IHRydWU7XG4gICAgZm9yIChsZXQgW29iaiwgY2hhbmdlbG9nXSBvZiB0aGlzLl9pdGVtcykge1xuICAgICAgaWYgKHRoaXMuX2RlbGV0ZU9uUmVzdG9yZSkge1xuICAgICAgICBmb3IgKHZhciBtZW1iZXIgaW4gb2JqKSB7XG4gICAgICAgICAgZGVsZXRlIG9ialttZW1iZXJdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBOb3RlIHRoaXMgd29uJ3QgaGFuZGxlIGRlbGV0aW5nIHByb3BlcnRpZXNcbiAgICAgIE9iamVjdC5hc3NpZ24ob2JqLCAuLi4oY2hhbmdlbG9nLmZpbHRlcihpdGVtID0+IChpdGVtLnRpbWUgPD0gdGltZSkpLm1hcCh4ID0+IHguZGF0YSkpKTtcbiAgICB9XG4gICAgdGhpcy5fZG9udExvZyA9IGZhbHNlO1xuICB9XG5cbiAgLyogQWRkcyBhbiBvYmplY3QgdG8gYmUgdHJhY2tlZC4gQ2hhbmdlcyB0byB0aGUgZmlyc3QgbGV2ZWwgb2Ygb2JqZWN0IHByb3BlcnRpZXMgd2lsbCBiZSBsb2dnZWQuICovXG4gIGFkZChvYmopIHtcbiAgICB0aGlzLl9pdGVtcy5zZXQob2JqLCBbXG4gICAgICB7XG4gICAgICAgIHRpbWU6IC1JbmZpbml0eSxcbiAgICAgICAgZGF0YTogT2JqZWN0LmFzc2lnbih7fSwgb2JqKVxuICAgICAgfVxuICAgIF0pO1xuXG5cbiAgICBsZXQgaGFuZGxlciA9IHtcbiAgICAgIHNldDogZnVuY3Rpb24ob2JqLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9kb250TG9nKSB7XG5cbiAgICAgICAgICBsZXQgdGltZSA9IHRoaXMudGltZSgpO1xuXG4gICAgICAgICAgbGV0IGNoYW5nZWxvZyA9IHRoaXMuX2l0ZW1zLmdldChvYmopO1xuXG4gICAgICAgICAgaWYgKHRoaXMuX2FjdGl2ZVRpbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZm9yIChsZXQgWywgY2hhbmdlbG9nXSBvZiB0aGlzLl9pdGVtcykge1xuICAgICAgICAgICAgICB3aGlsZSAoY2hhbmdlbG9nLmxlbmd0aCAmJiBjaGFuZ2Vsb2dbY2hhbmdlbG9nLmxlbmd0aCAtIDFdLnRpbWUgPiB0aGlzLl9hY3RpdmVUaW1lKSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlbG9nLnBvcCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl90aW1lcyA9IHRoaXMuX3RpbWVzLmZpbHRlcih0ID0+IHQgPD0gdGhpcy5fYWN0aXZlVGltZSk7XG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVUaW1lID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBlbnRyeSA9IHt0aW1lOiB0aW1lLCBkYXRhOiB7fX07XG4gICAgICAgICAgaWYgKGNoYW5nZWxvZy5sZW5ndGggJiYgY2hhbmdlbG9nW2NoYW5nZWxvZy5sZW5ndGggLSAxXS50aW1lID09IHRpbWUpIHtcbiAgICAgICAgICAgIGVudHJ5ID0gY2hhbmdlbG9nW2NoYW5nZWxvZy5sZW5ndGggLSAxXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hhbmdlbG9nLnB1c2goZW50cnkpO1xuICAgICAgICAgICAgdGhpcy5fdGltZXMucHVzaCh0aW1lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlbnRyeS5kYXRhW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgb2JqW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm94eShvYmosIGhhbmRsZXIpO1xuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
