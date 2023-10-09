import { useSafeIntl } from 'bluesquare-components';
import MESSAGES from '../../../../constants/messages';

export const useFormatRound = (): ((
    // eslint-disable-next-line no-unused-vars
    round: number,
) => string) => {
    const { formatMessage } = useSafeIntl();
    return round => `${formatMessage(MESSAGES.round)} ${round}`;
};
