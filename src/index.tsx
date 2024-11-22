/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";

(() => {
	if (window.location.hostname !== "tauri.localhost") {
		return;
	}

	document.addEventListener(
		"contextmenu",
		(e) => {
			e.preventDefault();
			return false;
		},
		{ capture: true }
	);

	document.addEventListener(
		"selectstart",
		(e) => {
			e.preventDefault();
			return false;
		},
		{ capture: true }
	);
})();

render(() => <App />, document.getElementById("root") as HTMLElement);
