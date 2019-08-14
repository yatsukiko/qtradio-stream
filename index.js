const { Plugin } = require("powercord/entities")
const { get } = require('powercord/http');

module.exports = class qtradio extends Plugin {

	startPlugin() {
		let muteToggle = false;
		let decodeHTML = function (html) {
			let txt = document.createElement('textarea');
			txt.innerHTML = html;
			return txt.value;
		};
		this.audio = document.createElement("audio")

		const format = (quality, bitrateSource, volume) => {
			return `Please wait, connecting to ${!bitrateSource.toString().startsWith("http") ? `${quality} quality stream with ${bitrateSource}kbps` : bitrateSource} at ${volume}% volume.`
		}

		this.registerCommand(
			"qtradio",
			[],
			"Starts playback, volume on first argument, bitrate/stream on second.",
			"{c} 1-100 <320, 192, 96, url>",
			(args) => {
				this.audio.autoplay = true
				if (args[0]) {
					if (args[0] > 100) { //checks if first arguemnt is larger than 100
						return {
							send: false,
							result: "Max 100 for volume."
						};
					}
					else if (isNaN(args[0])) {
						return {
							send: false,
							result: `"${args[0]}" is not a valid argument for volume.`
						}
					}
					else {
						this.audio.volume = args[0] / 100 //uses arguments to set volume
					}

					var quality;
					var bitrateSource = args[1];
					var volume = args[0];

					console.log(bitrateSource)

					switch (bitrateSource) {
						case undefined:
						case "320": {
							quality = "high";
							break;
						}
						case "192": {
							quality = "normal";
							break;
						}
						case "96": {
							quality = "low";
							break;
						}
					}

					if (bitrateSource && bitrateSource.startsWith("http")) {
						this.audio.src = bitrateSource;
						return {
							send: false,
							result: format(quality, bitrateSource, volume)
						}
					} else {
						if (!bitrateSource) {
							this.audio.src = "https://qtradio.moe/stream"
							return {
								send: false,
								result: format("high", 320, volume)
							}
						}
						else if (isNaN(bitrateSource)) {
							return {
								send: false,
								result: `"${bitrateSource}" is not a valid argument for bitrate/source`
							}
						} else {
							this.audio.src = `http://meek.moe:8000/stream${quality}.mp3`
							return {
								send: false,
								result: format(quality, bitrateSource, volume)
							}
						}
					}
				}
				else {
					this.audio.volume = 1
					this.audio.src = "https://qtradio.moe/stream"
					return {
						send: false,
						result: format("high", this.audio.src, 100)
					}
				}
			})
		this.registerCommand(
			"qtpause",
			[],
			"Will pause the radio, not mute.",
			"{c}",
			() => {
				this.audio.pause()
			})

		this.registerCommand(
			"qtresume",
			["qtplay"],
			"Resume from last pause (delayed).",
			"{c}",
			() => {
				this.audio.play()
			})

		this.registerCommand(
			"qtmute",
			[],
			"Toggle mutes playback, a better pause.",
			"{c}",
			() => {
				if (muteToggle) {
					this.audio.muted = true
					muteToggle = true;

					return
				}
				else if (muteToggle) {
					this.audio.muted = false
					muteToggle = false;
				}
			})

		this.registerCommand(
			"qtvolume",
			[],
			"Changes volume 1-100, with no arguments tell you what volume you are at.",
			"{c} 1-100",
			(args) => {
				if (isNaN(args)) {
					return {
						send: false,
						result: "Numbers only please."
					};
				}
				else if (args[0]) {
					this.audio.volume = args / 100;
				}
				else {
					return {
						send: false,
						result: `Current volume is: ${this.audio.volume * 100}`
					}
				}
			})

		this.registerCommand( 		//source: https://github.com/LiquidBlast/qtradio-powercord
			"qtnp",
			[],
			"Shows currently playing song. If argument one is 'send', will send it to chat instead of just locally",
			"{c} send",
			async (args) => {
				const np = await get('https://qtradio.moe/stats');
				let data = np.body.icestats.source[1];
				let decoded = decodeHTML(data.title)
				if (args == "send") {
					return {
						send: true,
						result: decoded
					}
				}
				else {
					return {
						send: false,
						result: `Currently playing song is: "**${decoded}**". ' + "Remember, this isn't synchronised if you've paused before.`
					};
				}
			})
	}
}