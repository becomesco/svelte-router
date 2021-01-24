"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
var uuid = require("uuid");
function getPathData(registry, pathParts) {
    for (var key in registry) {
        var reg = registry[key];
        if (reg.pathParts.length === pathParts.length) {
            var params = {};
            var match = true;
            for (var i in reg.pathParts) {
                if (reg.pathParts[i].charAt(0) === ":") {
                    params[reg.pathParts[i].substring(1)] = pathParts[i];
                }
                else if (reg.pathParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return {
                    component: reg.route.component,
                    params: params,
                    props: reg.route.props,
                };
            }
        }
    }
}
function onPathChange(registry, listener, defaultRoute, path, options) {
    var exec = registry[path];
    if (exec) {
        listener(exec.route.component, {}, exec.route.props, options);
        return;
    }
    var pathParts = path.split("?")[0].split("/");
    var data = getPathData(registry, pathParts);
    if (data) {
        listener(data.component, data.params, data.props, options);
    }
    else {
        if (defaultRoute) {
            listener(defaultRoute.component, {}, defaultRoute.props, options);
        }
    }
}
function router() {
    var registry = {};
    var pathChangeSubs = [];
    var defaultRoute;
    var currentPath = "";
    var listener;
    var suffix = "";
    window.addEventListener("popstate", function () {
        currentPath = window.location.pathname;
        push(window.location.pathname);
    });
    function push(path, options) {
        onPathChange(registry, listener, defaultRoute, path, options);
        pathChangeSubs.forEach(function (e) {
            e.callback(path);
        });
    }
    var self = {
        setTitleSuffix: function (_suffix) {
            suffix = "| " + _suffix;
        },
        setTitle: function (title) {
            document.title = title + " " + suffix;
        },
        listen: function (_listener) {
            listener = _listener;
        },
        register: function (_routes, dRoute, base) {
            if (dRoute) {
                defaultRoute = dRoute;
            }
            if (typeof base === "undefined") {
                base = "";
            }
            _routes.forEach(function (route) {
                if (route.children) {
                    self.register(route.children, undefined, base + route.path);
                }
                registry[base + route.path] = {
                    id: uuid.v4(),
                    pathParts: (base + route.path).split("/"),
                    route: {
                        component: route.component,
                        path: route.path,
                        props: route.props,
                    },
                };
            });
        },
        unregister: function (path) {
            if (registry[path]) {
                delete registry[path];
            }
        },
        navigate: function (path, options) {
            if (path === currentPath) {
                currentPath = path;
                push(path, options);
                return;
            }
            currentPath = path;
            if (options) {
                if (!options.push) {
                    if (options.replace) {
                        window.history.replaceState(options.data, "", path);
                    }
                    else {
                        window.history.pushState(options.data, "", path);
                    }
                }
            }
            else {
                window.history.pushState(undefined, "", path);
            }
            push(path, options);
        },
        path: function () {
            return currentPath;
        },
        subscribeToPathChange: function (callback) {
            var id = uuid.v4();
            pathChangeSubs.push({
                id: id,
                callback: callback,
            });
            return function () {
                for (var i = 0; i < pathChangeSubs.length; i++) {
                    if (pathChangeSubs[i].id === id) {
                        pathChangeSubs.splice(i, 1);
                        break;
                    }
                }
            };
        },
        isAvailable: function (path) {
            var pathParts = path.split("?")[0].split("/");
            var data = getPathData(registry, pathParts);
            return data ? true : false;
        },
        back: function () {
            window.history.back();
        },
        forward: function () {
            window.history.forward();
        },
    };
    return self;
}
exports.Router = router();
//# sourceMappingURL=core.js.map