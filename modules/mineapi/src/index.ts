export * from "./commands";
import * as commands from "./commands";

// Import core packages
import db from "@inrixia/db";
import props from "properties";
import mcServerUtils from "minecraft-server-util";
import { promisify } from "util";
import { serverStdout } from "./lib/chat/chat";

const properties = promisify(props.parse);

// Threading
import { ThreadModule } from "@inrixia/threads";
export const thread = (module.parent as ThreadModule<{ serverPid: () => Promise<number> }>).thread;
export const { getCore, getThread } = prepGetThread(thread);

type ModuleSettings = {
	chat: {
		enabled: boolean;
		channels: string[];
	};
};

export const moduleSettings = db<ModuleSettings>("./_db/mineapi.json", {
	forceCreate: true,
	updateOnExternalChanges: true,
	pretty: true,
	template: {
		chat: {
			enabled: false,
			channels: [],
		},
	},
});

// Only listen to serverStdout if chat is enabled
moduleSettings.chat.enabled && thread.on("serverStdout", serverStdout);

import { buildModuleInfo, prepGetThread } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	color: "cyan",
	description: "All things minecraft.",
});

type JSON = Record<string, any>;

export const getProperties = async (): Promise<JSON | undefined> => {
	const wrapperThread = await getCore();
	const { commandWorkingDirectory } = await wrapperThread.settings();
	return properties(`${commandWorkingDirectory + "/" || "./"}server.properties`, { path: true });
};
export const getStatus = async () => {
	const port = (await getProperties())?.["server-port"] as number;
	return mcServerUtils.status("localhost", { port, enableSRV: false });
};

let commandWorkingDirectory: string | undefined;
export const getCommandWorkingDirectory = async () => {
	if (commandWorkingDirectory !== undefined) return commandWorkingDirectory;
	const wrapperThread = await getCore();
	return (commandWorkingDirectory = (await wrapperThread.settings()).commandWorkingDirectory);
};

let worldFolder: string;
export const getWorldFolder = async () => {
	if (worldFolder !== undefined) return worldFolder;
	const properties = await getProperties();
	return (worldFolder = `${(await getCommandWorkingDirectory()) || "."}/${properties?.["level-name"]}`);
};
