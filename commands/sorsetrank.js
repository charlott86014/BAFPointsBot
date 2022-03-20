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
    if (message.guild.id !== process.env.SORGuildId) {
        return message.channel.send({embeds: [{
            color: 16711680,
            description: "This command cannot be used in this group!",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    if(!message.member.roles.cache.some(role =>["Minister of Defence"].includes(role.name))){
        return message.channel.send({embeds: [{
            color: 16733013,
            description: "Only the Minister of Defence can run this command.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let username = message.mentions.users.first();
    if(!username){
        return message.channel.send({embeds: [{
            color: 16733013,
            description: "The username argument is required.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let rank = parseInt(args[1], 10);
    let newrank;
    if(!rank){
        let midrank = args.slice(1).join(' ');
        if(!midrank){
             return message.channel.send({embeds: [{
                color: 16733013,
                description: "The rank argument is required.",
                author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
            }]});
        }
        newrank = await getRankFromName(midrank, Number(process.env.SORGroupId));
    } else {
        newrank = rank;
    }
    
    let id;
    try {
        id = await roblox.getIdFromUsername(username);
    } catch {
        return message.channel.send({embeds: [{
            color: 16733013,
            description: `Oops! ${username} is not a Roblox user. Perhaps you misspelled?`,
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let rankInGroup = await getRankID(Number(process.env.SORGroupId), id);
    let rankNameInGroup = await getRankName(Number(process.env.SORGroupId), id);
    if(Number(process.env.maximumRankST) <= rankInGroup || Number(process.env.maximumRankST) <= newrank){
        return message.channel.send({embeds: [{
            color: 16733013,
            description: "This rank cannot be ranked by this bot.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    if(newrank == 'NOT_FOUND'){
        return message.channel.send({embeds: [{
            color: 16733013,
            description: "The specified rank could not be found.",
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    let setRankResponse;
    try {
        setRankResponse = await roblox.setRank(Number(process.env.SORGroupId), id, newrank);
    } catch (err) {
        console.log(chalk.red('An error occured when running the setrank command: ' + err));
        return message.channel.send({embeds: [{
            color: 16733013,
            description: `An unexpected error has occured. It has been logged to the bot console.`,
            author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
        }]});
    }

    message.channel.send({embeds: [{
        color: 9240450,
        description: `**Success!** Ranked ${username} to ${setRankResponse.name} (${setRankResponse.rank})`,
        author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()}
    }]});

    if(process.env.SORLogChannelId === 'false') return;
    let logchannel = await message.guild.channels.cache.get(process.env.SORLogChannelId);
    logchannel.send({embeds: [{
        color: 2127726,
        description: `<@${message.author.id}> has ranked ${username} from ${rankNameInGroup} (${rankInGroup}) to ${setRankResponse.name} (${setRankResponse.rank}).`,
        author: {name: message.author.tag, icon_url: message.author.displayAvatarURL()},
        footer: {text: 'Action Logs'},
        timestamp: new Date(),
        thumbnail: {url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${username}`}
    }]});
}