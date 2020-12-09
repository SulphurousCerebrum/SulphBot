const cron = require('node-cron');
const { defer } = require('q');
const Discord = require('discord.js')
const q = require('q')
const db = require('./db')

const notniceEmbed = new Discord.MessageEmbed()
	.setColor('#8e30d1')
	.setTitle('The notnice Command')
    .setDescription('Help for !notnice')
    .addField('!notnice', 'Generated insults, <@385112344180686848> style')
    .addField('!notnice query [Optional=keyword]', 'Shows insults in our arsenal')
    .addField('\u200B', '\u200B')
    .addField('Weedo Specific Queries', "only weedo can use these. F")
    .addField('!notnice add [insult]', 'Add an insult to arsenal', true)
    .addField('!notnice remove [id]', 'Removes an insult from the arsenal', true)
	.setTimestamp()
	.setFooter('Bebe of SulphurousCerebrum');

var commandHandler = (authorID, command, callback) => {

    if(command.startsWith('notnice')) {
        handleNotNice(command, authorID).then(retPackage => {
            callback(retPackage)
        }), function(retPackage) {
            callback(retPackage)
        }
    }
}

function handleNotNice(command, authorID) {
    var deferred = q.defer()

    retPackage = {
        code    : 0,
        msg     : ''
    }

    commandArray = command.split(' ')

    if(command.length == 7) {

        db.query('SELECT * FROM insults ORDER BY RAND() LIMIT 1', (err, result) => {
            if(err){
                console.log(err)
                retPackage.code = 500
                retPackage.msg = "Database query error. @SulphurousCerebrum, please check me senpai"
                deferred.reject(retPackage)
            }

            else {
                retPackage.code = 0
                retPackage.msg = result[0].insult
                deferred.resolve(retPackage)
            }

        })

        return deferred.promise
    }

    if(commandArray[1] == 'help') {
        retPackage.code = 0
        retPackage.msg = notniceEmbed
        deferred.resolve(retPackage)
        return deferred.promise
    }
    
    else if(commandArray[1] == 'query') {

        insult = command.slice(14)

        numberOfRecords = 0

        db.query("SELECT * FROM insults WHERE insult LIKE " + db.escape('%' + insult + '%'), (err, result) => {
            if(err) {
                console.log(err)
                retPackage.code = 500
                retPackage.msg = "Database query error. @SulphurousCerebrum, please check me senpai"
                deferred.reject(retPackage)
            }

            else {
                if(result.length == 0) {
                    retPackage.code = 0
                    retPackage.msg = "Nope, nothing of that sort exists"
                    deferred.resolve(retPackage)
                }

                else {
                    retPackage.code = 0
                    msg = "Found " + result.length + " matching results : \n"

                    result.forEach(item => {
                        msg = msg + item.id + ". " + item.insult + "\n"
                    });

                    retPackage.msg = msg
                    deferred.resolve(retPackage)
                }
            }
        }) 
    
        return deferred.promise
    }

    else if (commandArray[1] == 'add') {

        if(authorID != 385112344180686848 && authorID != 703452765636001833) {
            retPackage.code = 0
            retPackage.msg = "This command is not for you"
            deferred.resolve(retPackage)
            return deferred.promise
        }

        if(commandArray.length < 3) {
            retPackage.code = 0
            retPackage.msg = "Idk what that command is. See !notnice help"
            deferred.resolve(retPackage)
            return deferred.promise
        }

        insult = command.slice(12)

        db.query("INSERT INTO insults(insult) VALUES(" + db.escape(insult) + ");", (err, result) => {
            if(err) {
                console.log(err)
                retPackage.code = 500
                retPackage.msg = "Database query error. @SulphurousCerebrum, please check me senpai"
                deferred.reject(retPackage)
                
            }

            else {
                retPackage.code = 0
                retPackage.msg = "Added insult! Wooohooo!"
                deferred.resolve(retPackage)
            }
        })

        return deferred.promise
    }

    else if(commandArray[1] == 'remove') {

        if(authorID != 385112344180686848 && authorID != 703452765636001833) {
            retPackage.code = 0
            retPackage.msg = "This command is not for you"
            deferred.resolve(retPackage)
            return deferred.promise
        }

        if(commandArray.length < 3) {
            retPackage.code = 0
            retPackage.msg = "Idk what that command is. See !notnice help"
            deferred.resolve(retPackage)
            return deferred.promise
        }

        insult = command.slice(15)

        if(isNaN(insult)) {
            retPackage.code = 0
            retPackage.msg = "IDs are made of numbers you dum dum"
            deferred.resolve(retPackage)
        }

        else {
            db.query("DELETE FROM insults WHERE id = " + insult + ";", (err, result) => {
                if(err) {
                    console.log(err)
                    retPackage.code = 500
                    retPackage.msg = "Database query error. @SulphurousCerebrum, please check me senpai"
                    deferred.reject(retPackage)
                }

                else {
                    if(result.affectedRows == 0) {
                        retPackage.code = 0
                        retPackage.msg = "That ID doesn't exist. smh"
                        deferred.resolve(retPackage)
                    }

                    else {
                        retPackage.code = 0
                        retPackage.msg = "That insult was yeeted out of existence!"
                        deferred.resolve(retPackage)
                    }
                }
            })
        }
        return deferred.promise
    }

    else {
        retPackage.code = 0
        retPackage.msg = "That isn't quite right. Try !notnice help to see list of commands"
        deferred.resolve(retPackage)
        return deferred.promise
    }
}

module.exports.commandHandler = commandHandler;