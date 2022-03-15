require('dotenv').config();
exports.run = async (client, messageCreate, args) => {
    return messageCreate.channel.send({embeds: [{
        color: 16108848,
        description: `**Here's the list of the Roblox group ranks:**\n`,
        fields: [
            {name: `**RANKS**`, value: "1) Recruit [LR] - Min. Points = 0\n 2) Private [LR] - Min. Points = 5\n 3) Private First Class [LR] - Min. Points = 10\n 4) Corporal [LR] - Min. Points = 15\n 5) Chief Corporal [MR] - Min. Points = 20\n 6) First Chief Corporal [MR] - Min. Points = 30\n 7) Sergeant [MR] - Min. Points = 40\n 8) Chief Sergeant [MR] - Min. Points = 55\n 9) First Master Sergeant [MR] - Min. Points = 70\n 10) First Chief Sergeant [MR] - Min. Points = 90 ", inline: false},
            {name: `**LOCKED RANKS (ACCESS ONLY THROUGH APPLICATIONS).**`, value: "11) Warrant Officer [NCO]\n 12) Master Warrant Officer [NCO]\n 13) Chief Warrant Officer [NCO]\n 14) Second Lieutenant [HR]\n 15) Lieutenant [HR]\n 16) Captain [HR]\n 17) Senior Captain [HR]\n 18) Major [HR]\n 19) Lieutenant Colonel [HR]\n 20) Colonel [HR]\n 21) Brigadier General [HICOM]\n 22) Major General [HICOM]\n 23) Lieutenant General [HICOM]\n 24) General [HICOM]", inline: false},
            {name: `**MINISTRY RANK (ACCESS ONLY THROUGH SELECTION).**`, value: "Member of Defence Ministry\n Senior Member of Defence Ministry\n Executive of Defence Ministry\n Deputy Minister of Defence\n Minister of Defence", inline: false}
        ],
        author: {name: messageCreate.author.tag, icon_url: messageCreate.author.displayAvatarURL()},
        timestamp: new Date()
    }]});
}