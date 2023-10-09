import { UseQueryResult } from 'react-query';
import { getRequest } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/Api';
import { useSnackQuery } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/apiHooks';
import { makeUrlWithParams } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/utils';
import { BudgetProcess } from '../../types';

type BudgetProcessesParams = {
    rounds?: string;
    enabled?: boolean;
    // eslint-disable-next-line no-unused-vars
    select: (data: BudgetProcess[]) => any;
};

const getBudgetProcesses = async (
    options: BudgetProcessesParams,
): Promise<BudgetProcess[]> => {
    const { pageSize, order, page, rounds } = options as Record<string, any>;
    const params = {
        limit: pageSize,
        order,
        page,
        rounds,
    };
    const url = makeUrlWithParams('/api/polio/budgetprocesses/', params);
    return getRequest(url) as Promise<BudgetProcess[]>;
};
export const useGetBudgetProcesses = (
    options: BudgetProcessesParams,
): UseQueryResult<BudgetProcess[], Error> => {
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
