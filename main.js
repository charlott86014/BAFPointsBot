const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const express = require('express');
const app = express();
const mysql = require('mysql');
const roblox = require('noblox.js');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
require('dotenv').config();

dbconnection = mysql.createPool({
    host: `${process.env.databaseHost}`,
    port: `${process.env.databasePort}`,
    user: `${process.env.databaseUser}`,
    password: `${process.env.databasePassword}`,
    database: `${process.env.databaseCode}`,
    connectionLimit: 10
});

app.get('/', (request, response) => {
  response.sendStatus(200);
});

let listener = app.listen(process.env.PORT, () => {
  console.log('Your app is currently listening on port: ' + listener.address().port);
});

dbconnection.getConnection(function(err) {
    if (err) throw err;
    console.log("Database successfully connected!");
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

dbconnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.databaseCode}`, function (err) {
  if (err) throw err;
  dbconnection.query(`USE ${process.env.databaseCode}`, function (err) {
    if (err) throw err;
    dbconnection.query('CREATE TABLE IF NOT EXISTS `UserPoints`('
    + '`id_user` BIGINT NOT NULL,'
    + '`id_group` BIGINT NOT NULL DEFAULT ' + process.env.ArmyGuildId + ','
    + '`apoints` INT NOT NULL DEFAULT 0,'
    + '`fppoints` INT NOT NULL DEFAULT 0,'
    + '`sorpoints` INT NOT NULL DEFAULT 0,'
    + '`brgpoints` INT NOT NULL DEFAULT 0,'
    + 'PRIMARY KEY(`id_user`)'
    +  ')', 
        function (err) {
            if (err) throw err;
        }
    );
  });
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

client.on('messageCreate', async (messageCreate) => {
    if (!messageCreate.guild || messageCreate.author.bot) return;
  
    const authorid = `${messageCreate.author.id}`;
  
    dbconnection.query('SELECT * FROM `UserPoints` WHERE `id_user` = '+authorid+'' , (err, rows) => {
      if(err) throw err;
  
      let sql;
  
      if(rows.length < 1) {
        sql = 'INSERT INTO `UserPoints` (`id_user`) VALUES ('+authorid+')';
      } else {
        return;
      }
        dbconnection.query(sql);
    });

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