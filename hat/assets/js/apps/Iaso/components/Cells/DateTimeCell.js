import {
    displayDateFromTimestamp,
    textPlaceholder,
} from 'bluesquare-components';
import moment from 'moment';

/* DateTimeCell
   For use in Table's columns to display DateTime
 */
export const DateTimeCell = cellInfo =>
    cellInfo.value ? displayDateFromTimestamp(cellInfo.value) : textPlaceholder;

export const DateTimeCellRfc = cellInfo =>
    cellInfo.value ? moment(cellInfo.value).format('LTS') : textPlaceholder;

export const DateCell = cellInfo =>
    cellInfo.value ? moment(cellInfo.value).format('L') : textPlaceholder;

export const convertValueIfDate = value => {
    //  returning numbers early as they can be valid moments (unix timestamps)
    if (typeof value === 'number') return value;
    const asMoment = moment(value);
    // Check if the hour and minutes are 00:00. If so, use 'L' format, otherwise use 'LTS'
    if (asMoment.isValid()) {
        return asMoment.format(
            asMoment.hour() === 0 && asMoment.minute() === 0 ? 'L' : 'LTS',
        );
    }
    return value;
};
