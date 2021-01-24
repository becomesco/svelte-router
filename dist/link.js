"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = void 0;
var core_1 = require("./core");
function link(element) {
    function click(event) {
        event.preventDefault();
        if (element.getAttribute("disabled") === "true") {
            return;
        }
        if (element.href.startsWith("http")) {
            core_1.Router.navigate("/" + element.href.split("/").splice(3).join("/"));
        }
        else {
            core_1.Router.navigate(element.href);
        }
    }
    element.addEventListener("click", click);
    return {
        destroy: function () {
            element.removeEventListener("click", click);
        },
    };
}
exports.link = link;
//# sourceMappingURL=link.js.map