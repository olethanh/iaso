import { UseQueryResult } from 'react-query';
import { getRequest } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/Api';
import { useSnackQuery } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/apiHooks';
import { makeUrlWithParams } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/utils';
import { BudgetProcess } from '../../types';

type BudgetProcessesParams = {
    rounds?: string;
    campaignId?: string;
    enabled?: boolean;
    // eslint-disable-next-line no-unused-vars
    select?: (data: BudgetProcess[]) => any;
};

const getBudgetsProcesses = async (
    options: BudgetProcessesParams,
): Promise<BudgetProcess[]> => {
    const { pageSize, order, page, rounds, campaignId } = options as Record<
        string,
        any
    >;
    const params = {
        limit: pageSize,
        order,
        page,
        rounds,
        campaignId,
    };
    const url = makeUrlWithParams('/api/polio/budgetprocesses/', params);
    return getRequest(url) as Promise<BudgetProcess[]>;
};
export const useGetBudgetsProcesses = (
    options: BudgetProcessesParams,
): UseQueryResult<BudgetProcess[], Error> => {
    const { select = data => data, enabled = true } = options as Record<
        string,
        any
    >;
    return useSnackQuery({
        queryKey: ['budgetProcesses', options],
        queryFn: () => getBudgetsProcesses(options),
        snackErrorMsg: undefined,
        options: {
            select,
            enabled,
        },
    });
};
