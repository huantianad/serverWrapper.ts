import { Output, LogTo } from "@spookelton/wrapperHelpers/types";
import { wrapperCore, discordModule } from "..";

export const logg = async (output: Output, logTo?: LogTo) => {
	if (output.console !== undefined && logTo?.console !== undefined) console.log(output.console);
	if (output.minecraft !== undefined && logTo?.minecraft !== undefined) {
		if (typeof output.minecraft === "string") await wrapperCore.serverStdin(output.minecraft);
		else await wrapperCore.serverStdin(`tellraw ${logTo.minecraft} ${JSON.stringify(output.minecraft)}`);
	}
	if (output.discord && logTo?.discord && discordModule !== undefined) await discordModule.sendToChannel(logTo.discord.channelId, output.discord);
};
