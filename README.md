<h1>DEPRECATED</h1>
<img alt="Static Badge" src="https://img.shields.io/badge/maintenance-deprecated-orange">
I might come back to working on it in the future. The whole bot would have to be rewrited because of Discord's changes to their APIs.
    
# BAFPointsBot 
This bot was designed to manage a roblox group on a discord server by adding/removing points and automatically promoting/demoting players by saving all data in a database (all the commands are created with the intention to work with my group, but you are free to change it for your own needs).  
I started working on this bot a few years ago but didn't have any coding experience (you might find some bugs because I don't have much experience with JavaScript), but I intend to work on it in my spare time.

# HOW TO USE 
Personally, I'm hosting this bot on <a href="https://www.heroku.com/">Heroku</a>; also, I'm using the JawsDB Maria add-on to create the database. You can host it wherever you want (even on your own device, but make sure to install <a href="https://nodejs.org/">Node.js</a> first and the relative packages indicated on the [PACKAGES USED](#packages-used) section; you can then start the bot with the command <code>node main.js</code> from your terminal).  
There are several env variables to set; to do so, you need fill out the.env.example file I supplied to the repository (be sure to remove the .example part).

# PACKAGES USED
<ul>
    <li><b><a href="https://discord.js.org/#/">discord.js</a></b> - Allows to interact with Discord's API</li> 
    <li><b><a href="https://noblox.js.org/">noblox.js</a></b> - Allows to interact with Roblox's API</li> 
    <li><b><a href="https://www.npmjs.com/package/mysql">mysql</a></b> - Used to create and manage the database</li> 
    <li><b><a href="https://www.npmjs.com/package/dotenv">dotenv</a></b> - Allows the use of .env files</li> 
    <li><b><a href="https://www.npmjs.com/package/express">express</a></b> - Web Framework</li> 
    <li><b><a href="https://www.npmjs.com/package/chalk">chalk</a></b> - Used to color some errors in the console, to make it easier for them to get spotted (estetic purposes only)</li> 
    <li><b><a href="https://www.npmjs.com/package/figlet">figlet</a></b> - Used to create ASCII art from text (estetic purposes only)</li> 
</ul>
You can install them singularly or use the following command:
<br>
<code>npm i discord.js noblox.js mysql dotenv express chalk figlet</code>  

# CREDITS 
I took the foundation of this bot from <a href="https://github.com/LengoLabs/qbot">LengoLabs's qbot repository</a>.
