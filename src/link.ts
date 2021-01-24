import { Router } from "./core";

export function link(element: HTMLAnchorElement) {
  function click(event: Event) {
    event.preventDefault();
    if (element.getAttribute("disabled") === "true") {
      return;
    }
    if (element.href.startsWith("http")) {
      Router.navigate("/" + element.href.split("/").splice(3).join("/"));
    } else {
      Router.navigate(element.href);
    }
  }
  element.addEventListener("click", click);
  return {
    destroy() {
      element.removeEventListener("click", click);
    },
  };
}
