import { useCallback } from 'react';
import uniqWith from 'lodash/uniqWith';
import { isEqual } from 'lodash';
import { BudgetProcess } from '../types';
import { useFormatRound } from './useFormatRound';
import { Round } from '../../../Campaigns/Scope/Scopes/types';

export const useGetProcessesRounds = (): ((
    // eslint-disable-next-line no-unused-vars
    processes: BudgetProcess[],
) => string) => {
    const formatRound = useFormatRound();
    const getProcessesRounds = useCallback(
        processes =>
            uniqWith(
                processes.flatMap(proccess => proccess.rounds),
                isEqual,
            )
                .map((round: Round) => formatRound(round.number))
                .join(', '),
        [formatRound],
    );
    return getProcessesRounds;
};
