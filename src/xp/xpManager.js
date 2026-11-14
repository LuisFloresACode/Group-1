import {getXP, saveXP} from "./xpStorage";

export function calculateLevel(xp){
    return Math.floor(xp / 100) + 1;
}

export function addXP(currentXP, amount) {
    return currentXP + amount;
}

export function awardXP(serverId, userId, amount) {
    if(!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error("XP amount must be a positive integer.")
    }

    const currentXP = getXP(serverId, userId);

    let oldLevel = calculateLevel(currentXP);

    let newXP = addXP(currentXP, amount);

    if (!Number.isSafeInteger(newXP)) {
        throw new Error("Total XP exceeds the safe integer limit.");
    }

    saveXP(serverId, userId, newXP);

    let newLevel = calculateLevel(newXP);

    return {
        xp: newXP,
        level: newLevel,
        leveledUp: newLevel > oldLevel
    };
}