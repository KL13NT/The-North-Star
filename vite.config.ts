import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;
// @ts-expect-error process is a nodejs global
const target = process.env.TAURI_ENV_PLATFORM;
// @ts-expect-error process is a nodejs global
const debug = process.env.TAURI_ENV_DEBUG;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [solid(), solidSvg()],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
			  }
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
	build: {
		target: target === "windows" ? "chrome105" : "safari13",
		sourcemap: debug,
	},
}));
