import { Plugin } from 'obsidian';
// import { MNCompSettings, DEFAULT_SETTINGS, MNCompSettingTab } from 'settings';

export default class MNComp extends Plugin {
	// settings: MNCompSettings = DEFAULT_SETTINGS;

	async onload() {
		console.log('loading plugin');

		// await this.loadSettings();

		// this.addSettingTab(new MNCompSettingTab(this.app, this));

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