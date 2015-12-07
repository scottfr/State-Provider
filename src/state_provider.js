export default class StateProvider {
    constructor(config) {
      config = Object.assign({
        timeFunction:  (() => (new Date()).getTime()),
        deleteOnRestore: false
      }, config);

      this._timeFunction = config.timeFunction;

      // Enabeling can create incompatibilities with data binding libraries
      this._deleteOnRestore = config.deleteOnRestore;

      this._items = new Map();
      this._times = [];

      this._dontLog = false;
    }

    time() {
      return this._timeFunction();
    }

    undo(steps = 1) {
      let t = this._activeTime;
      if (t === undefined) {
        t = this._times[this._times.length - 1];
      }

      let ts = this._times.filter(ct => ct < t);
      ts = ts.slice(ts.length - steps);

      if (ts.length) {
        this.restore(ts[0]);
      } else {
        this.restore(-Infinity);
      }
    }

    redo(steps = 1) {
      if (this._activeTime !== undefined) {
        let ts = this._times.filter(t => t > this._activeTime);
        ts = ts.slice(0, steps);
        if (ts.length) {
          this.restore(ts[ts.length-1]);
        }
      }
    }

    savedTimes() {
      return this._times;
    }

    restore(time = this.time()) {

      this._activeTime = time;

      this._dontLog = true;
      for (let [obj, changelog] of this._items) {
        if (this._deleteOnRestore) {
          for (var member in obj) {
            delete obj[member];
          }
        }
        // Note this won't handle deleting properties
        Object.assign(obj, ...(changelog.filter(item => (item.time <= time)).map(x => x.data)));
      }
      this._dontLog = false;
    }

    add(obj) {
      this._items.set(obj, [
        {
          time: -Infinity,
          data: Object.assign({}, obj)
        }
      ]);


      let handler = {
        set: function(obj, property, value) {
          if (!this._dontLog) {

            let time = this.time();

            let changelog = this._items.get(obj);

            if (this._activeTime !== undefined) {
              for (let [, changelog] of this._items) {
                while (changelog.length && changelog[changelog.length - 1].time > this._activeTime) {
                  changelog.pop();
                }
              }
              this._times = this._times.filter(t => t <= this._activeTime);
              this._activeTime = undefined;
            }

            let entry = {time: time, data: {}};
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
        }.bind(this)
      };

      return new Proxy(obj, handler);
    }
}
