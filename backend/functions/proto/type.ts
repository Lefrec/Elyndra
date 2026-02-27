export type Item = {
    name: string;
    desc: string;
    amount: number;
}

export type Entity = {
    name: string;
    desc: string;
    currentHP: number;
}

export type Player = {
    name: string;
    class: ['Knight','Mage'];
    maxHP: number;
    currentHP: number;
    str: number;
    dex: number;
    con: number;
    int: number;
    isCurrent: boolean;
}