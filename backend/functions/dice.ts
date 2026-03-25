import Pocketbase from "pocketbase";
const pb = new Pocketbase("http://elyndra.paolo-vincent.fr/");

export async function rollTest(id: string, difficulty: number, modifier: number = 0) {
    try {
    console.log("[rollTest] Rolling a test of difficulty",difficulty,"with a ",(modifier >= 0 ? "+" : ""),modifier,"modifier");

    const roll : number = Math.floor(Math.random() * 20 + 1);
    const modifiedRoll : number = roll+modifier;
    const succeded : boolean = modifiedRoll >= difficulty;

    console.log("[rollTest] Test",(succeded ? "succeded." : "failed."),"Roll :",roll,"(dice)",(modifier >= 0 ? "+" : ""),modifier,"(modifier)","=",modifiedRoll,(succeded ? ">=" : "<"),difficulty,"(difficulty)");

    const dice = await pb.collection("Dice").getFullList({filter : `user = '${id}'`});
    console.log("[rollTest] dice :",dice);
    if (dice.length == 0) {
        await pb.collection("Dice").create({succeded, roll, modifier, modifiedRoll, difficulty, user: id});
    } else {
        await pb.collection("Dice").update(dice[0].id, {succeded, roll, modifier, modifiedRoll, difficulty});
    }

    return `Roll has succeded : ${succeded}`;
    } catch (e) {
        console.log("[rollTest] Failed",e);
        return e;
    }
}

export async function getDice(id:string) {
    try {
        const dice = await pb.collection("Dice").getFullList({filter : `user = '${id}'`});
        if (dice.length == 0) {
            return;
        }
        return dice[0];
    } catch (e) {
        console.log("[getDice] Failed",e);
        return e;
    }
}