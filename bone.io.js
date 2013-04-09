/* Copyright Brad Carleton, Tech Pines 
   MIT License
*/
(function() {
  var eventSplitter, setupEvent, slice, toString;

  window.bone = {};

  bone.log = true;

  eventSplitter = /^(\S+)\s*(.*)$/;

  slice = Array.prototype.slice;

  toString = Object.prototype.toString;

  setupEvent = function(eventName, rootSelector, selector, action) {};

  bone.view = function(selector, options) {
    var action, eventSelector, events, functionName, name, view, _fn, _fn1;

    view = {};
    events = options.events;
    _fn = function(eventSelector, functionName) {
      var action, eventName, fullSelector, match, subSelector;

      match = eventSelector.match(eventSplitter);
      eventName = match[1];
      subSelector = match[2];
      fullSelector = selector;
      if (subSelector != null) {
        fullSelector += " " + subSelector;
      }
      action = options[functionName];
      return $(function() {
        return $('body').on(eventName, fullSelector, function(event) {
          var root;

          if (bone.log) {
            console.log("Interface: [" + fullSelector + ":" + eventName + "]", event.currentTarget);
          }
          root = $(fullSelector).parents(selector)[0];
          return action.call(view, root, event);
        });
      });
    };
    for (eventSelector in events) {
      functionName = events[eventSelector];
      if (functionName === 'events') {
        continue;
      }
      _fn(eventSelector, functionName);
    }
    _fn1 = function(name, action) {
      return view[name] = function(data) {
        var element, _i, _len, _ref, _results;

        _ref = $(selector);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          element = _ref[_i];
          _results.push((function(element) {
            if (bone.log) {
              console.log("View: [" + selector + ":" + name + "]", element, data);
            }
            return action.call(view, element, data);
          })(element));
        }
        return _results;
      };
    };
    for (name in options) {
      action = options[name];
      if (name === 'events') {
        continue;
      }
      if (toString.call(action) !== '[object Function]') {
        view[name] = action;
        continue;
      }
      _fn1(name, action);
    }
    return view;
  };

  bone.io = {};

  bone.io.sources = {};

  bone.io.get = function(source) {
    var socket;

    socket = bone.io.sources[source];
    if (socket != null) {
      return socket;
    }
    socket = io.connect();
    bone.io.sources[source] = socket;
    return socket;
  };

  bone.io.route = function(sourceName, actions) {
    var action, name, source, _results;

    source = bone.io.get(sourceName);
    _results = [];
    for (name in actions) {
      action = actions[name];
      _results.push((function(name, action) {
        return source.socket.on("" + sourceName + ":" + name, function(data) {
          if (bone.log) {
            console.log("Data-In: [" + sourceName + ":" + name + "]", data);
          }
          return action(data);
        });
      })(name, action));
    }
    return _results;
  };

  bone.io.configure = function(source, options) {
    var action, name, _i, _len, _ref, _results;

    name = source;
    source = bone.io.sources[source] = {
      socket: io.connect()
    };
    _ref = options.actions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      action = _ref[_i];
      _results.push((function(action) {
        return source[action] = function(data) {
          if (bone.log) {
            console.log("Data-Out: [" + name + ":" + action + "]", data);
          }
          return source.socket.emit("" + name + ":" + action, data);
        };
      })(action));
    }
    return _results;
  };

}).call(this);
