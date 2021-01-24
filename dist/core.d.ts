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
declare type RouterListener = (component: any, params?: RouteParams, props?: any, options?: RouteOptions) => void;
export declare const Router: RouterPrototype;
export {};
//# sourceMappingURL=core.d.ts.map