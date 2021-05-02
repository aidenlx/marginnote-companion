import ClipboardListener from 'modules/receivers/cbListener';
import { handlePastedNote } from 'modules/receivers/pasteEvt';
import { Plugin } from 'obsidian';
import TurndownService from 'turndown';
// import { MNCompSettings, DEFAULT_SETTINGS, MNCompSettingTab } from 'settings';

export default class MNComp extends Plugin {
	// settings: MNCompSettings = DEFAULT_SETTINGS;

	cbListener = new ClipboardListener();

	static tdService = new TurndownService();
	
	async onload() {
		console.log('loading plugin');

		// await this.loadSettings();

		// this.addSettingTab(new MNCompSettingTab(this.app, this));

		this.registerCodeMirror(handlePastedNote)

	}

	onunload() {
		console.log('unloading plugin');
	}

	// async loadSettings() {
	// 	this.settings = {...this.settings,...(await this.loadData())};
	// }

	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// }
}