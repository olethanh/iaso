import { useMemo } from 'react';
import { object, string, ObjectSchema, array, number } from 'yup';
import { useSafeIntl } from 'bluesquare-components';
import { useAPIErrorValidator } from '../../../../../../../hat/assets/js/apps/Iaso/libs/validation';
import { ValidationError } from '../../../../../../../hat/assets/js/apps/Iaso/types/utils';

import { SaveProccessQuery } from '../hooks/api/useSaveProcess';
import MESSAGES from '../../../constants/messages';

export const useProcessValidation = (
    errors: ValidationError = {},
    payload: Partial<SaveProccessQuery>,
): ObjectSchema<any> => {
    const { formatMessage } = useSafeIntl();
    const apiValidator = useAPIErrorValidator<Partial<SaveProccessQuery>>(
        errors,
        payload,
    );
    const schema = useMemo(() => {
        return object().shape({
            rounds: array()
                .of(string())
                .nullable()
                .required(formatMessage(MESSAGES.requiredField))
                .test(apiValidator('rounds')),
            teams: array().of(number()).nullable().test(apiValidator('teams')),
        });
    }, [formatMessage, apiValidator]);
    return schema;
};
