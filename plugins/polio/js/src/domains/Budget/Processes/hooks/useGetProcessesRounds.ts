import { useCallback } from 'react';
import uniqWith from 'lodash/uniqWith';
import { isEqual } from 'lodash';
import { BudgetProcesses, Round } from '../types';
import { useFormatRound } from './useFormatRound';

export const useGetProcessesRounds = (): ((
    // eslint-disable-next-line no-unused-vars
    processes: BudgetProcesses[],
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
