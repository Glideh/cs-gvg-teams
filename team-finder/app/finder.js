const Yaml = require('js-yaml');
const Fs = require('fs');

let implementedGardians = Yaml.safeLoad(Fs.readFileSync('./gardians.yml', 'utf8'));
let implementedSkills = Yaml.safeLoad(Fs.readFileSync('./skills.yml', 'utf8'));

const directions = {
    knight: null,
    queen: null,
    king: null,
    rook: null,
    bishop: null,
};


/**
 * Checks if one of the gardian's skills is found in the team
 * Exception for the DPS
 */
function skillAlreadyInTeam(gardian, team)
{
    let teamSkill = [];
    for (let x in team) {
        if (!team[x]) {
            continue;
        }
        for (let y in team[x].skills) {
            teamSkill.push(team[x].skills[y]);
        }
    }
    for (let y in gardian.skills) {
        if (gardian.skills[y] === 'dps') {
            continue;
        }
        if (teamSkill.indexOf(gardian.skills[y]) !== -1) {
            // console.log(gardian.skills[y] + ' skill already there');
            return true;
        }
    }
    return false;
}


/**
 * Checks if the gardian can fit in the team
 * - The direction slot must be empty (not already a gardian with the same direction)
 * - The same gardian must not be found (regardless of the direction)
 * - One of his skills must not be found
 */
function canFitIn(team, gardian)
{
    for (let direction in team) {
        // console.log(`Trying to fill the ${direction} slot`);
        if (!team[direction]) {
            // console.log('No one in this slot');
            continue;
        }
        if (gardian.direction === direction) {
            // console.log('Slot already filled');
            return false;
        }
        if (gardian.name === team[direction].name) {
            // console.log('Same gardian');
            return false;
        }
        if (skillAlreadyInTeam(gardian, team)) {
            return false;
        }
    }
    return true;
}


function teamPower(team)
{
    let power = 0;
    for (let direction in team) {
        for (let x in team[direction].skills) {
            // console.log('Skill ' + team[direction].skills[x]);
            power += implementedSkills[team[direction].skills[x]].power;
        }
    }

    return power;
}


/**
 * Checks if the team's gardians can fit together
 */
function teamIsFit(team)
{
    for (let direction in team) {
        let gardian = team[direction];
        let teamWithoutGardian = Object.keys(team).map(d => team[d] === gardian ? null : team[d]);
        if (!canFitIn(teamWithoutGardian, gardian)) {
            // console.log(`${gardian.name} can't fit`);
            return false;
        }
    }
    return true;
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function shuffleObject(data)
{
    let dataArray = Object.keys(data);
    shuffleArray(dataArray);
    return dataArray.map(id => data[id]);
}


/**
 * Finds gardians that can fit together
 */
function findTeam(userGardians)
{
    let team = /*shuffleObject*/({
        knight: null,
        queen: null,
        king: null,
        rook: null,
        bishop: null,
    });
    let gardians = {};
    if (userGardians) {
        for (key in implementedGardians) {
            if (userGardians.indexOf(key) !== -1) {
                gardians[key] = implementedGardians[key];
            }
        }
    } else {
        gardians = implementedGardians;
    }
    gardians = shuffleObject(gardians);
    for (let key in gardians) {
        let gardian = gardians[key];
        if (canFitIn(team, gardian)) {
            team[gardian.direction] = gardian;
        }
    }
    return team;
}


function teamCRC(team)
{
    return Object.keys(directions).map((direction) => (
        (direction + ' ' + (team[direction] ? team[direction].name : '')).padEnd(15)
    )).join(' | ');
}


function showTeam(team)
{
    return teamCRC(team);
}


function teamIsDouble(team, teams)
{
    return teams.map((t) => teamCRC(t)).indexOf(teamCRC(team)) !== -1;
}


function teamIsNotComplete(team)
{
    for (let x in team) {
        if (!team[x]) {
            return true;
        }
    }
    return false;
}


function teamIsValid(team, teams)
{
    if (teamIsDouble(team, teams)) {
        // console.log('Team already exists');
        return false;
    }
    if (teamIsNotComplete(team)) {
        // console.log('Team is not complete');
        return false;
    }
    return true;
}


function getGardiansList()
{
    let gardians = Object.keys(implementedGardians).map((key) => {
        return {
            name: implementedGardians[key].name,
            direction: implementedGardians[key].direction,
            id: key
        };
    });
    return gardians;
}


module.exports = {
    findTeam,
    teamIsValid,
    teamIsFit,
    showTeam,
    getGardiansList,
    implementedGardians,
    teamPower
};
