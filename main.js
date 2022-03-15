const express = require('express');
const app = express();
var mysql = require('mysql');
require('dotenv').config();

var dbconnection = mysql.createConnection({
    host: `${process.env.databaseHost}`,
    user: `${process.env.databaseUser}`,
    password: `${process.env.databasePassword}`
  });

app.get('/', (request, response) => {
  response.sendStatus(200);
});

let listener = app.listen(process.env.PORT, () => {
  console.log('Your app is currently listening on port: ' + listener.address().port);
});

// start discord.js init
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const roblox = require('noblox.js');
const chalk = require('chalk');
const figlet = require('figlet');
require('dotenv').config();
// end discord.js init
const fs = require('fs');
// Initialize **or load** the points database.
const Enmap = require("enmap");
client.points = new Enmap({name: "points"});

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  let botstatus = fs.readFileSync('./bot-status.json');
  botstatus = JSON.parse(botstatus);

  if(botstatus.activity == 'false') return;

  if(botstatus.activitytype == 'STREAMING'){
    client.user.setActivity(botstatus.activitytext, {
      type: botstatus.activitytype,
      url: botstatus.activityurl
    });} else {
    client.user.setActivity(botstatus.activitytext, {
      type: botstatus.activitytype
    });
  }
});

dbconnection.connect(function(err) {
  if (err) throw err;
  console.log("Database successfully connected!");
});

dbconnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.databaseCode}`, function (err) {
  if (err) throw err;
  dbconnection.query(`USE ${process.env.databaseCode}`, function (err) {
    if (err) throw err;
    dbconnection.query('CREATE TABLE IF NOT EXISTS `UserPoints`('
    + '`number_id` BIGINT NOT NULL AUTO_INCREMENT,'
    + '`id_user` BIGINT NOT NULL,'
    + '`id_group` BIGINT NOT NULL,'
    + '`apoints` INT NOT NULL DEFAULT 0,'
    + '`fppoints` INT NOT NULL DEFAULT 0,'
    + '`sorpoints` INT NOT NULL DEFAULT 0,'
    + '`brgpoints` INT NOT NULL DEFAULT 0,'
    + 'PRIMARY KEY(`number_id`)'
    +  ')', 
        function (err) {
            if (err) throw err;
        }
    );
  });
});

client.on("messageCreate", async messageCreate => {
  if (!messageCreate.guild || messageCreate.author.bot) return;

  const authorid = `${messageCreate.author.id}`;
  const guildid = `${messageCreate.guild.id}`;

  dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+authorid+'' , (err, rows) => {
    if(err) throw err;

    let sql;

    if(rows.length < 1) {
      sql = 'INSERT INTO `UserPoints` (`id_user`, `id_group`) VALUES ('+authorid+', '+guildid+')';
    } else {
      return;
    }
      dbconnection.query(sql, console.log);
  });


//---------------------------------------------------------------------------------------------------------------------------------------------
  if (messageCreate.content.indexOf(process.env.prefix) !== 0) return;

  // Also we use the config prefix to get our arguments and command:
  const args = messageCreate.content.split(/\s+/g);
  const command = args.shift().slice(process.env.prefix.length).toLowerCase();

  if(command === "points") {

    const user = messageCreate.mentions.users.first();
    const guildid = `${messageCreate.guild.id}`;
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;
        let sql;

        sql = 'SELECT `apoints`, `fppoints`, `sorpoints`, `brgpoints` FROM `UserPoints` WHERE `id_user` = '+user+'';

        const member = messageCreate.mentions.members.first();

        let apointsamount;  
        if (member.roles.cache.some(role => role.name === 'Belgian Army')) {
            if (rows[0].apoints == 90) {
              apointsamount = rows[0].apoints + " " + "[MAX]"
            } else if (rows[0].apoints < 90){
              apointsamount = rows[0].apoints
            }
        } else {
          apointsamount = "This user is not part of the army!";
        };

        let fppointsamount;  
        if (member.roles.cache.some(role => role.name === 'Federal Police')) {
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
        if (member.roles.cache.some(role => role.name === 'Special Operations Regiment')) {
          if (rows[0].sorpoints == 35) {
            sorpointsamount = rows[0].sorpoints + " " + "[MAX]"
          } else if (rows[0].sorpoints < 35){
            sorpointsamount = rows[0].sorpoints
          }
        } else{
          sorpointsamount = "This user is not part of this division.";
        };

        let brgpointsamount;  
        if (member.roles.cache.some(role => role.name === 'Belgian Royal Guards')) {
          if (rows[0].brgpoints == 50) {
            brgpointsamount = rows[0].brgpoints + " " + "[MAX]"
          } else if (rows[0].brgpoints < 50){
            brgpointsamount = rows[0].brgpoints
          }
        } else{
          brgpointsamount = "This user is not part of this division.";
        };

        messageCreate.channel.send({embeds: [{
          color: 16108848,
          description: `**Here are ${user.toString()}'s points:**\n`,
          fields: [
            {name: `Belgian Army Points`, value: `${apointsamount}`, inline: false},
            {name: `Federal Police Points`, value: `${fppointsamount}`, inline: false},
            {name: `Special Operations Regiment Points`, value: `${sorpointsamount}`, inline: false},
            {name: `Belgian Royal Guards Points`, value: `${brgpointsamount}`, inline: false}
          ],
          author: {name: messageCreate.author.tag, icon_url: messageCreate.author.displayAvatarURL()}
        }]});
      });
  };
 //---------------------------------------------------------------------------------------------------------------------------------------------

  if(command === "aadd") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const member = messageCreate.mentions.members.first();

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) return messageCreate.reply("You didn't tell me how many points to give.");
    if(pointsToAdd <= 0) return messageCreate.reply("You have to give me a value greater than 0!");
    if(pointsToAdd > 10) return messageCreate.reply("You can only add from 1 to 10 points!");

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let sql;

      sql = 'UPDATE `UserPoints` SET `apoints` = `apoints` + '+pointsToAdd+' WHERE `id_user` = '+user+'';
        

      dbconnection.query(sql);

      anewpointsamount = rows[0].apoints + pointsToAdd;

      if (anewpointsamount < 90) {
        return messageCreate.channel.send(`${user.toString()} has received ${pointsToAdd} points, and now stands at `+anewpointsamount+` points.`)
      } else if (anewpointsamount >= 90) {
        sql = 'UPDATE `UserPoints` SET `apoints` = '+90+' WHERE `id_user` = '+user+''
        dbconnection.query(sql);
        messageCreate.reply(`${user.toString()} is now at 90 points, and can no longer gain any more!`)
      } else{
        return;
      };

      if (anewpointsamount > 4 && member.roles.cache.some(role => role.name === 'Recruit [LR]') || anewpointsamount > 9 && member.roles.cache.some(role => role.name === 'Private [LR]') || anewpointsamount > 14 && member.roles.cache.some(role => role.name === 'First Class Private [LR]') || anewpointsamount > 19 && member.roles.cache.some(role => role.name === 'Corporal [LR]') || anewpointsamount > 29 && member.roles.cache.some(role => role.name === 'Chief Corporal [MR]') || anewpointsamount > 39 && member.roles.cache.some(role => role.name === 'First Chief Corporal [MR]') || anewpointsamount > 54 && member.roles.cache.some(role => role.name === 'Sergeant [MR]') || anewpointsamount > 69 && member.roles.cache.some(role => role.name === 'Chief Sergeant [MR]')) {
        messageCreate.channel.send(`${messageCreate.author.toString()}, you have to promote ${user.toString()}!`);
      }
      return;

    });

    return;
  };

  if(command === "fpadd") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const member = messageCreate.mentions.members.first();

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) return messageCreate.reply("You didn't tell me how many points to give.");
    if(pointsToAdd <= 0) return messageCreate.reply("You have to give me a value greater than 0!")
    if(pointsToAdd > 10) return messageCreate.reply("You can only add from 1 to 10 points!")

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let sql;

      sql = 'UPDATE `UserPoints` SET `fppoints` = `fppoints` + '+pointsToAdd+' WHERE `id_user` = '+user+'';
      
      
      dbconnection.query(sql);

      fpnewpointsamount = rows[0].fppoints + pointsToAdd;

      if (fpnewpointsamount < 35) {
        return messageCreate.channel.send(`${user.toString()} has received ${pointsToAdd} points, and now stands at `+fpnewpointsamount+` points.`);
      } else if (fpnewpointsamount >= 35) {
        sql = 'UPDATE `UserPoints` SET `fppoints` = '+35+' WHERE `id_user` = '+user+''
        dbconnection.query(sql);
        messageCreate.reply(`${user.toString()} is now at 35 points, and can no longer gain any more!`)
      } else{
        return;
      };

      if (fpnewpointsamount > 4 && member.roles.cache.some(role => role.name === 'Junior Agent') || fpnewpointsamount > 9 && member.roles.cache.some(role => role.name === 'Agent') || fpnewpointsamount > 14 && member.roles.cache.some(role => role.name === 'Vice Inspector') || fpnewpointsamount > 19 && member.roles.cache.some(role => role.name === 'Inspector') || fpnewpointsamount > 24 && member.roles.cache.some(role => role.name === 'Vice Chief Inspector') || fpnewpointsamount > 34 && member.roles.cache.some(role => role.name === 'Chief Inspector')) {
        messageCreate.channel.send(`${messageCreate.author.toString()}, you have to promote ${user.toString()}!`);
      }
      return;
    });
    return;
  };

  if(command === "soradd") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const member = messageCreate.mentions.members.first();

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) return messageCreate.reply("You didn't tell me how many points to give.");
    if(pointsToAdd <= 0) return messageCreate.reply("You have to give me a value greater than 0!")
    if(pointsToAdd > 10) return messageCreate.reply("You can only add from 1 to 10 points!")

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let sql;

      sql = 'UPDATE `UserPoints` SET `sorpoints` = `sorpoints` + '+pointsToAdd+' WHERE `id_user` = '+user+'';
      
      
      dbconnection.query(sql);

      sornewpointsamount = rows[0].sorpoints + pointsToAdd;

      if (sornewpointsamount < 35) {
        return messageCreate.channel.send(`${user.toString()} has received ${pointsToAdd} points, and now stands at `+sornewpointsamount+` points.`);
      } else if (sornewpointsamount >= 35) {
        sql = 'UPDATE `UserPoints` SET `sorpoints` = '+35+' WHERE `id_user` = '+user+''
        dbconnection.query(sql);
        messageCreate.reply(`${user.toString()} is now at 35 points, and can no longer gain any more!`)
      } else{
        return;
      };

      if (sornewpointsamount > 9 && member.roles.cache.some(role => role.name === 'Junior Operator') || sornewpointsamount > 19 && member.roles.cache.some(role => role.name === 'Operator') || sornewpointsamount > 34 && member.roles.cache.some(role => role.name === 'Senior Operator')) {
        messageCreate.channel.send(`${messageCreate.author.toString()}, you have to promote ${user.toString()}!`);
      }
      return;
    });
    return;
  };

  if(command === "brgadd") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const member = messageCreate.mentions.members.first();

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) return messageCreate.reply("You didn't tell me how many points to give.");
    if(pointsToAdd <= 0) return messageCreate.reply("You have to give me a value greater than 0!")
    if(pointsToAdd > 10) return messageCreate.reply("You can only add from 1 to 10 points!")

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let sql;

      sql = 'UPDATE `UserPoints` SET `brgpoints` = `brgpoints` + '+pointsToAdd+' WHERE `id_user` = '+user+'';
      
      
      dbconnection.query(sql);

      brgnewpointsamount = rows[0].brgpoints + pointsToAdd;

      if (brgnewpointsamount < 50) {
        return messageCreate.channel.send(`${user.toString()} has received ${pointsToAdd} points, and now stands at `+brgnewpointsamount+` points.`);
      } else if (brgnewpointsamount >= 50) {
        sql = 'UPDATE `UserPoints` SET `brgpoints` = '+50+' WHERE `id_user` = '+user+''
        dbconnection.query(sql);
        messageCreate.reply(`${user.toString()} is now at 50 points, and can no longer gain any more!`)
      } else{
        return;
      };

      if (brgnewpointsamount > 9 && member.roles.cache.some(role => role.name === 'Enlistment') || brgnewpointsamount > 29 && member.roles.cache.some(role => role.name === 'Royal Guard') || brgnewpointsamount > 49 && member.roles.cache.some(role => role.name === 'Professional Guard')) {
        messageCreate.channel.send(`${messageCreate.author.toString()}, you have to promote ${user.toString()}!`);
      }
      return;
    });
    return;
  };

 //---------------------------------------------------------------------------------------------------------------------------------------------

  if(command === "aremove") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToRemove = parseInt(args[1], 10);
    if(!pointsToRemove) return messageCreate.reply("You didn't tell me how many points to remove.");
    if(pointsToRemove <= 0) return messageCreate.reply("You have to give me a value greater than 0!");
    if(pointsToRemove > 10) return messageCreate.reply("You can only remove from 1 to 10 points!");
    if(pointsToRemove > `apoints`) return messageCreate.reply("no lol!");

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let limit;
      limit = 'SELECT `apoints` FROM `UserPoints` WHERE `id_user` = '+user+'';

      limitamount = rows[0].apoints;

      if(pointsToRemove <= limitamount) {
        let sql;
        sql = 'UPDATE `UserPoints` SET `apoints` = `apoints` - '+pointsToRemove+' WHERE `id_user` = '+user+'';
        dbconnection.query(sql);

        anewpointsamount = rows[0].apoints - pointsToRemove;
  
        messageCreate.channel.send(`${user.toString()} has ${pointsToRemove} points less, and now stands at `+anewpointsamount+` points.`);
        return;
      } else {
        console.log("Attempted to remove too much from " + user + " on army: "+ limitamount);
        return messageCreate.reply("You can't remove this much points or you will go under 0!");
      }
    });
    return;
  };

  if(command === "fpremove") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToRemove = parseInt(args[1], 10);
    if(!pointsToRemove) return messageCreate.reply("You didn't tell me how many points to remove.");
    if(pointsToRemove <= 0) return messageCreate.reply("You have to give me a value greater than 0!")
    if(pointsToRemove > 10) return messageCreate.reply("You can only remove from 1 to 10 points!")

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let limit;
      limit = 'SELECT `fppoints` FROM `UserPoints` WHERE `id_user` = '+user+'';

      limitamount = rows[0].fppoints;

      if(pointsToRemove <= limitamount) {
        let sql;
        sql = 'UPDATE `UserPoints` SET `fppoints` = `fppoints` - '+pointsToRemove+' WHERE `id_user` = '+user+'';
        dbconnection.query(sql);

        fpnewpointsamount = rows[0].fppoints - pointsToRemove;
  
        messageCreate.channel.send(`${user.toString()} has ${pointsToRemove} points less, and now stands at `+fpnewpointsamount+` points.`);
        return;
      } else {
        console.log("Attempted to remove too much from " + user + " on FP: "+ limitamount);
        return messageCreate.reply("You can't remove this much points or you will go under 0!");
      }
    });
    return;
  };

  if(command === "sorremove") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToRemove = parseInt(args[1], 10);
    if(!pointsToRemove) return messageCreate.reply("You didn't tell me how many points to remove.");
    if(pointsToRemove <= 0) return messageCreate.reply("You have to give me a value greater than 0!")
    if(pointsToRemove > 10) return messageCreate.reply("You can only remove from 1 to 10 points!")

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let limit;
      limit = 'SELECT `sorpoints` FROM `UserPoints` WHERE `id_user` = '+user+'';

      limitamount = rows[0].sorpoints;

      if(pointsToRemove <= limitamount) {
        let sql;
        sql = 'UPDATE `UserPoints` SET `sorpoints` = `sorpoints` - '+pointsToRemove+' WHERE `id_user` = '+user+'';
        dbconnection.query(sql);

        sornewpointsamount = rows[0].sorpoints - pointsToRemove;
  
        messageCreate.channel.send(`${user.toString()} has ${pointsToRemove} points less, and now stands at `+sornewpointsamount+` points.`);
        return;
      } else {
        console.log("Attempted to remove too much from " + user + " on SOR: "+ limitamount);
        return messageCreate.reply("You can't remove this much points or you will go under 0!");
      }
    });
    return;
  };

  if(command === "brgremove") {
    if(!messageCreate.member.roles.cache.some(r=>["Hosting Permission"].includes(r.name)) ) return messageCreate.reply("You don't have the permission to run this command.");

    const user = messageCreate.mentions.users.first();
    if(!user) return messageCreate.reply("You must mention someone or give their ID!");

    let pointsToRemove = parseInt(args[1], 10);
    if(!pointsToRemove) return messageCreate.reply("You didn't tell me how many points to remove.");
    if(pointsToRemove <= 0) return messageCreate.reply("You have to give me a value greater than 0!")
    if(pointsToRemove > 10) return messageCreate.reply("You can only remove from 1 to 10 points!")

    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+user+'' , (err, rows) => {
      if(err) throw err;

      let limit;
      limit = 'SELECT `brgpoints` FROM `UserPoints` WHERE `id_user` = '+user+'';

      limitamount = rows[0].brgpoints;

      if(pointsToRemove <= limitamount) {
        let sql;
        sql = 'UPDATE `UserPoints` SET `brgpoints` = `brgpoints` - '+pointsToRemove+' WHERE `id_user` = '+user+'';
        dbconnection.query(sql);

        brgnewpointsamount = rows[0].brgpoints - pointsToRemove;
  
        messageCreate.channel.send(`${user.toString()} has ${pointsToRemove} points less, and now stands at `+brgnewpointsamount+` points.`);
        return;
      } else {
        console.log("Attempted to remove too much from " + user + " on BRG: "+ limitamount);
        return messageCreate.reply("You can't remove this much points or you will go under 0!");
      }
    });
    return;
  };
});
//---------------------------------------------------------------------------------------------------------------------------------------------
roblox.setCookie(process.env.ROBLOX_COOKIE).catch(async err => {
  console.log(chalk.red('Issue with logging in: ' + err));
});

let commandlist = [];

var firstshout = true;
var shout;

async function onShout(){
  let shoutchannel = await client.channels.cache.get(process.env.shoutchannelid);
  if(firstshout == true){
    firstshout = false;
    shout = await roblox.getShout(Number(process.env.ArmyGroupId));
    setTimeout(onShout, 30000);
  } else {
    setTimeout(onShout, 30000);

    let currentshout = await roblox.getShout(Number(process.env.ArmyGroupId));

    if(currentshout.body == shout.body) return;

    if(currentshout.body){
      shoutchannel.send({embeds: [{
        color: 2127726,
        description: currentshout.body,
        author: {name: currentshout.poster.username, icon_url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${shout.poster.username}`}
      }]});
    } else {
      shoutchannel.send({embeds: [{
        color: 2127726,
          description: '*Shout cleared.*',
            author: {name: currentshout.poster.username, icon_url: `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&format=png&username=${shout.poster.username}`}
      }]});
    }

    shout = currentshout;
  }
}

if(process.env.shoutchannelid !== 'false'){
  setTimeout(onShout, 15000);
}

fs.readdir('./commands/', async (err, files) => {
    if(err){
        return console.log(chalk.red('An error occured when checking the commands folder for commands to load: ' + err));
    }

    files.forEach(async (file) => {
        if(!file.endsWith('.js')) return;
        let commandFile = require(`./commands/${file}`);
        commandlist.push({
            file: commandFile,
            name: file.split('.')[0]
        });
    });
});

client.on('ready', async () => {
  console.log(chalk.yellow(figlet.textSync('BAFPointsBot', { horizontalLayout: 'full' })));

  console.log(chalk.red(`Bot started!\n---\n`
  + `> Users: ${client.users.cache.size}\n`
  + `> Channels: ${client.channels.cache.size}\n`
  + `> Servers: ${client.guilds.cache.size}`));

  let botstatus = fs.readFileSync('./bot-status.json');
  botstatus = JSON.parse(botstatus);

  if(botstatus.activity == 'false') return;

  if(botstatus.activitytype == 'STREAMING'){
    client.user.setActivity(botstatus.activitytext, {
      type: botstatus.activitytype,
      url: botstatus.activityurl
    });
  } else {
    client.user.setActivity(botstatus.activitytext, {
      type: botstatus.activitytype
    });
  }
});

client.on('messageCreate', async (messageCreate) => {
    if(messageCreate.author.bot) return;
    if(!messageCreate.content.startsWith(process.env.prefix)) return;

    const args = messageCreate.content.slice(process.env.prefix.length).split(' ');
    const commandName = args[0].toLowerCase();
    args.shift();
    const command = commandlist.findIndex((cmd) => cmd.name === commandName);

    if(command == -1) return;
    commandlist[command].file.run(client, messageCreate, args);
});

// Start the bot by logging it in.

client.login(process.env.DISCORD_TOKEN);