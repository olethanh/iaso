export type Round = {
    id: number;
    number: number;
};

export type BudgetProcess = {
    id: number;
    created_at: number;
    updated_at: number;
    rounds: Round[];
    teams: number[];
};
