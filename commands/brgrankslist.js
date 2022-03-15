require('dotenv').config();
exports.run = async (client, messageCreate, args) => {
    return messageCreate.channel.send({embeds: [{
        color: 16108848,
        description: `**Here's the list of the Roblox group ranks:**\n`,
        fields: [
            {name: `**RANKS**`, value: "1) Enlistment - Min. Points = 0\n 2) Royal Guard - Min. Points = 10\n 3) Professional Guard - Min. Points = 30\n 4) Expert Guard - Min. Points = 50", inline: false},
            {name: `**LOCKED RANKS (ACCESS ONLY THROUGH APPLICATIONS).**`, value: "5) Guard-In-Academy\n 6) Junior Instructor\n 7) Instructor\n 8) Professional Instructor\n 9) Expert Instructor\n 10) Head of Instructors\n 11) Vice Commander-In-Chief\n 12)Commander-In-Chief", inline: false},
            {name: `**ADMINISTRATORS**`, value: "Overseer\n Minister of Defence", inline: false}
        ],
        author: {name: messageCreate.author.tag, icon_url: messageCreate.author.displayAvatarURL()},
        timestamp: new Date()
    }]});
}