import { UseMutationResult } from 'react-query';
import { selectionInitialState } from 'bluesquare-components';
import { Dispatch, SetStateAction } from 'react';
import { postRequest } from '../../../libs/Api';
import { useSnackMutation } from '../../../libs/apiHooks';

import { Selection } from '../../orgUnits/types/selection';
import { Profile } from '../../teams/types/profile';
import MESSAGES from '../messages';

type OrgUnit = {
    id: string;
};

export type BulkSaveQuery = {
    addRole?: string;
    removeRole?: string;
    addProjects: string[];
    removeProjects: string[];
    language?: 'en' | 'fr';
    locations: OrgUnit[];
    selection: Selection<Profile>;
};

const bulkSaveProfiles = (data: BulkSaveQuery) => {
    const url = `/api/tasks/create/profilesbulkupdate/`;
    const {
        addRole,
        removeRole,
        addProjects,
        removeProjects,
        language,
        locations,
        selection: { selectAll, selectedItems, unSelectedItems },
    } = data;
    return postRequest(url, {
        role_id_added: addRole ? parseInt(addRole, 10) : undefined,
        role_id_removed: removeRole ? parseInt(removeRole, 10) : undefined,
        projects_ids_added: addProjects.map(projectId =>
            parseInt(projectId, 10),
        ),
        projects_ids_removed: removeProjects.map(projectId =>
            parseInt(projectId, 10),
        ),
        location_ids: locations.map(location => parseInt(location.id, 10)),
        language,
        select_all: selectAll,
        selected_ids: selectedItems,
        unselected_ids: unSelectedItems,
    });
};

export const useBulkSaveProfiles = (
    setSelection: Dispatch<SetStateAction<Selection<Profile>>>,
): UseMutationResult => {
    return useSnackMutation({
        mutationFn: bulkSaveProfiles,
        snackSuccessMessage: MESSAGES.taskLaunched,
        invalidateQueryKey: ['profiles'],
        options: {
            onSuccess: () => setSelection(selectionInitialState),
        },
    });
};
