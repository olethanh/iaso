import { useLocation, useParams } from 'react-router';
import { makeUrlWithParams } from '../libs/utils';

export const useGenUrl = (): ((
    // eslint-disable-next-line no-unused-vars
    newParams: Record<string, string | number | undefined>,
) => string) => {
    const params = useParams();
    const location = useLocation();
    return newParams => {
        return makeUrlWithParams(location.pathname, {
            ...params,
            ...newParams,
        });
    };
};
