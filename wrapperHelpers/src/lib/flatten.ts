import chalk from "chalk";
import { mc, hex } from "../colors";

import { inspect } from "util";

import type { Output } from "../types";

export const flattenObject = (ob: Record<string, any>) => {
	if (typeof ob !== "object") return ob;
	if (Array.isArray(ob)) {
		for (const key in ob) ob[key] = flattenObject(ob[key]);
		return ob;
	}
	const toReturn: Record<string, any> = {};
	for (const key in ob) {
		if (typeof ob[key] == "object") {
			const flatObject = flattenObject(ob[key]);
			for (const flatKey in flatObject) {
				toReturn[key + "." + flatKey] = flatObject[flatKey];
			}
		} else toReturn[key] = ob[key];
	}
	return toReturn;
};

export const flatOut = (ob: any, options?: { title?: string; filename?: string }): Output => {
	if (ob === undefined)
		return {
			console: "undefined",
			minecraft: [{ text: "undefined" }],
			discord: {
				embeds: [
					{
						title: options?.title,
						color: parseInt(hex.cyanBright, 16),
						description: "```\nundefined```",
						timestamp: Date.now(),
					},
				],
			},
		};
	if (typeof ob !== "object")
		return {
			console: ob,
			minecraft: [{ text: ob }],
			discord: {
				embeds: [
					{
						title: options?.title,
						color: parseInt(hex.cyanBright, 16),
						description: `\`\`\`\n${ob}\`\`\``,
						timestamp: Date.now(),
					},
				],
			},
		};
	const flatObject = flattenObject(ob);
	let description: string | undefined = "```json\n" + JSON.stringify(flatObject, null, 2) + "```";
	let files;
	if (description.length > 4096) {
		files = [{ name: options?.filename || "o.json", attachment: Buffer.from(JSON.stringify(ob, null, 2)) }];
		description = undefined;
	}
	return {
		console: inspect(ob, false, 99, true),
		minecraft: Object.entries(flatObject).flatMap(([key, value]) => [
			{
				text: key,
				color: mc.cyan,
			},
			{
				text: "",
			},
			{
				text: value,
				color: mc.red,
			},
		]),
		discord: {
			files,
			embeds: [
				{
					title: options?.title,
					color: parseInt(hex.cyanBright, 16),
					description,
					timestamp: Date.now(),
				},
			],
		},
	};
};
