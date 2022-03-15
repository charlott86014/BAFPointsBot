const roblox = require('noblox.js');
const chalk = require('chalk');
require('dotenv').config();

async function getRankName(func_group, func_user){
    let rolename = await roblox.getRankNameInGroup(func_group, func_user);
    return rolename;
}

async function getRankID(func_group, func_user){
    let role = await roblox.getRankInGroup(func_group, func_user);
    return role;
}

async function getRankFromName(func_rankname, func_group){
    let roles = await roblox.getRoles(func_group);
    let role = await roles.find(rank => rank.name == func_rankname);
    if(!role){return 'NOT_FOUND';}
    return role.rank;
}

exports.run = async (client, message, args) => {
    if(!message.member.roles.cache.some(role =>["Hosting Permission"].includes(role.name))){
        return message.channel.send({embeds: [{
            color: 16711680,
            description: "You don't have the permission to run this command.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let username = args[0];
    if(!username){
        return message.channel.send({embeds: [{
            color: 16711680,
            description: "The username argument is required.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let id;
    try {
        id = await roblox.getIdFromUsername(username);
    } catch (err) {
        return message.channel.send({embeds: [{
            color: 16711680,
            description: `${username} is not a Roblox user. Perhaps you misspelled? Remember that you can't use @username.`,
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let rankInGroup = await getRankID(Number(process.env.BRGGroupId), id);
    let rankNameInGroup = await getRankName(Number(process.env.BRGGroupId), id);
    if(Number(process.env.BRGMaximumRank) <= rankInGroup){
        return message.channel.send({embeds: [{
            color: 16711680,
            description: "This rank cannot be deranked by this bot.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let demoteResponse;
    try {
        demoteResponse = await roblox.demote(Number(process.env.BRGGroupId), id);
    } catch (err) {
        console.log(chalk.red('An error occured when running the demote command: ' + err));
        return message.channel.send({embeds: [{
            color: 16711680,
            description: `An unexpected error has occured. It has been logged to the bot console. Warn the Founder about this issue.`,
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let newRankName = await getRankName(Number(process.env.BRGGroupId), id);
    let newRank = await getRankID(Number(process.env.BRGGroupId), id);
    message.channel.send({embeds: [{
        color: 65280,
        description: `${username} has been demoted to ${demoteResponse.newRole.name}!`,
        author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
    }]});

    if(process.env.logchannelid === 'false') return;
    let logchannel = await message.guild.channels.cache.get(process.env.logchannelid);
    logchannel.send({embeds: [{
        color: 2127726,
        description: `<@${message.author.id}> has demoted ${username} from ${rankNameInGroup} (${rankInGroup}) to ${demoteResponse.newRole.name} (${demoteResponse.newRole.rank}).`,
        author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()},
        footer: {text: 'Action Logs'},
        timestamp: new Date(),
        thumbnail: {url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`}
    }]});
}