const { Plugin } = require("powercord/entities")
const { get }    = require('powercord/http');

module.exports = class qtradio extends Plugin {
    
	startPlugin() {
	let mutTgl = 0
	let decodeHTML = function (html) {
		let txt = document.createElement('textarea');
		txt.innerHTML = html;
		return txt.value;
	};	
	this.audio = document.createElement("audio")
        
		this.registerCommand(
            "qtradio",
            [],
            "Starts playback, volume on first arugment, bitrate on second.",
            "{c} 1-100 <320, 192, 96>",
			(args) => { 
				this.audio.autoplay = true
				if (args.some(isNaN)){ //checks are arguments a number
					return {
					  send: false,
					  result: "Only numerical values please."
						};
				}
				
				if (args[0]) { 
					if (args[0]>100){ //checks if first arguemnt is larger than 100
					return {
					  send: false,
					  result: "Max 100 for volume."
						};
					}
				else
				this.audio.volume = args[0]/100 //uses arguments to set volume
				
				
				if (args[1]==320) {
				this.audio.src = "http://meek.moe:8000/streamhigh.mp3"	
				return{
				send: false,
				result: "Please wait, connecting."
					}
				}
				else if (args[1]==192) {
				this.audio.src = "http://meek.moe:8000/streamnormal.mp3"	
				return{
				send: false,
				result: "Please wait, connecting."
					}
				}
				else if (args[1]==96) {
				this.audio.src = "http://meek.moe:8000/streamlow.mp3"	
				return{
				send: false,
				result: "Please wait, connecting."
					}
				}
				else if (args[1]==null){
				this.audio.src = "https://qtradio.moe/stream"	//these 4 checks for second argument, 
				return{
				send: false,
				result: "Please wait, connecting."
					}
				}

			} else 
			this.audio.volume = 1
			this.audio.src = "https://qtradio.moe/stream" //if nothins is set, this is default 
			return{
				send: false,
				result: "Please wait, connecting."
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
			if (mutTgl==0) {
				this.audio.muted = true
				mutTgl = 1
				
			return
			}
			else if (mutTgl==1) {
				this.audio.muted = false
				mutTgl = 0
			}
            })			
			
		this.registerCommand(
            "qtvolume",
            [],
            "Changes volume 1-100.",
            "{c} 1-100",
            (args) => {
			if (isNaN(args)) {	
			return {
              send: false,
              result: "Numbers only please."
				};
            }
			else if (args[0]){
			this.audio.volume = args/100;
			}
			else {
				
				return {
              send: false,
              result: "Current volume is: " + this.audio.volume*100
					}}
			})
			
		this.registerCommand( 		//source: https://github.com/LiquidBlast/qtradio-powercord
            "qtnp",
            [],
            "Shows currently playing song. If arguemnt is 'send', will send to chat",
            "{c} send",
            async (args) => {
            const np = await get('https://qtradio.moe/stats');
            let data = np.body.icestats.source[1];
			let decoded = decodeHTML(data.title)
            if (args=="send") {
			return {
              send: true,
              result: decoded
				}	
			}
			else 
			return {
              send: false,
              result: 'Currently playing song is: "**' + decoded + '**". ' + "Remember, this isn't synchronised if you've paused before."
            };
          })	
	}
}