import { useMemo } from 'react';
import { useSafeIntl } from 'bluesquare-components';
import { DropdownOptions } from '../../../../../../../hat/assets/js/apps/Iaso/types/utils';
import MESSAGES from '../../../constants/messages';

export const useOptions = (): DropdownOptions<string>[] => {
    const { formatMessage } = useSafeIntl();
    return useMemo(() => {
        return [
            {
                label: formatMessage(MESSAGES.latest),
                value: 'latest',
            },
            {
                label: formatMessage(MESSAGES.penultimate),
                value: 'penultimate',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 0`,
                value: '0',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 1`,
                value: '1',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 2`,
                value: '2',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 3`,
                value: '3',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 4`,
                value: '4',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 5`,
                value: '5',
            },
            {
                label: `${formatMessage(MESSAGES.round)} 6`,
                value: '6',
            },
        ];
    }, [formatMessage]);
};
