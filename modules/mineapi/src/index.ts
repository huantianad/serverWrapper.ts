export * from "./commands";
import * as commands from "./commands";

// Import core packages
import props from "properties";
import mcServerUtils from "minecraft-server-util";
import { promisify } from "util";

const properties = promisify(props.parse);

// Threading
import { ThreadModule } from "@inrixia/threads";
const thread = (module.parent as ThreadModule).thread;

// Import types
import type { CoreExports, Output } from "@spookelton/wrapperHelpers/types";

import { buildModuleInfo } from "@spookelton/wrapperHelpers/modul";
// Export moduleInfo
export const moduleInfo = buildModuleInfo({
	commands,
	color: "cyan",
	description: "All things minecraft.",
});

type JSON = Record<string, any>;

export const getProperties = async (): Promise<JSON | undefined> => {
	const wrapperThread = await thread.require<CoreExports>("@spookelton/serverWrapper");
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
	const wrapperThread = await thread.require<CoreExports>("@spookelton/serverWrapper");
	return (commandWorkingDirectory = (await wrapperThread.settings()).commandWorkingDirectory);
};

let worldFolder: string;
export const getWorldFolder = async () => {
	if (worldFolder !== undefined) return worldFolder;
	const properties = await getProperties();
	return (worldFolder = `${(await getCommandWorkingDirectory()) || "."}/${properties?.["level-name"]}`);
};
