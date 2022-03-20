const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const { MessageEmbed } = require('discord.js');
const roblox = require('noblox.js');
require('dotenv').config();

exports.run = async (client, message, args) => {
    let user = message.mentions.members.first();
    if(!user) {
        user = message.member;
    }

    dbconnection.query(`INSERT INTO UserPoints (id_user)`
        + `SELECT ${user.id} WHERE NOT EXISTS (Select id_user From UserPoints WHERE id_user = ${user.id}) LIMIT 1`, (err) => {
            if(err) throw err;
        }
    );

    groupGetter = async(groupid) => {
        let uName;
        if (user.nickname) {   
            uName = user.nickname
        } else {
            uName = user.user.username
        }
        async function getRankName(func_group, func_user){
            let rolename = await roblox.getRankNameInGroup(func_group, func_user);
            return rolename;
        }

        try {
            id =  await roblox.getIdFromUsername(uName);
        } catch(err) {
            console.log(('An error has occurred: ' + err));
            return message.channel.send({embeds: [{
                color: 16711680,
                description: `An error has occurred. User not found. Try using the !getrole command.`,
                author: {name: message.author.tag, icon_url: message.author.displayAvatarURL}
            }]});
        }
        
        let rankInGroup = await getRankName(Number(groupid), id);
        
        return rankInGroup
    }

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user.user.id+'' , (err, rows) => {
        if(err) throw err;

        let sql;
        sql = 'SELECT `apoints`, `fppoints`, `sorpoints`, `brgpoints` FROM `UserPoints` WHERE `id_user` = '+user.user.id+'';

        let apointsamount;  
        if (user.roles.cache.some(role => role.name === 'Belgian Army')) {
            if (rows[0].apoints == 90) {
              apointsamount = rows[0].apoints + " " + "[MAX]"
            } else if (rows[0].apoints < 90){
              apointsamount = rows[0].apoints
            }
        } else {
          apointsamount = "This user is not part of the army!";
        };

        let fppointsamount;  
        if (user.roles.cache.some(role => role.name === 'Federal Police')) {
          fppointsamount = rows[0].fppoints
          if (rows[0].fppoints == 35) {
            fppointsamount = rows[0].fppoints + " " + "[MAX]"
          } else if (rows[0].apoints < 35){
            fppointsamount = rows[0].fppoints
          }
        } else{
          fppointsamount = "This user is not part of this division.";
        };

        let sorpointsamount;  
        if (user.roles.cache.some(role => role.name === 'Special Operations Regiment')) {
          if (rows[0].sorpoints == 35) {
            sorpointsamount = rows[0].sorpoints + " " + "[MAX]"
          } else if (rows[0].sorpoints < 35){
            sorpointsamount = rows[0].sorpoints
          }
        } else{
          sorpointsamount = "This user is not part of this division.";
        };

        let brgpointsamount;  
        if (user.roles.cache.some(role => role.name === 'Belgian Royal Guards')) {
          if (rows[0].brgpoints == 50) {
            brgpointsamount = rows[0].brgpoints + " " + "[MAX]"
          } else if (rows[0].brgpoints < 50){
            brgpointsamount = rows[0].brgpoints
          }
        } else{
          brgpointsamount = "This user is not part of this division.";
        };

        (async () => {
            const embed = new MessageEmbed()
                .setColor('#F5CD30')
                .setAuthor({name: message.author.tag, icon_url: message.author.displayAvatarURL()})
                .setDescription( `**Here are ${user.toString()}'s points:**\n`)

            if(user.roles.cache.some(role => role.name === 'Belgian Army')){
                embed.addField(`Belgian Army Points: ${apointsamount}`, `Role: ${await groupGetter(process.env.ArmyGroupId) }`,false);
            }
            if(user.roles.cache.some(role => role.name === 'Federal Police')){
                embed.addField(`Federal Police Points: ${fppointsamount}`, `Role: ${await groupGetter(process.env.FPGroupId) }`,false);
            }
            if(user.roles.cache.some(role => role.name === 'Special Operations Regiment')){
                embed.addField(`Special Operations Regiment Points: ${sorpointsamount}`, `Role: ${await groupGetter(process.env.SORGroupId) }`,false);
            }
            if(user.roles.cache.some(role => role.name === 'Belgian Royal Guards')){
                embed.addField(`Belgian Royal Guards Points: ${brgpointsamount}`, `Role: ${await groupGetter(process.env.BRGGroupId) }`,false);
            }
            message.channel.send({ embeds: [embed] });
        })()
    });
}