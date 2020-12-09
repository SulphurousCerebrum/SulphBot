const Discord = require('discord.js')
const cron = require('node-cron')
const secret = require('./config/secret')
const commandHandler = require('./res/commandHandler')
const db = require('./res/db')

const client = new Discord.Client()

const prefixes = secret.PREFIXES

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setStatus("Sulph's Slave");
});

client.on('message', msg => {

	isCommand = false
	prefix = ''

	prefixes.forEach((pref, index) => {
		if (msg.content.toLowerCase().startsWith(pref)) {
			isCommand = true
			prefix = pref
		}
	});

	if (isCommand) {

		console.log({
			LABEL		: 'Received Command',
			COMMAND		: prefix,
			PACKAGE: {
				author		: msg.author.username,
				author_id	: msg.author.id,
				message_id	: msg.id,
				channel_id	: msg.channel.id,
				content		: msg.content
			}
		})

		if(prefix == '!spam') {

			handleSpam(msg.content.toLowerCase(), retPackage => {
				if(!retPackage.success){

					if(retPackage.code == 1){
						msg.reply("Invalid message. Please see !sulph help")
					}
					else if(retPackage.code == 2){
						msg.reply("You are not allowed to mention everyone in spam (test), asshole!")
					}
				}
			})
		}

		else {
			command = msg.content.toLowerCase().slice(1)
			commandHandler.commandHandler(msg.author.id, command, retPackage => {
				console.log(retPackage)
				msg.channel.send(retPackage.msg)
			})
		}
	}

});

client.login(secret.BOT_TOKEN);  

// #### SPAM HANDLER #### //

toBeSpammed = ''

var task = cron.schedule('*/1 * * * * *', () => {
	client.channels.cache.get(secret.SPAM_CHANNEL).send(toBeSpammed);
})

task.stop()

var handleSpam = (command, callback) => {

	if(command.length < 7) {
		callback({
			success: false,
			code: 1
		})

		return
	}

	toBeSpammed = command.slice(6)

	if(toBeSpammed.startsWith('stop')){
		task.stop()
	}

	else if (toBeSpammed.includes('@everyone')){

		callback({
			success: false,
			code: 2
		})
	}

	else {
		task.start()
	}

	callback({
		success: true,
		code: 0
	})

}

// #### SPAM HANDLER END #### //