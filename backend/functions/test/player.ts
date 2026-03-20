//roll a D6 and return the result
export function roll6(): number {
    console.log("[roll6] Rolling a D6");
    const roll : number = Math.floor(Math.random() * 6 + 1);
    console.log("[roll6] Rolled a",roll);
    return roll;
}

//make a mork borg style difficulty test
export function rollTest(difficulty: number, modifier: number) : {succeded: boolean, roll: number, modifier: number, modifiedRoll: number, difficulty: number} {

    console.log("[rollTest] Rolling a test of difficulty",difficulty,"with a ",(modifier >= 0 ? "+" : ""),modifier,"modifier");

    const roll : number = Math.floor(Math.random() * 20 + 1);
    const modifiedRoll : number = roll+modifier;
    const succeded : boolean = modifiedRoll >= difficulty;

    console.log("[rollTest] Test",(succeded ? "succeded." : "failed."),"Roll :",roll,"(dice)",(modifier >= 0 ? "+" : ""),modifier,"(modifier)","=",modifiedRoll,(succeded ? ">=" : "<"),difficulty,"(difficulty)");

    return {succeded, roll, modifier, modifiedRoll, difficulty};
}