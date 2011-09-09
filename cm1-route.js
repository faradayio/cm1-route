var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}
var __require = require;

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require.resolve = (function () {
    var core = {
        'assert': true,
        'events': true,
        'fs': true,
        'path': true,
        'vm': true
    };
    
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = Object_keys(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.modules["path"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "path";
    
    var require = function (file) {
        return __require(file, ".");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, ".");
    };
    
    require.modules = __require.modules;
    __require.modules["path"]._cached = module.exports;
    
    (function () {
        function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
;
    }).call(module.exports);
    
    __require.modules["path"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/http-browserify/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/http-browserify";
    var __filename = "/node_modules/http-browserify/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/http-browserify");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/http-browserify");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/http-browserify/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"http-browserify","version":"0.0.2","description":"http module compatability for browserify","main":"index.js","browserify":"browser.js","directories":{"lib":".","example":"example","test":"test"},"devDependencies":{"express":"2.4.x","browserify":"1.4.x","sinon":"*","vows":"*"},"repository":{"type":"git","url":"http://github.com/substack/http-browserify.git"},"keywords":["http","browserify","compatible","meatless","browser"],"author":{"name":"James Halliday","email":"mail@substack.net","url":"http://substack.net"},"license":"MIT/X11","engine":{"node":">=0.4"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/http-browserify/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/http-browserify/browser.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/http-browserify";
    var __filename = "/node_modules/http-browserify/browser.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/http-browserify");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/http-browserify");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/http-browserify/browser.js"]._cached = module.exports;
    
    (function () {
        var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');

if (typeof window === 'undefined') {
    throw new Error('no window object present');
}

http.request = function (params, cb) {
    var req = Request.create(params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};
;
    }).call(module.exports);
    
    __require.modules["/node_modules/http-browserify/browser.js"]._cached = module.exports;
    return module.exports;
};

require.modules["events"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "events";
    
    var require = function (file) {
        return __require(file, ".");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, ".");
    };
    
    require.modules = __require.modules;
    __require.modules["events"]._cached = module.exports;
    
    (function () {
        if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = Array.isArray;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};
;
    }).call(module.exports);
    
    __require.modules["events"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/http-browserify/lib/request.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/http-browserify/lib";
    var __filename = "/node_modules/http-browserify/lib/request.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/http-browserify/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/http-browserify/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/http-browserify/lib/request.js"]._cached = module.exports;
    
    (function () {
        var EventEmitter = require('events').EventEmitter;
var Response = require('./response');

var Request = module.exports = function() {};

Request.prototype = new EventEmitter;

Request.create = function(params) {
    if (!params) params = {};

    var req;
    if(params.host && window.XDomainRequest) { // M$ IE XDR - use when host is set and XDR present
      req = new XdrRequest(params);
    } else {                                   // Everybody else
      req = new XhrRequest(params);
    }
    return req;
}

Request.prototype.init = function(params) {
    if (!params.host) params.host = window.location.host.split(':')[0];
    if (!params.port) params.port = window.location.port;
    
    this.body = '';
    if(!/^\//.test(params.path)) params.path = '/' + params.path;
    this.uri = params.host + ':' + params.port + (params.path || '/');
    this.xhr = new this.xhrClass;

    this.xhr.open(params.method || 'GET', 'http://' + this.uri, true);
};

Request.prototype.setHeader = function (key, value) {
    if ((Array.isArray && Array.isArray(value))
    || value instanceof Array) {
        for (var i = 0; i < value.length; i++) {
            this.xhr.setRequestHeader(key, value[i]);
        }
    }
    else {
        this.xhr.setRequestHeader(key, value);
    }
};

Request.prototype.write = function (s) {
    this.body += s;
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.write(s);
    this.xhr.send(this.body);
};


// XhrRequest

var XhrRequest = function(params) {
    var self = this;
    self.init(params);
    var xhr = this.xhr;
    
    if(params.headers) {
        Object.keys(params.headers).forEach(function (key) {
            var value = params.headers[key];
            if (Array.isArray(value)) {
                value.forEach(function (v) {
                    xhr.setRequestHeader(key, v);
                });
            }
            else xhr.setRequestHeader(key, value)
        });
    }
  
    xhr.onreadystatechange = function () {
        res.handle(xhr);
    };
    
    var res = new Response;
    res.on('ready', function () {
        self.emit('response', res);
    });
};

XhrRequest.prototype = new Request;

XhrRequest.prototype.xhrClass = function() {
    if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
}();



// XdrRequest

var XdrRequest = function(params) {
    var self = this;
    self.init(params);
    var xhr = this.xhr;

    self.headers = {};

    var res = new XdrResponse();

    xhr.onprogress = function() {
        xhr.readyState = 2;
        res.contentType = xhr.contentType; // There, that's all the headers you get
        res.handle(xhr);
    }
    xhr.onerror = function() {
        xhr.readyState = 3;
        xhr.error = "Who the fuck knows? IE doesn't care!";
        res.handle(xhr);
    };
    xhr.onload = function() {
        xdr.readyState = 4;
        res.handle(xhr);
    };

    res.on('ready', function () {
        self.emit('response', res);
    });
};

XdrRequest.prototype = new Request;

XdrRequest.prototype.xhrClass = window.XDomainRequest;



// XdrResponse

var XdrResponse = function() {
    this.offset = 0;
};

XdrResponse.prototype = new Response();

XdrResponse.prototype.getAllResponseHeaders = function() {
  return 'Content-Type: ' + this.contentType;
};
;
    }).call(module.exports);
    
    __require.modules["/node_modules/http-browserify/lib/request.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/http-browserify/lib/response.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/http-browserify/lib";
    var __filename = "/node_modules/http-browserify/lib/response.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/http-browserify/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/http-browserify/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/http-browserify/lib/response.js"]._cached = module.exports;
    
    (function () {
        var EventEmitter = require('events').EventEmitter;

var Response = module.exports = function (res) {
    this.offset = 0;
};

Response.prototype = new EventEmitter;

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
                if ((Array.isArray && Array.isArray(headers[key]))
                || headers[key] instanceof Array) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this.write(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this.write(res);
        
        if (res.error) {
            this.emit('error', res.responseText);
        }
        else this.emit('end');
    }
};

Response.prototype.write = function (res) {
    if (res.responseText.length > this.offset) {
        this.emit('data', res.responseText.slice(this.offset));
        this.offset = res.responseText.length;
    }
};
;
    }).call(module.exports);
    
    __require.modules["/node_modules/http-browserify/lib/response.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/cm1-route.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/cm1-route.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/cm1-route.js"]._cached = module.exports;
    
    (function () {
        if(!process.env) process.env = {};

var DirectionsFactory = require('./directions-factory'),
    DirectRailDirections = require('./directions/direct-rail-directions'),
    FlyingDirections = require('./directions/flying-directions'),
    FootprintedRoute = require('./footprinted-route'),
    GoogleDirections = require('./directions/google-directions'),
    HopStopDirections = require('./directions/hop-stop-directions');

var Cm1Route = module.exports = {
  NumberFormatter: require('./number-formatter'),
  DirectionsFactory: DirectionsFactory,
  FlyingDirections: FlyingDirections,
  GoogleDirections: GoogleDirections,
  HopStopDirections: HopStopDirections,
  DirectRailDirections: DirectRailDirections,

  // Get driving directions and associated emissions
  drive: function(origin, destination, callback) {
    var directions = new GoogleDirections(origin, destination, 'DRIVING');
    directions.routeWithEmissions(events.translateRouteCallback(callback));
  },

  // Get flying directions and associated emissions
  flight: function(origin, destination, callback) {
    var directions = new FlyingDirections(origin, destination);
    directions.routeWithEmissions(events.translateRouteCallback(callback));
  },

  // Get transit (bus, rail) directions and associated emissions
  transit: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'PUBLICTRANSIT', when);
    directions.routeWithEmissions(events.transitRailFallbackCallback(callback));
  },

  rail: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'SUBWAYING', when);
    directions.routeWithEmissions(events.transitRailFallbackCallback(callback));
  },

  bus: function(origin, destination, when, callback) {
    var directions = new HopStopDirections(origin, destination, 'BUSSING', when);
    directions.routeWithEmissions(events.transitRailFallbackCallback(callback));
  },

  shouldDefaultTransitToDirectRoute: function(err) {
    err = err ? err : false;
    var walkingError = (err && err.name == 'AllWalkingSegmentsError');
    return (walkingError && process.env.TRANSIT_DIRECT_DEFAULT.toString() == 'true');
  }
};

var events = {
  translateRouteCallback: function(callback) {
    return function(err, directions) {
      if(err) {
        callback(err);
      } else {
        callback(err, new FootprintedRoute(directions));
      }
    };
  },

  transitRailFallbackCallback: function(callback) {
    return function(err, hopStopDirections) {
      if(Cm1Route.shouldDefaultTransitToDirectRoute(err)) {
        console.log('falling back to direct rail');
        var directDirections = new DirectRailDirections(
            hopStopDirections.origin, hopStopDirections.destination);
        directDirections.routeWithEmissions(events.translateRouteCallback(callback));
      } else {
        callback(err, new FootprintedRoute(hopStopDirections));
      }
    };
  }
};
;
    }).call(module.exports);
    
    __require.modules["/lib/cm1-route.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions-factory.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/directions-factory.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions-factory.js"]._cached = module.exports;
    
    (function () {
        var FlyingDirections = require('./directions/flying-directions'),
    GoogleDirections = require('./directions/google-directions'),
    HopStopDirections = require('./directions/hop-stop-directions');

var DirectionsFactory = module.exports = {
  create: function(origin, destination, mode, day, time) {
    if(mode == 'PUBLICTRANSIT' || mode == 'SUBWAYING' || mode == 'BUSSING') {
      return new HopStopDirections(origin, destination, mode, day, time);
    } else if(mode == 'FLYING') {
      return new FlyingDirections(origin, destination, mode);
    } else {
      return new GoogleDirections(origin, destination, mode);
    }
  }
};

;
    }).call(module.exports);
    
    __require.modules["/lib/directions-factory.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions/flying-directions.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/directions";
    var __filename = "/lib/directions/flying-directions.js";
    
    var require = function (file) {
        return __require(file, "/lib/directions");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/directions");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions/flying-directions.js"]._cached = module.exports;
    
    (function () {
        var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter'),
    TimeFormatter = require('../time-formatter');

var async = require('async');

var FlyingDirections = module.exports = function(origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'FLYING';
  this.geocoder = new google.maps.Geocoder();
}
FlyingDirections.prototype = new Directions();

FlyingDirections.RouteTooShortError = function (message) {  
  this.prototype = Error.prototype;  
  this.name = 'RouteTooShortError';  
  this.message = (message) ? message : "Route isn't long enough for a flight";  
};

FlyingDirections.events = new DirectionsEvents;

FlyingDirections.prototype.route = function (callback) {
  async.parallel({
    origin: FlyingDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: FlyingDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, FlyingDirections.events.onGeocodeFinish(this, callback));
};

FlyingDirections.prototype.calculateDistance = function() {
  this.distance = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
};

FlyingDirections.prototype.duration = function() {
  var rate = 0.0056818;  // that's like 400mph
  return rate * this.distance;
}

FlyingDirections.prototype.totalTime = function() {
  return TimeFormatter.format(this.duration());
};

FlyingDirections.prototype.isLongEnough = function() {
  return this.distance > 115000;
};


// Events

FlyingDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) return callback(err, directions);

    directions.calculateDistance();

    if(!directions.isLongEnough())
      return callback(new FlyingDirections.RouteTooShortError, directions);

    var steps = [{
      travel_mode: 'FLYING',
      distance: { value: directions.distance },
      duration: { value: directions.duration() },
      instructions: NumberFormatter.metersToMiles(directions.distance) + ' mile flight',
      start_position: {
        lat: directions.originLatLng.lat(),
        lon: directions.originLatLng.lng()
      },
      end_position: {
        lat: directions.destinationLatLng.lat(),
        lon: directions.destinationLatLng.lng()
      }
    }];

    var directionsResult = { routes: [{
      legs: [{
        duration: { value: directions.duration() },
        distance: { value: directions.distance },
        steps: steps
      }],
      warnings: [],
      bounds: GoogleDirectionsRoute.generateBounds(steps)
    }]};
    directions.storeRoute(directionsResult);

    callback(null, directions);
  };
};
;
    }).call(module.exports);
    
    __require.modules["/lib/directions/flying-directions.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/directions.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions.js"]._cached = module.exports;
    
    (function () {
        var async = require('async');

var DirectionsEvents = require('./directions-events'),
    FootprintedRoute = require('./footprinted-route'),
    SegmentFactory = require('./segment-factory'),
    TimeFormatter = require('./time-formatter');

var Directions = module.exports = function(origin, destination, mode) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode;
};

Directions.events = new DirectionsEvents();

Directions.prototype.storeRoute = function(result) {
  this.directionsResult = result;
  this.steps = result.routes[0].legs[0].steps;
  this.segments = [];
  for(var i = 0; i < this.steps.length; i++) {
    var step = this.steps[i];
    this.segments.push(SegmentFactory.create(i, step));
  }
  this.calculateDistance();
};

Directions.prototype.eachSegment = function(lambda) {
  if(!this.segments) throw new Error("Directions haven't been routed yet.");
  for(var i = 0; i < this.segments.length; i++) {
    lambda(this.segments[i]);
  }
};

Directions.prototype.getEmissions = function(callback, segmentCallback) {
  this.totalEmissions = 0.0;
  directions = this;

  async.forEach(
    this.segments,
    function(segment, asyncCallback) {
      segment.getEmissionEstimate(
        Directions.events.onSegmentGetEmissionEstimate(directions, segmentCallback, asyncCallback));
    },
    function(err) {
      callback(err, directions);
    }
  );
};

Directions.prototype.totalTime = function() {
  var totalTime = 0;
  this.eachSegment(function(segment) {
    totalTime += segment.duration;
  });
  return TimeFormatter.format(totalTime);
};

Directions.prototype.routeWithEmissions = function(callback) {
  var directions = this;

  async.series([
    function(asyncCallback) { directions.route(asyncCallback); },
    function(asyncCallback) { directions.getEmissions(asyncCallback); }
  ], function(err) {
    callback(err, directions);
  });
};
;
    }).call(module.exports);
    
    __require.modules["/lib/directions.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/async/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/async";
    var __filename = "/node_modules/async/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/async");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/async");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/async/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"async","description":"Higher-order functions and common patterns for asynchronous code","main":"./index","author":"Caolan McMahon","version":"0.1.9","repository":{"type":"git","url":"http://github.com/caolan/async.git"},"bugs":{"web":"http://github.com/caolan/async/issues"},"licenses":[{"type":"MIT","url":"http://github.com/caolan/async/raw/master/LICENSE"}]};
    }).call(module.exports);
    
    __require.modules["/node_modules/async/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/async/index.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/async";
    var __filename = "/node_modules/async/index.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/async");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/async");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/async/index.js"]._cached = module.exports;
    
    (function () {
        // This file is just added for convenience so this repository can be
// directly checked out into a project's deps folder
module.exports = require('./lib/async');
;
    }).call(module.exports);
    
    __require.modules["/node_modules/async/index.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/async/lib/async.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/async/lib";
    var __filename = "/node_modules/async/lib/async.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/async/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/async/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/async/lib/async.js"]._cached = module.exports;
    
    (function () {
        /*global setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root = this,
        previous_async = root.async;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    else {
        root.async = async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    //// cross-browser compatiblity functions ////

    var _forEach = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _forEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    var _indexOf = function (arr, item) {
        if (arr.indexOf) {
            return arr.indexOf(item);
        }
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        async.nextTick = function (fn) {
            setTimeout(fn, 0);
        };
    }
    else {
        async.nextTick = process.nextTick;
    }

    async.forEach = function (arr, iterator, callback) {
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, function (x) {
            iterator(x, function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                }
            });
        });
    };

    async.forEachSeries = function (arr, iterator, callback) {
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEach].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.forEachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);


    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.forEachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.forEach(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var completed = [];

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            _forEach(listeners, function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (completed.length === keys.length) {
                callback(null);
            }
        });

        _forEach(keys, function (k) {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                if (err) {
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    completed.push(k);
                    taskComplete();
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && _indexOf(completed, x) !== -1);
                }, true);
            };
            if (ready()) {
                task[task.length - 1](taskCallback);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = function (tasks, callback) {
        if (!tasks.length) {
            return callback();
        }
        callback = callback || function () {};
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.nextTick(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    async.parallel = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEach(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.queue = function (worker, concurrency) {
        var workers = 0;
        var tasks = [];
        var q = {
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push: function (data, callback) {
                tasks.push({data: data, callback: callback});
                if(q.saturated && tasks.length == concurrency) q.saturated();
                async.nextTick(q.process);
            },
            process: function () {
                if (workers < q.concurrency && tasks.length) {
                    var task = tasks.splice(0, 1)[0];
                    if(q.empty && tasks.length == 0) q.empty();
                    workers += 1;
                    worker(task.data, function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if(q.drain && tasks.length + workers == 0) q.drain();
                        q.process();
                    });
                }
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return workers;
            }
        };
        return q;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _forEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        hasher = hasher || function (x) {
            return x;
        };
        return function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                callback.apply(null, memo[key]);
            }
            else {
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    callback.apply(null, arguments);
                }]));
            }
        };
    };

}());
;
    }).call(module.exports);
    
    __require.modules["/node_modules/async/lib/async.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions-events.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/directions-events.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions-events.js"]._cached = module.exports;
    
    (function () {
        var DirectionsEvents = module.exports = function() {
  // Geocode using GMaps API and assign first result to property
  this.geocode = function(directions, addressProperty, property) {
    return function(callback) {
      var address = directions[addressProperty];

      if(address.lat) {
        directions[property] = address;
        return callback(null, [{geometry: { location: address }}]);
      }

      directions.geocoder.geocode({ address: address }, function(results) {
        if(results.length > 0) {
          directions[property] = results[0].geometry.location;
          callback(null, results);
        } else {
          var err = new DirectionsEvents.GeocodeError('Google returned no geocoding results for ' + address);
          callback(err, directions);
        }
      });
    };
  };

  this.onSegmentGetEmissionEstimate = function(directions, segmentCallback, asyncCallback) {
    return function(err, emissionEstimate) {
      directions.totalEmissions += emissionEstimate.value();
      if(segmentCallback) segmentCallback(err, emissionEstimate);
      asyncCallback(err);
    };
  };
};

DirectionsEvents.GeocodeError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'GeocodeError';
  this.message = (message) ? message : 'Failed to goecode';
};
;
    }).call(module.exports);
    
    __require.modules["/lib/directions-events.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/footprinted-route.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/footprinted-route.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/footprinted-route.js"]._cached = module.exports;
    
    (function () {
        var FootprintedRoute = module.exports = function(directions) {
  this.route = directions.steps;
  this.distance = directions.distance;
  this.emissions = this.translateEmissions(directions.totalEmissions);
};

FootprintedRoute.prototype.translateEmissions = function(totalEmissions) {
  var pounds = totalEmissions * 2.20462262;
  var tons = pounds / 2000;
  return {
    kilograms: totalEmissions,
    pounds: pounds,
    tons: tons
  };
};
;
    }).call(module.exports);
    
    __require.modules["/lib/footprinted-route.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment-factory.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/segment-factory.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment-factory.js"]._cached = module.exports;
    
    (function () {
        var AmtrakingSegment = require('./segment/amtraking-segment'),
    BicyclingSegment = require('./segment/bicycling-segment'),
    BussingSegment = require('./segment/bussing-segment'),
    CommuterRailingSegment = require('./segment/commuter-railing-segment'),
    DrivingSegment = require('./segment/driving-segment'),
    FlyingSegment = require('./segment/flying-segment'),
    LightRailingSegment = require('./segment/light-railing-segment'),
    SubwayingSegment = require('./segment/subwaying-segment'),
    WalkingSegment = require('./segment/walking-segment');

var SegmentFactory = module.exports = {
  create: function(index, step) {
    if(step.travel_mode == 'DRIVING') {
      return new DrivingSegment(index, step);
    } else if(step.travel_mode == 'WALKING' || step.travel_mode == 'ENTRANCEEXIT') {
      return new WalkingSegment(index, step);
    } else if(step.travel_mode == 'BICYCLING') {
      return new BicyclingSegment(index, step);
    } else if(step.travel_mode == 'SUBWAYING') {
      return new SubwayingSegment(index, step);
    } else if(step.travel_mode == 'BUSSING') {
      return new BussingSegment(index, step);
    } else if(step.travel_mode == 'LIGHTRAILING') {
      return new LightRailingSegment(index, step);
    } else if(step.travel_mode == 'FLYING') {
      return new FlyingSegment(index, step);
    } else if(step.travel_mode == 'AMTRAKING') {
      return new AmtrakingSegment(index, step);
    } else if(step.travel_mode == 'COMMUTERRAILING') {
      return new CommuterRailingSegment(index, step);
    } else {
      throw "Could not create a Segment for travel_mode: " + step.travel_mode;
    }
  }
};
;
    }).call(module.exports);
    
    __require.modules["/lib/segment-factory.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/amtraking-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/amtraking-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/amtraking-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var AmtrakingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'intercity rail';
}
AmtrakingSegment.prototype = new HopStopSegment();

CM1.emitter(AmtrakingSegment, function(emitter) {
  emitter.emitAs('rail_trip');
  emitter.provide('distance', { as: 'distance_estimate' });
  emitter.provide('duration');
  emitter.provide('rail_class');
})
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/amtraking-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/CM1/package.json"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/CM1";
    var __filename = "/node_modules/CM1/package.json";
    
    var require = function (file) {
        return __require(file, "/node_modules/CM1");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/CM1");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/CM1/package.json"]._cached = module.exports;
    
    (function () {
        module.exports = {"name":"CM1","version":"0.2.1","author":"Derek Kastner <dkastner@gmail.com>","description":"JavaScript API for Brighter Planet's CM1 carbon/impact calculation service","homepage":"http://github.com/brighterplanet/CM1.js","main":"lib/cm1.js","engine":"*","devDependencies":{"browserify":"*","coffeescript":"*","http-browserify":"*","jsdom":"*","sinon":"*","vows":"*"},"repository":{"type":"git","url":"https://github.com/brighterplanet/CM1.js.git"}};
    }).call(module.exports);
    
    __require.modules["/node_modules/CM1/package.json"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/CM1/lib/cm1.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/CM1/lib";
    var __filename = "/node_modules/CM1/lib/cm1.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/CM1/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/CM1/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/CM1/lib/cm1.js"]._cached = module.exports;
    
    (function () {
        var EmissionEstimate = require('./emission-estimate'),
  EmissionEstimator = require('./emission-estimator');

var CM1 = module.exports = function() {
  this.attribute_map = {};
};
CM1.EmissionEstimate = EmissionEstimate;
CM1.EmissionEstimator = EmissionEstimator;

CM1.prototype.key = function() {
  return CM1.key;
};

CM1.emitter = function(klass, definition) {
  klass.cm1 = new CM1();
  klass.cm1.define(definition);
  klass.prototype.emissionEstimator = function() {
    if(!this._emissionEstimator) {
      this._emissionEstimator = new EmissionEstimator(this, klass.cm1);
    }

    return this._emissionEstimator;
  };
  klass.prototype.getEmissionEstimate = function(callback) {
    return this.emissionEstimator().getEmissionEstimate(callback);
  };
};

CM1.prototype.define = function(lambda) {
  lambda(this);
};

CM1.prototype.emitAs = function(emitter_name) {
  this.emitter_name = emitter_name;
};

CM1.prototype.provide = function(attribute, options) {
  var actual_field;
  if(options && options.as) {
    actual_field = options.as;
  } else {
    actual_field = attribute;
  }

  this.attribute_map[attribute] = actual_field;
};
;
    }).call(module.exports);
    
    __require.modules["/node_modules/CM1/lib/cm1.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/CM1/lib/emission-estimate.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/CM1/lib";
    var __filename = "/node_modules/CM1/lib/emission-estimate.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/CM1/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/CM1/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/CM1/lib/emission-estimate.js"]._cached = module.exports;
    
    (function () {
        var EmissionEstimate = module.exports = function(emitter, data) {
  this.emitter = emitter;
  this.data = data;
  proxyDataProperties(this, data);
};

EmissionEstimate.prototype.value = function() {
  return this.data.emission;
};

EmissionEstimate.prototype.toString = function() {
  return this.value().toString();
};

var proxyDataProperties = function(estimate, data) {
  for (var property in data) {
    if (property == 'clone' || property == 'emitter') continue;
    estimate[property] = data[property];
  }
};
;
    }).call(module.exports);
    
    __require.modules["/node_modules/CM1/lib/emission-estimate.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/node_modules/CM1/lib/emission-estimator.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/node_modules/CM1/lib";
    var __filename = "/node_modules/CM1/lib/emission-estimator.js";
    
    var require = function (file) {
        return __require(file, "/node_modules/CM1/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/node_modules/CM1/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/node_modules/CM1/lib/emission-estimator.js"]._cached = module.exports;
    
    (function () {
        var http = require('http');

var EmissionEstimate = require('./emission-estimate');

var EmissionEstimator = module.exports = function(emitter, cm1) {
  this.emitter = emitter;
  this.cm1 = cm1;
  this.host = 'carbon.brighterplanet.com';
};

EmissionEstimator.prototype.pluralize = function(str) {
  return str + 's';
}

EmissionEstimator.prototype.path = function() {
  return this.pluralize(this.cm1.emitter_name) + '.json';
};

EmissionEstimator.prototype.params = function() {
  var params = {};
  for(var attribute in this.cm1.attribute_map) {
    var cm1_field = this.cm1.attribute_map[attribute];
    var value = this.emitter[attribute];
    var result;
    if(value) 
      result = value;
    if(typeof result == 'function')
      result = result.apply(this.emitter);
    if(result)
      params[cm1_field] = result;
  }

  if(this.cm1.key()) {
    params.key = this.cm1.key();
  }

  return params;
};

EmissionEstimator.prototype.getEmissionEstimate = function(callback) {
  var emitter = this.emitter;
  var req = http.request({
    host: this.host, port: 80, path: this.path(),
    method: 'POST',
    headers: { 'content-type': 'application/json' }
  }, function (res) {
    var data = '';
    res.on('data', function (buf) {
      data += buf;
    });

    res.on('error', function() {
      var err = new Error('Failed to get emission estimate: ' + data);
      callback(err);
    });

    res.on('end', function () {
      var json = JSON.parse(data);
      emitter.emissionEstimate = new EmissionEstimate(emitter, json);
      callback(null, emitter.emissionEstimate);
    });
  });
  req.end(JSON.stringify(this.params()));
};
;
    }).call(module.exports);
    
    __require.modules["/node_modules/CM1/lib/emission-estimator.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/hop-stop-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/hop-stop-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/hop-stop-segment.js"]._cached = module.exports;
    
    (function () {
        var Segment = require('../segment');

var HopStopSegment = module.exports = function() {};
HopStopSegment.prototype = new Segment();

HopStopSegment.prototype.durationInMinutes = function() {
  if(this.duration)
    return this.duration / 60;
};
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/hop-stop-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/segment.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment.js"]._cached = module.exports;
    
    (function () {
        var Segment = module.exports = function() {};
;
    }).call(module.exports);
    
    __require.modules["/lib/segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/bicycling-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/bicycling-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/bicycling-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    Segment = require('../segment');

var BicyclingSegment = module.exports = function(index, step) {
  this.index = index;
  this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'BICYCLING';
}
BicyclingSegment.prototype = new Segment();

BicyclingSegment.prototype.getEmissionEstimate = function(callback) {
  var estimate = new CM1.EmissionEstimate(this, {
    emission: 0,
    methodology: ''
  });
  callback(null, estimate);
};
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/bicycling-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/bussing-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/bussing-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/bussing-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var BussingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.bus_class = 'city transit';
  this.mode = 'BUSSING';
}
BussingSegment.prototype = new HopStopSegment();

CM1.emitter(BussingSegment, function(emitter) {
  emitter.emitAs('bus_trip');
  emitter.provide('distance');
  emitter.provide('durationInMinutes', { as: 'duration' });
  emitter.provide('bus_class');
});
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/bussing-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/commuter-railing-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/commuter-railing-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/commuter-railing-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var CommuterRailingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'commuter rail';
}
CommuterRailingSegment.prototype = new HopStopSegment();

CM1.emitter(CommuterRailingSegment, function(emitter) {
  emitter.emitAs('rail_trip');
  emitter.provide('distance', { as: 'distance_estimate' });
  emitter.provide('duration');
  emitter.provide('rail_class');
})
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/commuter-railing-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/driving-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/driving-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/driving-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    Segment = require('../segment');

var DrivingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'DRIVING';
}
DrivingSegment.prototype = new Segment();

CM1.emitter(DrivingSegment, function(emitter) {
  emitter.emitAs('automobile_trip');
  emitter.provide('distance');
});
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/driving-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/flying-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/flying-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/flying-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    Segment = require('../segment');

var FlyingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  this.instructions = step.instructions;
  this.trips = 1;
  this.mode = 'FLYING';
}
FlyingSegment.prototype = new Segment();

CM1.emitter(FlyingSegment, function(emitter) {
  emitter.emitAs('flight');
  emitter.provide('distance', { as: 'distance_estimate' });
  emitter.provide('trips');
});
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/flying-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/light-railing-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/light-railing-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/light-railing-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var LightRailingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'light rail';
}
LightRailingSegment.prototype = new HopStopSegment();

CM1.emitter(LightRailingSegment, function(emitter) {
  emitter.emitAs('rail_trip');
  emitter.provide('distance', { as: 'distance_estimate' });
  emitter.provide('duration');
  emitter.provide('rail_class');
})
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/light-railing-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/subwaying-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/subwaying-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/subwaying-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    HopStopSegment = require('./hop-stop-segment');

var SubwayingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.rail_class = 'heavy rail';
  this.mode = 'SUBWAYING';
}
SubwayingSegment.prototype = new HopStopSegment();

CM1.emitter(SubwayingSegment, function(emitter) {
  emitter.emitAs('rail_trip');
  emitter.provide('distance', { as: 'distance_estimate' });
  emitter.provide('duration');
  emitter.provide('rail_class');
});
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/subwaying-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/segment/walking-segment.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/segment";
    var __filename = "/lib/segment/walking-segment.js";
    
    var require = function (file) {
        return __require(file, "/lib/segment");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/segment");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/segment/walking-segment.js"]._cached = module.exports;
    
    (function () {
        var CM1 = require('CM1'),
    Segment = require('../segment');

var WalkingSegment = module.exports = function(index, step) {
  this.index = index;
  if(step.distance)
    this.distance = parseFloat(step.distance.value) / 1000.0;
  if(step.duration)
    this.duration = step.duration.value;
  this.instructions = step.instructions;
  this.mode = 'WALKING';
};
WalkingSegment.prototype = new Segment();

WalkingSegment.prototype.getEmissionEstimate = function(callback) {
  var estimate = new CM1.EmissionEstimate(this, {
    emission: 0,
    methodology: ''
  });
  callback(null, estimate);
};
;
    }).call(module.exports);
    
    __require.modules["/lib/segment/walking-segment.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/time-formatter.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/time-formatter.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/time-formatter.js"]._cached = module.exports;
    
    (function () {
        var TimeFormatter = module.exports = {
  format: function(seconds) {
    if(seconds == 0)
      return '';

    var parts = this.getParts(seconds);
    var output = [];
    if(parts.hours > 0) {
      output.push(parts.hours + ' hrs');
    }

    if(parts.minutes != null) {
      if(parts.minutes != 1) {
        output.push(parts.minutes + ' mins');
      } else {
        output.push(parts.minutes + ' min');
      }
    }

    return output.join(', ');
  },

  getParts: function(seconds) {
    var result = {};
    var hours = Math.floor(seconds / 3600);
    if(hours > 0)
      result.hours = hours;

    var minutes = Math.ceil((seconds - (hours * 3600)) / 60);
    if(hours == 0 || minutes > 0)
      result.minutes = minutes;
    
    return result;
  }
};
;
    }).call(module.exports);
    
    __require.modules["/lib/time-formatter.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions/google-directions-route.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/directions";
    var __filename = "/lib/directions/google-directions-route.js";
    
    var require = function (file) {
        return __require(file, "/lib/directions");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/directions");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions/google-directions-route.js"]._cached = module.exports;
    
    (function () {
        var GoogleDirectionsRoute = module.exports = function(hopstopData) {
  this.hopstopData = hopstopData;
  this.copyrights = 'Copyright HopStop.com, Inc.';
  this.overview_path = GoogleDirectionsRoute.generateOverviewPath(hopstopData.steps);
  this.legs = [{
    duration: { value: this.hopstopData.duration },
    start_address: '',
    start_location: this.overview_path[0],
    end_address: '',
    end_location: this.overview_path[this.overview_path.length - 1],
    steps: GoogleDirectionsRoute.generateSteps(this.hopstopData.steps),
    via_waypoints: []
  }];
  this.warnings = [];
  this.bounds = GoogleDirectionsRoute.generateBounds(this.hopstopData.steps);
};

GoogleDirectionsRoute.generateOverviewPath = function(steps) {
  var path = [];
  for(i in steps) {
    var step = steps[i];
    if(step.start_position) {
      var startLatLng = new google.maps.LatLng(
        step.start_position.lat, step.start_position.lon );
      path.push(startLatLng);
      var endLatLng = new google.maps.LatLng(
          step.end_position.lat, step.end_position.lon);
      path.push(endLatLng);
    }
  }

  return path;
};

GoogleDirectionsRoute.generateBounds = function(steps) {
  var coords = {};

  for(i in steps) {
    var step = steps[i];
    coords = GoogleDirectionsRoute.recordCoords(step.start_position, coords);
    coords = GoogleDirectionsRoute.recordCoords(step.end_position, coords);
  }

  if(coords.sWLat != null && coords.sWLng != null && 
     coords.nELat != null && coords.nELng != null) {
    var southWest = new google.maps.LatLng(coords.sWLat, coords.sWLng);
    var northEast = new google.maps.LatLng(coords.nELat, coords.nELng);
    return new google.maps.LatLngBounds(southWest, northEast);
  } else {
    return null;
  }
};

GoogleDirectionsRoute.recordCoords = function(position, coords) {
  if(position) {
    var lat = position.lat;
    var lng = position.lon;
    coords.sWLat = (coords.sWLat == null ? lat : Math.min(coords.sWLat, lat));
    coords.sWLng = (coords.sWLng == null ? lng : Math.min(coords.sWLng, lng));
    coords.nELat = (coords.nELat == null ? lat : Math.max(coords.nELat, lat));
    coords.nELng = (coords.nELng == null ? lng : Math.max(coords.nELng, lng));
  }

  return coords;
};

GoogleDirectionsRoute.generateSteps = function(steps) {
  var googleSteps = [];

  for(i in steps) {
    var step = steps[i];
    var googleStep = {};

    googleStep.duration = step.duration;
    googleStep.instructions = step.instructions;
    googleStep.travel_mode = step.travel_mode;
    googleStep.path = [];

    if(step.start_position) {
      googleStep.start_location = new google.maps.LatLng(step.start_position.lat, step.start_position.lon);
      googleStep.path.push(googleStep.start_location);
    }
    if(step.end_position) {
      googleStep.end_location = new google.maps.LatLng(step.end_position.lat, step.end_position.lon);
      googleStep.path.push(googleStep.end_location);
    }

    googleSteps.push(googleStep);
  }

  return googleSteps;
};
;
    }).call(module.exports);
    
    __require.modules["/lib/directions/google-directions-route.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/number-formatter.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/number-formatter.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/number-formatter.js"]._cached = module.exports;
    
    (function () {
        var NumberFormatter = module.exports  = {
  kilogramsToPounds: function(num) {
    return (Math.round(num * 100 * 2.2046) / 100);
  },
  metersToMiles: function(num) {
    return (Math.round((num / 1609.3) * 100) / 100);
  }
};
;
    }).call(module.exports);
    
    __require.modules["/lib/number-formatter.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions/google-directions.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/directions";
    var __filename = "/lib/directions/google-directions.js";
    
    var require = function (file) {
        return __require(file, "/lib/directions");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/directions");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions/google-directions.js"]._cached = module.exports;
    
    (function () {
        var Directions = require('../directions');

var GoogleDirections = module.exports = function(origin, destination, mode) {
  this.origin = origin
  this.destination = destination
  this.mode = mode
}
GoogleDirections.prototype = new Directions

GoogleDirections.GoogleRouteError = function(message) {
  this.prototype = Error.prototype;  
  this.name = 'GoogleRouteError';  
  this.message = (message) ? message : 'Google failed to get a route';  
};

GoogleDirections.prototype.directionsService = function() {
  if(!this._directionsService) {
    this._directionsService = new google.maps.DirectionsService()
  }

  return this._directionsService
};

GoogleDirections.prototype.route = function(callback) {
  var request = {
    origin: this.origin, 
    destination: this.destination,
    travelMode: this.mode
  };
  this.directionsService().
    route(request,
          GoogleDirections.events.directionsServiceRouteCallback(this, callback));
};

GoogleDirections.prototype.calculateDistance = function() {
  this.distance = this.directionsResult.routes[0].legs[0].distance.value;
};

// Events

GoogleDirections.events = {
  directionsServiceRouteCallback: function(directions, callback) {
    return function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directions.storeRoute(result);
        callback(null, directions)
      } else {
        var err = new GoogleDirections.GoogleRouteError('Failed to get route from google: ' + status);
        callback(err);
      }
    };
  }
};
;
    }).call(module.exports);
    
    __require.modules["/lib/directions/google-directions.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions/hop-stop-directions.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/directions";
    var __filename = "/lib/directions/hop-stop-directions.js";
    
    var require = function (file) {
        return __require(file, "/lib/directions");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/directions");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions/hop-stop-directions.js"]._cached = module.exports;
    
    (function () {
        var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    HootrootApi = require('../hootroot-api'),
    WalkingSegment = require('../segment/walking-segment');
var async = require('async'),
    http = require('http');

var HopStopDirections = module.exports = function(origin, destination, mode, when) {
  this.origin = origin;
  this.destination = destination;
  this.mode = mode || 'PUBLICTRANSIT';
  this.when = when || 'now';
  this.geocoder = new google.maps.Geocoder();
}
HopStopDirections.prototype = new Directions;

HopStopDirections.AllWalkingSegmentsError = function(message) {
  this.prototype = Error.prototype;
  this.name = 'AllWalkingSegmentsError';
  this.message = (message) ? message : 'All segments are walking segments';
};

HopStopDirections.events = new DirectionsEvents();

HopStopDirections.prototype.route = function(callback) {
  var directions = this;
  async.parallel({
    origin: HopStopDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: HopStopDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, function(err, geocodes) {
    if(err) {
      callback(err, directions);
    } else {
      async.series({
        hopstop: HopStopDirections.events.fetchHopStop(directions),
      }, HopStopDirections.events.processHopStop(directions, callback));
    }
  });
};

HopStopDirections.prototype.isAllWalkingSegments = function() {
  var result = true;
  this.eachSegment(function(segment) {
    result = result && segment instanceof WalkingSegment;
  });
  return result;
};

HopStopDirections.prototype.calculateDistance = function() {
  this.distance = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
};

HopStopDirections.prototype.shouldDefaultToDirectRoute = function() {
  return process.env && process.env.HOPSTOP_DEFAULT_DIRECT
};


// Events

HopStopDirections.events.fetchHopStop = function(directions) {
  return function(callback) {
    var params = {
      x1: directions.originLatLng.lng(), 
      y1: directions.originLatLng.lat(), 
      x2: directions.destinationLatLng.lng(), 
      y2: directions.destinationLatLng.lat(), 
      mode: directions.mode,
      when: directions.when
    };

    HootrootApi.hopstop(params, callback);
  };
};

HopStopDirections.events.processHopStop = function(directions, callback) {
  return function(err, results) {
    if(err) return callback(err, directions);

    var directionsResult = { routes: [new GoogleDirectionsRoute(results.hopstop)] };
    directions.storeRoute(directionsResult);

    err = null;
    if(directions.isAllWalkingSegments()) {
      err = new HopStopDirections.AllWalkingSegmentsError('Invalid Hopstop route: all segments are walking segments');
    }
    callback(err, directions);
  };
};
;
    }).call(module.exports);
    
    __require.modules["/lib/directions/hop-stop-directions.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/hootroot-api.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib";
    var __filename = "/lib/hootroot-api.js";
    
    var require = function (file) {
        return __require(file, "/lib");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/hootroot-api.js"]._cached = module.exports;
    
    (function () {
        var http = require('http');

var HootrootApi = module.exports = {
  hopstop: function(params, callback) {
    var query  = '?x1=' + params.x1;
        query += '&y1=' + params.y1;
        query += '&x2=' + params.x2;
        query += '&y2=' + params.y2;
        query += '&mode=' + params.mode;
        query += '&when=' + params.when;
    var request = http.request({
      host: 'cm1-route.brighterplanet.com', port: 80, path: '/hopstops' + query,
      method: 'GET',
      headers: { ContentType: 'application/json' }
    }, function (response) {
      if(response.statusCode >= 300) {
        callback(new Error('HTTP request for Hopstop failed: ' + response.statusCode));
      } else {
        var data = '';
        response.on('data', function (buf) {
          data += buf;
        });
        response.on('error', function() { callback('HTTP request for Hopstop failed: ' + data) });

        response.on('end', function () {
          var json = JSON.parse(data);
          callback(null, json);
        });
      }
    });
    request.end();

    //var $ = require('jquery');

    //$.ajax({
      //url: '/hopstops',
      //data: request,
      //success: function(data) {
        //callback(null, data);
      //},
      //error: callback
    //});
  }
};
;
    }).call(module.exports);
    
    __require.modules["/lib/hootroot-api.js"]._cached = module.exports;
    return module.exports;
};

require.modules["/lib/directions/direct-rail-directions.js"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/lib/directions";
    var __filename = "/lib/directions/direct-rail-directions.js";
    
    var require = function (file) {
        return __require(file, "/lib/directions");
    };
    
    require.resolve = function (file) {
        return __require.resolve(name, "/lib/directions");
    };
    
    require.modules = __require.modules;
    __require.modules["/lib/directions/direct-rail-directions.js"]._cached = module.exports;
    
    (function () {
        var Directions = require('../directions'),
    DirectionsEvents = require('../directions-events'),
    GoogleDirectionsRoute = require('./google-directions-route'),
    NumberFormatter = require('../number-formatter');

var async = require('async');

var DirectRailDirections = function(origin, destination) {
  this.origin = origin;
  this.destination = destination;
  this.mode = 'PUBLICTRANSIT';
  this.geocoder = new google.maps.Geocoder();
}
DirectRailDirections.prototype = new Directions();

DirectRailDirections.events = new DirectionsEvents;

DirectRailDirections.prototype.route = function (callback) {
  async.parallel({
    origin: DirectRailDirections.events.geocode(this, 'origin', 'originLatLng'),
    destination: DirectRailDirections.events.geocode(this, 'destination', 'destinationLatLng')
  }, DirectRailDirections.events.onGeocodeFinish(this, callback));
};

DirectRailDirections.prototype.calculateDistance = function() {
  this.distance = google.maps.geometry.spherical.
    computeDistanceBetween(this.originLatLng, this.destinationLatLng);
};

DirectRailDirections.prototype.duration = function() {
  var rate = 0.0011;  // that's like 75mph
  return rate * this.distance;
}

DirectRailDirections.prototype.totalTime = function() {
  return TimeFormatter.format(this.duration());
};


// Events

DirectRailDirections.events.onGeocodeFinish = function(directions, callback) {
  return function(err) {
    if(err) return callback(err, directions);

    directions.calculateDistance();

    var steps = [{
      travel_mode: 'AMTRAKING',
      distance: { value: directions.distance },
      duration: { value: directions.duration() },
      instructions: NumberFormatter.metersToMiles(directions.distance) + ' mile rail trip',
      start_position: {
        lat: directions.originLatLng.lat(),
        lon: directions.originLatLng.lng()
      },
      end_position: {
        lat: directions.destinationLatLng.lat(),
        lon: directions.destinationLatLng.lng()
      }
    }];

    var directionsResult = { routes: [{
      legs: [{
        duration: { value: directions.duration() },
        distance: { value: directions.distance },
        steps: steps
      }],
      warnings: [],
      bounds: GoogleDirectionsRoute.generateBounds(steps)
    }]};
    directions.storeRoute(directionsResult);

    callback(null, directions);
  };
};

module.exports = DirectRailDirections;
;
    }).call(module.exports);
    
    __require.modules["/lib/directions/direct-rail-directions.js"]._cached = module.exports;
    return module.exports;
};

require.alias("http-browserify", "/node_modules/http");

process.nextTick(function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "/";
    var __filename = "//Users/dkastner/cm1-route";
    
    var require = function (file) {
        return __require(file, "/");
    };
    require.modules = __require.modules;
    
    Cm1Route = require('./lib/cm1-route');
;
});
