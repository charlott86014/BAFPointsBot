require('dotenv').config();
exports.run = async (client, messageCreate, args) => {
    return messageCreate.channel.send({embeds: [{
        color: 16108848,
        description: `**Here's the list of the Roblox group ranks:**\n`,
        fields: [
            {name: `**RANKS**`, value: "1) Junior Agent - Min. Points = 0\n 2) Agent - Min. Points = 5\n 3) Vice Inspector - Min. Points = 10\n 4) Inspector - Min. Points = 15\n 5) Vice Chief Inspector - Min. Points = 20\n 6) Chief Inspector - Min. Points = 25\n 7) Vice Inspector - Min. Points = 35", inline: false},
            {name: `**LOCKED RANKS (ACCESS ONLY THROUGH APPLICATIONS).**`, value: "8) Commissar\n 9) Chief Commissar\n 10) Deputy Director\n 11) Director", inline: false},
            {name: `**ADMINISTRATORS**`, value: "Overseer\n Minister of Defence", inline: false}
        ],
        author: {name: messageCreate.author.tag, icon_url: messageCreate.author.displayAvatarURL()},
        timestamp: new Date()
    }]});
}