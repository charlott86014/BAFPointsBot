require('dotenv').config();
exports.run = async (client, messageCreate, args) => {
    return messageCreate.channel.send({embeds: [{
        color: 16108848,
        description: `**Here's the list of the Roblox group ranks:**\n`,
        fields: [
            {name: `**TEAMS**`, value: "Foreign Internal Defense (Revolt Defence)\n Special Reconnaissance (Snipers)\n Direct Action (Raid/Dangerous breachings)\n", inline: false},
            {name: `**RANKS**`, value: "1) Junior Operator - Min. Points = 0\n 2) Operator - Min. Points = 10\n 3) Senior Operator - Min. Points = 20\n 4) Specialist - Min. Points = 35", inline: false},
            {name: `**LOCKED RANKS (ACCESS ONLY THROUGH APPLICATIONS).**`, value: "5) Non Commissioned Officer\n 6) Team Officer", inline: false},
            {name: `**ADMINISTRATORS**`, value: "Overseer\n Minister of Defence", inline: false}
        ],
        author: {name: messageCreate.author.tag, icon_url: messageCreate.author.displayAvatarURL()},
        timestamp: new Date()
    }]});
}