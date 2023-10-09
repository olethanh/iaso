import { UseQueryResult } from 'react-query';
import { getRequest } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/Api';
import { useSnackQuery } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/apiHooks';
import { makeUrlWithParams } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/utils';
import { BudgetProcesses } from '../../types';

type BudgetProcessesParams = {
    rounds?: string;
    enabled?: boolean;
};

const getBudgetProcesses = async (
    options: BudgetProcessesParams,
): Promise<BudgetProcesses[]> => {
    const { pageSize, order, page, rounds } = options as Record<string, any>;
    const params = {
        limit: pageSize,
        order,
        page,
        rounds,
    };
    const url = makeUrlWithParams('/api/polio/budgetprocesses/', params);
    return getRequest(url) as Promise<BudgetProcesses[]>;
};
export const useGetBudgetProcesses = (
    options: BudgetProcessesParams,
): UseQueryResult<BudgetProcesses[], Error> => {
    const { select, enabled = true } = options as Record<string, any>;
    return useSnackQuery({
        queryKey: ['budgetProcesses', options],
        queryFn: () => getBudgetProcesses(options),
        snackErrorMsg: undefined,
        options: {
            select,
            enabled,
        },
    });
};
