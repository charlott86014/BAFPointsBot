const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const roblox = require('noblox.js');
const chalk = require('chalk');
require('dotenv').config();

exports.run = async (client, message, args) => {
    if (message.guild.id !== process.env.FPGuildId) {
        return message.channel.send({embeds: [{
            color: 16711680,
            description: "This command cannot be used in this group!",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    if(!message.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name))) {
        return message.channel.send({embeds: [{
            color: 16711680,
            description: "You don't have the permission to run this command.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let user;
    let pointsToAdd;
    let arg1;
    let arg2;

    for (var i = 0; i < args.length; i++) {
        if (args[i] !== " ") {
            if (arg1 === undefined) {
                arg1 = args[i];
            } else {
                arg2 = args[i];
            }
        }
    }

    if (typeof arg1 === typeof undefined) {
        user = undefined;
    } else {
        user = message.mentions.members.first();
    }
    if (typeof arg2 === typeof undefined) {
        pointsToAdd = undefined;
    } else {
        pointsToAdd = parseInt(arg2, 10);
    }

    switch(user) {
        case undefined:
            message.channel.send({embeds: [{
                color: 16711680,
                description: "You must mention someone or give their ID!",
                author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
            }]});
            break;
        default:
            if (typeof pointsToAdd === typeof undefined) {
                message.channel.send({embeds: [{
                    color: 16711680,
                    description: "You didn't specify how many points to give.",
                    author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                }]});
            } else if (pointsToAdd <= 0 || pointsToAdd > 6) {
                message.channel.send({embeds: [{
                    color: 16711680,
                    description: "You have to give me a value between 1 and 6!",
                    author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                }]});
            } else {
                dbconnection.query(`INSERT INTO UserPoints (id_user)`
                + `SELECT ${user.id} WHERE NOT EXISTS (Select id_user From UserPoints WHERE id_user = ${user.id}) LIMIT 1`, (err) => {
                    if(err) throw err;
                    }   
                );

                dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
                    if(err) throw err;

                    let sql;
                    sql = 'SELECT `apoints` FROM `UserPoints` WHERE `id_user` = '+user+'';
                    
                    fpnewpointsamount = rows[0].fppoints + pointsToAdd;
                    if (fpnewpointsamount >= 35 && !(rows[0].fppoints < 35)) {
                        message.channel.send({embeds: [{
                            color: 16737095,
                            description: `${user} has already got the maximum points for this divison!`,
                            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                        }]});
                    } else if (fpnewpointsamount >= 35 && rows[0].fppoints < 35){
                        sql = 'UPDATE `UserPoints` SET `fppoints` = '+35+' WHERE `id_user` = '+user+'';
                        dbconnection.query(sql);
                        message.channel.send({embeds: [{
                            color: 16108848,
                            description: `${user} has just reached the maximum number of points!`,
                            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                        }]});
                    } else {
                        sql = 'UPDATE `UserPoints` SET `fppoints` = '+fpnewpointsamount+' WHERE `id_user` = '+user+''
                        dbconnection.query(sql);
                        message.channel.send({embeds: [{
                            color: 65280,
                            description: `${user} has received ${pointsToAdd} points, and now stands at ${fpnewpointsamount} points.`,
                            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                        }]});
                    }
                    const member = message.mentions.members.first();

                    if (fpnewpointsamount > 4 && member.roles.cache.some(role => role.name === 'Junior Agent') || fpnewpointsamount > 9 && member.roles.cache.some(role => role.name === 'Agent') || 
                        fpnewpointsamount > 14 && member.roles.cache.some(role => role.name === 'Vice Inspector') || fpnewpointsamount > 19 && member.roles.cache.some(role => role.name === 'Inspector') || 
                        fpnewpointsamount > 24 && member.roles.cache.some(role => role.name === 'Vice Chief Inspector') || fpnewpointsamount > 34 && member.roles.cache.some(role => role.name === 'Chief Inspector')) {
                        promotion = async (message) => {
                            if (user.nickname) {
                                user = user.nickname
                            }
                            
                            let id;

                            try {
                                id =  await roblox.getIdFromUsername(user);
                            } catch(err) {
                                console.log(chalk.red('An error occured while promoting: ' + err));
                                return message.channel.send({embeds: [{
                                    color: 16711680,
                                    description: `An error has occurred.`,
                                    author: {name: message.author.tag, icon_url: message.author.displayAvatarURL}
                                }]});
                            }

                            let rankNameInGroup = await getRankName(Number(process.env.FPGroupId), id);
                            let rankInGroup = await getRankID(Number(process.env.FPGroupId), id);
                            let promoteResponse;

                            try {
                                promoteResponse = await roblox.promote(Number(process.env.FPGroupId), id);
                            } catch (err) {
                                console.log(chalk.red('An error occured while promoting: ' + err));
                                return message.channel.send({embeds: [{
                                    color: 16711680,
                                    description: `An unexpected error has occured. Check the bot console. Warn the Founder about this issue.`,
                                    author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                                }]});
                            }
                        
                            async function getRankName(func_group, func_user){
                                let rolename = await roblox.getRankNameInGroup(func_group, func_user);
                                return rolename;
                            }
                            
                            async function getRankID(func_group, func_user){
                                let role = await roblox.getRankInGroup(func_group, func_user);
                                return role;
                            }

                            message.channel.send({embeds: [{
                                color: 65280,
                                description: `${user} was promoted to ${promoteResponse.newRole.name}.`,
                                author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
                            }]});

                            var oldRole = member.guild.roles.cache.find(role => role.name === rankNameInGroup);
                            var newRole = member.guild.roles.cache.find(role => role.name === promoteResponse.newRole.name);
                            member.roles.remove(oldRole);
                            member.roles.add(newRole);
                        
                            if(process.env.FPLogChannelId === 'false') return;
                            let logchannel = await message.guild.channels.cache.get(process.env.FPLogChannelId);
                            logchannel.send({embeds: [{
                                color: 2127726,
                                description: `<@${message.author.id}> has promoted ${user} from ${rankNameInGroup} (${rankInGroup}) to ${promoteResponse.newRole.name} (${promoteResponse.newRole.rank}).`,
                                author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()},
                                footer: {text: 'Action Logs'},
                                timestamp: new Date(),
                                thumbnail: {url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${user.username}`}
                            }]});
                        }  
                        promotion(message);
                    }
                });
            }
    }
}