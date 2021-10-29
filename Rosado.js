require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const fetch = require("node-fetch");

async function getCurrentGame(summonerID) {
    let response = await fetch(`https://la1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${summonerID}?api_key=${process.env.RIOT_API_KEY}`);
    let data = await response.json();

    // let allyTeam;
    // let playerData = {100 : {}, 200 : {}}
    // for (var i = 0; i < data["participants"].length; i++) {
    //     var player = data["participants"][i];
    //     if (player.summonerId == summonerID) allyTeam = player.teamId;
    //     playerData[player.teamId][player.summonerName] = {id : player.summonerId};
    // }

    playerData = []
    for (var i = 0; i < data["participants"].length; i++) {
        var player = data["participants"][i];
        if (player.summonerId == summonerID) allyTeam = player.teamId;
        playerData.push({"summonerName" : player.summonerName, "summonerId" : player.summonerId, "team": player.teamId})
    }

    // playerData = playerData[allyTeam == 100 ? 200 : 100] //== 100 ? 200 : 100

    for (let i = 0; i < playerData.length; i++) {
        let res = await fetch(`https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${playerData[i].summonerId}?api_key=${process.env.RIOT_API_KEY}`)
        let d = await res.json();
        console.log(d)
        for (var queue = 0; queue < d.length; queue++){
            playerData[i][d[queue].queueType] = d[queue].tier
        }
        delete playerData[i]["id"]
    }

    console.log(playerData)
    messages = []
    for (let i = 0; i < playerData.length; i++)
        for (rank in playerData[i]) {
            if (playerData[i][rank] == 'MASTER' || playerData[i][rank] == 'GRANDMASTER' || playerData[i][rank] == 'CHALLENGER')
                messages.push(`Ya perdimos, ${player} es ${playerData[player][rank]} en ${rank.split("_")[1]}`)
        }

    let test = `\`\`\`
    |\t Summoner Name \t|\t Solo/Duo \t|\t Flex \t|
    |\t---------------\t|\t----------\t|\t------\t|
    |\t${playerData[0].summonerName}\t|\t${playerData[0]["RANKED_SOLO_5x5"]}\t|\t${playerData[0]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[1].summonerName}\t|\t${playerData[1]["RANKED_SOLO_5x5"]}\t|\t${playerData[1]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[2].summonerName}\t|\t${playerData[2]["RANKED_SOLO_5x5"]}\t|\t${playerData[2]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[3].summonerName}\t|\t${playerData[3]["RANKED_SOLO_5x5"]}\t|\t${playerData[3]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[4].summonerName}\t|\t${playerData[4]["RANKED_SOLO_5x5"]}\t|\t${playerData[4]["RANKED_FLEX_SR"]}\t|
    ----------------------------------------------------------------------
    |\t${playerData[5].summonerName}\t|\t${playerData[5]["RANKED_SOLO_5x5"]}\t|\t${playerData[5]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[6].summonerName}\t|\t${playerData[6]["RANKED_SOLO_5x5"]}\t|\t${playerData[6]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[7].summonerName}\t|\t${playerData[7]["RANKED_SOLO_5x5"]}\t|\t${playerData[7]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[8].summonerName}\t|\t${playerData[8]["RANKED_SOLO_5x5"]}\t|\t${playerData[8]["RANKED_FLEX_SR"]}\t|
    |\t${playerData[9].summonerName}\t|\t${playerData[9]["RANKED_SOLO_5x5"]}\t|\t${playerData[9]["RANKED_FLEX_SR"]}\t|
    \`\`\``

    if (messages.length == 0) messages.push("ez win son full manquetes")
    messages.unshift(test)
    // messages.unshift(JSON.stringify(playerData, null, 4))

    return messages;
}

bot.login(TOKEN);

const summonerIDs = {
    "111644016575004672" : 'bbi1GTk6yJBs4X2abmVVodWkHYT1xNNe66d9Cfes4Ao', //Crutheo
    // "111644016575004672" : '-VDrP2jslz6zFXRaUO2CjztzvF8nuPJIYLCPxY5Gm9I', //Icecreaam
    "111624120814329856" : '-VDrP2jslz6zFXRaUO2CjztzvF8nuPJIYLCPxY5Gm9I', //Icecreaam
    "98545006221983744"  : 'EGEVMh7vdHouAyJkZkY5D2BrX4WfqchoAmo7Q9N2LXZg', //aless141
    "183823697067376642" : '2rpa5j-vAIXBwShCCsYrfV1kBs7rwpThURxyaTEgRDkb8Q', //IZR98
    "101916503326089216" : '5CmcIYq7TeYYuHBzNz-q-el9I3edcBCgFhCPABnRqO1G', //Alat
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.content.includes('!pupus')) {
    let summonerID = summonerIDs[msg.author.id]
    if (summonerID == undefined) msg.channel.send("No se quien chucha eres");
    else {
        getCurrentGame(summonerID).then(messages => {
            console.log(messages)
             messages.forEach(message => {
                msg.channel.send(message)
            });
        })
    }
    console.log(`[${msg.createdAt}] Server: ${msg.channel.guild.name} | Channel: ${msg.channel.name} | User: ${msg.author.username}`)
  }
});