import {
	isPermissionGranted,
	requestPermission,
} from "@tauri-apps/plugin-notification";
import {
	readTextFile,
	mkdir,
	exists,
	create,
	BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { AppConfiguration } from "./types";

export const getNotificationPermission = async () => {
	// Do you have permission to send a notification?
	let permissionGranted = await isPermissionGranted();

	// If not we need to request it
	if (!permissionGranted) {
		const permission = await requestPermission();
		permissionGranted = permission === "granted";
	}

	return permissionGranted;
};

export const getConfiguration = async () => {
	const fsOptions = { baseDir: BaseDirectory.AppConfig };
	const path = "settings/settings.json";
	const fileExists = await exists(path, fsOptions);
	let config: AppConfiguration = { duration: 15 };

	if (fileExists) {
		const file = await readTextFile(path, fsOptions);
		config = JSON.parse(file);
	} else {
		await mkdir("settings", { ...fsOptions, recursive: true });

		const encoded = new TextEncoder().encode(JSON.stringify(config));
		const file = await create(path, fsOptions);
		await file.write(encoded);
		await file.close();
	}

	return config;
};
