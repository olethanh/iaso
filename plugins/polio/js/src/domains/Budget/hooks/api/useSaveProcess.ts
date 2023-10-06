import { UseMutationResult } from 'react-query';
import { postRequest } from '../../../../../../../../hat/assets/js/apps/Iaso/libs/Api';
import { useSnackMutation } from '../../../../../../../../hat/assets/js/apps/Iaso/libs/apiHooks';

export type SaveProccessQuery = {
    rounds: number[];
    teams: number[];
};

const endpoint = '/api/polio/budgetprocesses/';

export const useSaveProcess = (): UseMutationResult => {
    const ignoreErrorCodes = [400];
    return useSnackMutation({
        mutationFn: (data: SaveProccessQuery) => postRequest(endpoint, data),
        invalidateQueryKey: ['budget'],
        ignoreErrorCodes,
    });
};
