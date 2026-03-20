export type Item = {
    name?: string;
    desc?: string;
    amount?: number;
}

export type Entity = {
    name?: string;
    desc?: string;
    currentHP?: number;
}

export type Player = {
    name?: string;
    class?: ['chevalier','mage','alchimiste','ombre'];
    maxHP?: number;
    currentHP?: number;
    for?: number;
    def?: number;
    mag?: number;
    agi?: number;
    isCurrent?: boolean;
}

export type Gamestate = {
    type: string;
    name: string;
    desc: string;
}