import { UseMutationResult } from 'react-query';
import {
    postRequest,
    patchRequest,
} from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/Api';
import { useSnackMutation } from '../../../../../../../../../hat/assets/js/apps/Iaso/libs/apiHooks';

export type SaveProccessQuery = {
    id?: number;
    rounds: number[];
    teams: number[];
};

const endpoint = '/api/polio/budgetprocesses/';

export const useSaveProcess = (type: 'create' | 'edit'): UseMutationResult => {
    const ignoreErrorCodes = [400];
    const edit = useSnackMutation({
        mutationFn: (data: SaveProccessQuery) =>
            patchRequest(`${endpoint}${data.id}/`, data),
        invalidateQueryKey: ['budget'],
        ignoreErrorCodes,
    });
    const create = useSnackMutation({
        mutationFn: (data: SaveProccessQuery) => postRequest(endpoint, data),
        invalidateQueryKey: ['budget'],
        ignoreErrorCodes,
    });
    switch (type) {
        case 'create':
            return create;
        case 'edit':
            return edit;
        default:
            throw new Error(
                `wrong type expected: create, copy or edit, got:  ${type} `,
            );
    }
};
