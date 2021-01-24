import * as uuid from "uuid";

export interface Route {
  path: string;
  component: any;
  props?: any;
  children?: Route[];
}
export interface RouteOptions {
  data?: any;
  replace?: boolean;
  push?: boolean;
}
export interface RouteParams {
  [key: string]: string;
}
export interface RouterPrototype {
  setTitleSuffix(suffix: string): void;
  setTitle(title: string): void;
  listen(listener: RouterListener): void;
  register(routes: Route[], defaultRoute?: RouteInternal, base?: string): void;
  unregister(path: string): void;
  navigate(path: string, options?: RouteOptions): void;
  path(): string;
  subscribeToPathChange(callback: (path: string) => void): () => void;
  isAvailable(path: string): boolean;
  back(): void;
  forward(): void;
}

interface RouteInternal {
  path: string;
  component: any;
  props?: any;
}
type RouterRegistry = {
  [path: string]: {
    id: string;
    pathParts: string[];
    route: RouteInternal;
  };
};
type RouterListener = (
  component: any,
  params?: RouteParams,
  props?: any,
  options?: RouteOptions
) => void;

function getPathData(registry: RouterRegistry, pathParts: string[]) {
  for (const key in registry) {
    const reg = registry[key];
    if (reg.pathParts.length === pathParts.length) {
      const params: RouteParams = {};
      let match = true;
      for (const i in reg.pathParts) {
        if (reg.pathParts[i].charAt(0) === ":") {
          params[reg.pathParts[i].substring(1)] = pathParts[i];
        } else if (reg.pathParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return {
          component: reg.route.component,
          params,
          props: reg.route.props,
        };
      }
    }
  }
}
function onPathChange(
  registry: RouterRegistry,
  listener: RouterListener,
  defaultRoute: Route,
  path: string,
  options: RouteOptions
) {
  const exec = registry[path];
  if (exec) {
    listener(exec.route.component, {}, exec.route.props, options);
    return;
  }
  const pathParts = path.split("?")[0].split("/");
  const data = getPathData(registry, pathParts);
  if (data) {
    listener(data.component, data.params, data.props, options);
  } else {
    if (defaultRoute) {
      listener(defaultRoute.component, {}, defaultRoute.props, options);
    }
  }
}

function router() {
  const registry: RouterRegistry = {};
  const pathChangeSubs: Array<{
    id: string;
    callback: (path: string) => void;
  }> = [];
  let defaultRoute: Route;
  let currentPath = "";
  let listener: RouterListener;
  let suffix = "";

  window.addEventListener("popstate", () => {
    currentPath = window.location.pathname;
    push(window.location.pathname);
  });

  function push(path: string, options?: RouteOptions) {
    onPathChange(registry, listener, defaultRoute, path, options);
    pathChangeSubs.forEach((e) => {
      e.callback(path);
    });
  }

  const self: RouterPrototype = {
    setTitleSuffix(_suffix) {
      suffix = `| ${_suffix}`;
    },
    setTitle(title) {
      document.title = `${title} ${suffix}`;
    },
    listen(_listener) {
      listener = _listener;
    },
    register(_routes, dRoute, base) {
      if (dRoute) {
        defaultRoute = dRoute;
      }
      if (typeof base === "undefined") {
        base = "";
      }
      _routes.forEach((route) => {
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
    unregister(path) {
      if (registry[path]) {
        delete registry[path];
      }
    },
    navigate(path: string, options) {
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
          } else {
            window.history.pushState(options.data, "", path);
          }
        }
      } else {
        window.history.pushState(undefined, "", path);
      }
      push(path, options);
    },
    path() {
      return currentPath;
    },
    subscribeToPathChange(callback) {
      const id = uuid.v4();
      pathChangeSubs.push({
        id,
        callback,
      });
      return () => {
        for (let i = 0; i < pathChangeSubs.length; i++) {
          if (pathChangeSubs[i].id === id) {
            pathChangeSubs.splice(i, 1);
            break;
          }
        }
      };
    },
    isAvailable(path) {
      const pathParts = path.split("?")[0].split("/");
      const data = getPathData(registry, pathParts);
      return data ? true : false;
    },
    back() {
      window.history.back();
    },
    forward() {
      window.history.forward();
    },
  };
  return self;
}

export const Router = router();
