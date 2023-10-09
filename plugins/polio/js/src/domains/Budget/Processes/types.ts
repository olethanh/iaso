export type Round = {
    id: number;
    number: number;
};

export type BudgetProcesses = {
    id: number;
    created_at: number;
    updated_at: number;
    rounds: Round[];
    teams: number[];
};
