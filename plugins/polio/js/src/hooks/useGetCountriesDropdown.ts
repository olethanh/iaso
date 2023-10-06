import { UseQueryResult } from 'react-query';
import { useSnackQuery } from '../../../../../hat/assets/js/apps/Iaso/libs/apiHooks';
import { getRequest } from '../../../../../hat/assets/js/apps/Iaso/libs/Api';
import { staleTime } from '../../../../../hat/assets/js/apps/Iaso/domains/orgUnits/config';
import { DropdownOptions } from '../../../../../hat/assets/js/apps/Iaso/types/utils';
import { appId } from '../constants/app';

export const useGetCountriesDropdown = (): UseQueryResult<
    DropdownOptions<string>[],
    Error
> => {
    const params = {
        validation_status: 'all',
        order: 'name',
        orgUnitTypeCategory: 'country',
        app_id: appId,
    };

    const queryString = new URLSearchParams(params);
    return useSnackQuery({
        queryKey: ['countriesDropdown', params],
        queryFn: () => getRequest(`/api/orgunits/?${queryString.toString()}`),
        options: {
            staleTime,
            select: data => {
                if (!data) return [];
                return data.orgUnits.map(country => {
                    return {
                        value: country.id,
                        label: country.name,
                        original: country,
                    };
                });
            },
        },
    });
};
