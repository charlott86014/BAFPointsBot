require('dotenv').config();
exports.run = async (client, messageCreate, args) => {
    return messageCreate.channel.send({embeds: [{
        color: 16108848,
        description: `**Here are my commands (case-sensitive):**\n`,
        fields: [
            {name: `${process.env.prefix}help`, value: "Shows this list of commands.", inline: false},
            {name: `${process.env.prefix}points <user_mention>`, value: "Shows the points of the mentioned user.", inline: false},
            {name: `${process.env.prefix}aadd/fpadd/soradd/brgadd <user_mention> <points_number>`, value: "Adds <points_number> points to the mentioned user.", inline: false},
            {name: `${process.env.prefix}aremove/fpremove/sorremove/brgremove <user_mention> <points_number>`, value: " Removes <points_number> points to the mentioned user.", inline: false},
            {name: `${process.env.prefix}arankslist/fprankslist/sorrankslist/brgrankslist`, value: "Shows every rank in the group, the relative role number and the minimun number of points needed to rank up.", inline: false}
        ],
        author: {name: messageCreate.author.tag, icon_url: messageCreate.author.displayAvatarURL()},
        timestamp: new Date()
    }]});
}