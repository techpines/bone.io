var bone, _ref;

bone = {};

bone.modules = {};

if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
  module.exports = bone;
} else {
  window.bone = bone;
}

bone.$ = window.$;

if (((_ref = window.console) != null ? _ref.log : void 0) != null) {
  bone.log = function() {
    return console.log.apply(console, arguments);
  };
}

bone.config = {};

bone.set = function(key, value) {
  if (key === 'templates') {
    bone.templates = value;
  }
  if (key === 'log') {
    if (value === false) {
      bone.log = void 0;
    }
  }
  return bone.config[key] = value;
};

bone.get = function(key) {
  return bone.config[key];
};

bone.async = {};

bone.async.eachSeries = function(arr, iterator, callback) {
  var completed, iterate;

  callback = callback || function() {};
  if (!arr.length) {
    return callback();
  }
  completed = 0;
  iterate = function() {
    return iterator(arr[completed], function(err) {
      if (err) {
        callback(err);
        return callback = function() {};
      } else {
        completed += 1;
        if (completed >= arr.length) {
          return callback(null);
        } else {
          return iterate();
        }
      }
    });
  };
  return iterate();
};

var adapters, contextStore, messageId;

messageId = 0;

contextStore = {};

bone.io = function(source, options) {
  var adapter, _ref;

  adapter = (_ref = options.config) != null ? _ref.adapter : void 0;
  if (adapter == null) {
    adapter = 'socket.io';
  }
  return bone.io.adapters[adapter](source, options);
};

bone.io.defaults = {};

bone.io.set = function(name, value) {
  return bone.io.defaults[name] = value;
};

adapters = bone.io.adapters = {};

adapters['socket.io'] = function(source, options) {
  var io, name, route, _base, _base1, _base2, _base3, _fn, _fn1, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;

  io = {};
  if ((_ref = options.config) == null) {
    options.config = bone.get('io.options');
  }
  io.error = options.error;
  io.source = source;
  io.options = options;
  io.socket = options.config.socket;
  io.inbound = options.inbound;
  if ((_ref1 = io.inbound) == null) {
    io.inbound = {};
  }
  io.outbound = options.outbound;
  if ((_ref2 = io.outbound) == null) {
    io.outbound = {};
  }
  if ((_ref3 = (_base = io.inbound).middleware) == null) {
    _base.middleware = [];
  }
  if ((_ref4 = (_base1 = io.outbound).middleware) == null) {
    _base1.middleware = [];
  }
  if ((_ref5 = (_base2 = io.outbound).routes) == null) {
    _base2.routes = [];
  }
  if ((_ref6 = (_base3 = io.inbound).routes) == null) {
    _base3.routes = [];
  }
  _ref7 = io.outbound.routes;
  _fn = function(route) {
    return io[route] = function(data, context) {
      if (context == null) {
        context = {};
      }
      if (bone.log != null) {
        bone.log("Outbound: [" + source + ":" + route + "]", data);
      }
      context.mid = messageId += 1;
      contextStore[context.mid] = context;
      return bone.async.eachSeries(io.outbound.middleware, function(callback, next) {
        return callback(data, context, next);
      }, function(error) {
        if ((error != null) && (io.error != null)) {
          return io.error(error);
        }
        return io.socket.emit("" + source + ":" + route, {
          mid: context.mid,
          data: data
        });
      });
    };
  };
  for (_i = 0, _len = _ref7.length; _i < _len; _i++) {
    route = _ref7[_i];
    _fn(route);
  }
  _ref8 = io.inbound;
  _fn1 = function(name, route) {
    return io.socket.on("" + source + ":" + name, function(wrapper) {
      var context, data, mid;

      data = wrapper.data;
      mid = wrapper.mid;
      if (bone.log != null) {
        bone.log("Inbound: [" + source + ":" + name + "]", data);
      }
      context = contextStore[mid];
      delete contextStore[mid];
      if (context == null) {
        context = {};
      }
      context.route = name;
      context.data = data;
      context.namespace = source;
      context.socket = io.socket;
      return bone.async.eachSeries(io.inbound.middleware, function(callback, next) {
        return callback(data, context, next);
      }, function(error) {
        if ((error != null) && (io.error != null)) {
          return io.error(error);
        }
        return route.apply(io, [data, context]);
      });
    });
  };
  for (name in _ref8) {
    route = _ref8[name];
    if (name === 'middleware') {
      continue;
    }
    _fn1(name, route);
  }
  return io;
};

var extend, isExplorer, rootStripper, routeStripper, trailingSlash;

extend = function(obj) {
  var prop, source, _i, _len, _ref;

  _ref = Array.prototype.slice.call(arguments, 1);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    source = _ref[_i];
    if (source) {
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
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
    var args, fragment, handler, _base, _i, _len, _ref, _ref1;

    fragment = this.fragment = this.getFragment(fragmentOverride);
    _ref = this.handlers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      handler = _ref[_i];
      if (handler.route.test(fragment)) {
        args = handler.route.exec(fragment).slice(1);
        if (bone.log != null) {
          bone.log("Route: [" + handler.route + ":" + fragment + "]", args);
        }
        if ((_ref1 = (_base = handler.router).middleware) == null) {
          _base.middleware = [];
        }
        bone.async.eachSeries(handler.router.middleware, function(callback, next) {
          return callback.apply(handler.router, [fragment, next]);
        }, function() {
          return handler.callback.apply(handler.router, args);
        });
        return true;
      }
    }
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

var id, initView;

id = 0;

initView = function(root, view, options) {
  var $root, action, boneView, name, _fn;

  $root = $(root);
  boneView = {};
  boneView.id = id += 1;
  $root.attr('data-bone-id', id);
  boneView.data = function() {
    return $root.data.apply($root, arguments);
  };
  boneView.$ = function() {
    return $root.find.apply($root, arguments);
  };
  boneView.templates = bone.templates;
  boneView.el = root;
  boneView.$el = $root;
  _fn = function(name, action) {
    return boneView[name] = function() {
      var message;

      if (bone.log != null) {
        message = "View: [" + options.selector + ":" + name + "]";
        bone.log(message, boneView.el, arguments);
      }
      return action.apply(boneView, arguments);
    };
  };
  for (name in options) {
    action = options[name];
    if (name === 'events') {
      continue;
    }
    if (Object.prototype.toString.call(action) !== '[object Function]') {
      boneView[name] = action;
      continue;
    }
    _fn(name, action);
  }
  if (options.initialize != null) {
    options.initialize.apply(boneView, []);
  }
  return boneView;
};

bone.view = function(selector, options) {
  var action, eventSelector, events, functionName, name, view, _fn, _fn1;

  view = {};
  view.$ = function(subSelector) {
    var $element, boneId, boneView, boneViews, combinedSelector, element, _i, _len, _ref;

    if ('string' === typeof subSelector) {
      combinedSelector = "" + selector + subSelector;
      return bone.view(combinedSelector, options);
    } else {
      boneId = subSelector;
      _ref = $(selector);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        $element = $(element);
        boneViews = $(element).data('bone-views');
        if (boneViews == null) {
          boneViews = {};
          $(element).data('bone-views', boneViews);
        }
        boneView = boneViews[selector];
        if (boneView == null) {
          boneView = initView(element, view, options);
          $element.data('bone-views')[selector] = boneView;
        }
        if (boneId === boneView.id) {
          return boneView;
        }
      }
    }
  };
  options.selector = selector;
  events = options.events;
  _fn = function(eventSelector, functionName) {
    var action, eventName, eventSplitter, fullSelector, match, subSelector;

    eventSplitter = /^(\S+)\s*(.*)$/;
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
        var boneView, boneViews, element, message;

        element = $(event.currentTarget).parents(selector)[0];
        if (element == null) {
          element = event.currentTarget;
        }
        if (bone.log != null) {
          message = "Interface: [" + fullSelector + ":" + eventName + "]";
          bone.log(message, element);
        }
        boneViews = $(element).data('bone-views');
        if (boneViews == null) {
          boneViews = {};
          $(element).data('bone-views', boneViews);
        }
        boneView = boneViews[selector];
        if (boneView == null) {
          boneView = initView(element, view, options);
          $(element).data('bone-views')[selector] = boneView;
        }
        if ($.trim(selector) !== $.trim(fullSelector)) {
          element = $(fullSelector).parents(selector)[0];
        }
        return action.call(boneView, event);
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
    return view[name] = function() {
      var args, element, _i, _len, _ref, _results;

      args = arguments;
      _ref = $(selector);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        _results.push((function(element) {
          var boneView, boneViews, message;

          boneViews = $(element).data('bone-views');
          if (boneViews == null) {
            boneViews = {};
            $(element).data('bone-views', boneViews);
          }
          boneView = boneViews[selector];
          if (boneView == null) {
            boneView = initView(element, view, options);
            $(element).data('bone-views')[selector] = boneView;
          }
          if (bone.log != null) {
            message = "View: [" + selector + ":" + name + "]";
            bone.log(message, element, args);
          }
          return action.apply(boneView, args);
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
    if (Object.prototype.toString.call(action) !== '[object Function]') {
      view[name] = action;
      continue;
    }
    _fn1(name, action);
  }
  return view;
};

var routeToRegex;

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
  var _base, _ref;

  if ((_ref = (_base = bone.router).handlers) == null) {
    _base.handlers = [];
  }
  return $(function() {
    var action, route, _ref1;

    _ref1 = options.routes;
    for (route in _ref1) {
      action = _ref1[route];
      if (route === 'routes') {
        continue;
      }
      route = routeToRegex(route);
      bone.router.handlers.push({
        route: route,
        callback: options[action],
        router: options
      });
    }
    if (options.initialize != null) {
      return options.initialize();
    }
  });
};

bone.router.start = function(options) {
  return bone.$(function() {
    bone.history = new bone.History();
    bone.history.handlers = bone.router.handlers;
    return bone.history.start(options);
  });
};

bone.router.navigate = function(route, options) {
  return bone.history.navigate(route, options);
};

var $;

$ = bone.$;

bone.mount = function(selector, templateName, options) {
  var $current, data, info, refresh, sameData, sameTemplate, template, templateString;

  if (options == null) {
    options = {};
  }
  data = options.data;
  refresh = options.refresh;
  if (refresh == null) {
    refresh = false;
  }
  $current = $(selector);
  template = bone.templates[templateName];
  if (data != null) {
    templateString = template(data);
  } else {
    templateString = template();
  }
  if ($current.children().length !== 0) {
    info = $current.data('bone-mount');
    sameTemplate = info.template === templateName;
    sameData = info.data === data;
    if (sameTemplate && sameData && !refresh) {
      return false;
    }
    $current.children().remove();
  }
  $current.html(templateString);
  $current.data('bone-mount', {
    template: templateName,
    data: data
  });
  return true;
};
