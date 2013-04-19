(function() {
  var eventSplitter, extend, initView, isExplorer, rootStripper, routeStripper, routeToRegex, slice, toString, trailingSlash;

  window.bone = {};

  bone.$ = window.$;

  extend = function(obj, source) {
    var prop;

    for (prop in source) {
      obj[prop] = source[prop];
    }
    return obj;
  };

  routeStripper = /^[#\/]|\s+$/g;

  rootStripper = /^\/+|\/+$/g;

  isExplorer = /msie [\w.]+/;

  trailingSlash = /\/$/;

  bone.History = (function() {
    function History() {
      if (typeof window !== "undefined") {
        this.location = window.location;
        this.history = window.history;
      }
    }

    History.prototype.interval = 50;

    History.prototype.getHash = function(window) {
      var match;

      match = (window || this).location.href.match(/#(.*)$/);
      if (match) {
        return match[1];
      } else {
        return "";
      }
    };

    History.prototype.getFragment = function(fragment, forcePushState) {
      var root;

      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          root = this.root.replace(trailingSlash, "");
          if (!fragment.indexOf(root)) {
            fragment = fragment.substr(root.length);
          }
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, "");
    };

    History.prototype.start = function(options) {
      var atRoot, docMode, fragment, loc, oldIE,
        _this = this;

      this.options = extend({}, {
        root: "/"
      }, this.options, options);
      this.root = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState = !!this.options.pushState;
      this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
      fragment = this.getFragment();
      docMode = document.documentMode;
      oldIE = isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7);
      this.root = ("/" + this.root + "/").replace(rootStripper, "/");
      if (oldIE && this._wantsHashChange) {
        this.iframe = bone.$("<iframe src=\"javascript:0\" tabindex=\"-1\" />").hide().appendTo("body")[0].contentWindow;
        this.navigate(fragment);
      }
      if (this._hasPushState) {
        bone.$(window).on("popstate", function() {
          return _this.checkUrl.apply(_this, arguments);
        });
      } else if (this._wantsHashChange && ("onhashchange" in window) && !oldIE) {
        bone.$(window).on("hashchange", function() {
          return _this.checkUrl.apply(_this, arguments);
        });
      } else {
        if (this._wantsHashChange) {
          this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
        }
      }
      this.fragment = fragment;
      loc = this.location;
      atRoot = loc.pathname.replace(/[^\/]$/, "$&/") === this.root;
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + "#" + this.fragment);
        return true;
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, "");
        this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
      }
      if (!this.options.silent) {
        return this.loadUrl();
      }
    };

    History.prototype.route = function(route, callback) {
      return this.handlers.unshift({
        route: route,
        callback: callback
      });
    };

    History.prototype.checkUrl = function(e) {
      var current;

      current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) {
        return false;
      }
      if (this.iframe) {
        this.navigate(current);
      }
      return this.loadUrl() || this.loadUrl(this.getHash());
    };

    History.prototype.handlers = [];

    History.prototype.loadUrl = function(fragmentOverride) {
      var args, fragment, handler, _i, _len, _ref, _results;

      fragment = this.fragment = this.getFragment(fragmentOverride);
      _ref = this.handlers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        if (handler.route.test(fragment)) {
          args = handler.route.exec(fragment).slice(1);
          if (bone.log) {
            console.log("Route: [" + handler.route + ":" + fragment + "]", args);
          }
          handler.callback.apply(handler.router, args);
          continue;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    History.prototype.navigate = function(fragment, options) {
      var url;

      if (!options || options === true) {
        options = {
          trigger: options
        };
      }
      fragment = this.getFragment(fragment || "");
      if (this.fragment === fragment) {
        return;
      }
      this.fragment = fragment;
      url = this.root + fragment;
      if (this._hasPushState) {
        this.history[(options.replace ? "replaceState" : "pushState")]({}, document.title, url);
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          if (!options.replace) {
            this.iframe.document.open().close();
          }
          this._updateHash(this.iframe.location, fragment, options.replace);
        }
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) {
        return this.loadUrl(fragment);
      }
    };

    History.prototype._updateHash = function(location, fragment, replace) {
      var href;

      if (replace) {
        href = location.href.replace(/(javascript:|#).*$/, "");
        return location.replace(href + "#" + fragment);
      } else {
        return location.hash = "#" + fragment;
      }
    };

    return History;

  })();

  bone.$(function() {
    return bone.history = new bone.History();
  });

  bone.log = true;

  eventSplitter = /^(\S+)\s*(.*)$/;

  slice = Array.prototype.slice;

  toString = Object.prototype.toString;

  initView = function(root, view, options) {
    var $root, action, boneView, name, _fn;

    $root = $(root);
    boneView = {};
    boneView.data = function() {
      console.log(arguments);
      console.log($root);
      return $root.data.apply($root, arguments);
    };
    boneView.$ = function() {
      return $root.find.apply($root, arguments);
    };
    boneView.el = root;
    boneView.$el = $(root);
    _fn = function(name, action) {
      return boneView[name] = function(data) {
        var message;

        if (bone.log) {
          message = "View: [" + options.selector + ":" + name + "]";
          console.log(message, boneView.el, data);
        }
        return action.call(boneView, data);
      };
    };
    for (name in options) {
      action = options[name];
      if (name === 'events') {
        continue;
      }
      if (toString.call(action) !== '[object Function]') {
        boneView[name] = action;
        continue;
      }
      _fn(name, action);
    }
    return boneView;
  };

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
          var boneView, message, root;

          root = $(event.currentTarget).parents(selector)[0];
          if (bone.log) {
            message = "Interface: [" + fullSelector + ":" + eventName + "]";
            console.log(message, root);
          }
          boneView = $(root).data('bone-view');
          if (boneView == null) {
            boneView = initView(root, view, options);
            $(root).data('bone-view', boneView);
          }
          if ($.trim(selector) !== $.trim(fullSelector)) {
            root = $(fullSelector).parents(selector)[0];
          }
          return action.call(boneView, root, event);
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
            var boneView, message;

            boneView = $(element).data('bone-view');
            if (boneView == null) {
              boneView = initView(element, view, options);
              $(element).data('bone-view');
            }
            if (bone.log) {
              message = "View: [" + selector + ":" + name + "]";
              console.log(message, element, data);
            }
            return action.call(boneView, data);
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
          var message;

          if (bone.log) {
            message = "Data-In: [" + sourceName + ":" + name + "]";
            console.log(message, data);
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

  routeToRegex = function(route) {
    var escapeRegExp, namedParam, optionalParam, splatParam;

    optionalParam = /\((.*?)\)/g;
    namedParam = /(\(\?)?:\w+/g;
    splatParam = /\*\w+/g;
    escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    route = route.replace(escapeRegExp, "\\$&").replace(optionalParam, "(?:$1)?").replace(namedParam, function(match, optional) {
      if (optional) {
        return match;
      } else {
        return "([^/]+)";
      }
    }).replace(splatParam, "(.*?)");
    return new RegExp("^" + route + "$");
  };

  bone.router = function(options) {
    return $(function() {
      var action, route, _ref;

      _ref = options.routes;
      for (route in _ref) {
        action = _ref[route];
        if (route === 'routes') {
          continue;
        }
        route = routeToRegex(route);
        bone.history.handlers.push({
          route: route,
          callback: options[action],
          router: options
        });
      }
      return options.initialize();
    });
  };

}).call(this);
