/* eslint-disable camelcase */
/* eslint-disable react/require-default-props */
import { Box, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import { FilterButton } from '../../../../../../hat/assets/js/apps/Iaso/components/FilterButton';
import InputComponent from '../../../../../../hat/assets/js/apps/Iaso/components/forms/InputComponent';
import { useFilterState } from '../../../../../../hat/assets/js/apps/Iaso/hooks/useFilterState';
import MESSAGES from '../../constants/messages';
import { BUDGET } from '../../constants/routes';
import { UrlParams } from '../../../../../../hat/assets/js/apps/Iaso/types/table';
import { DropdownOptions } from '../../../../../../hat/assets/js/apps/Iaso/types/utils';
import { useGetCountries } from '../../hooks/useGetCountries';
import { useGetGroups } from '../../../../../../hat/assets/js/apps/Iaso/domains/orgUnits/hooks/requests/useGetGroups';

type Props = {
    params: UrlParams & {
        campaignType: string;
        showOnlyDeleted: boolean;
        roundStartTo: string;
        roundStartFrom: string;
        country__id__in: any;
        orgUnitGroups: any;
        campaign: string;
        // eslint-disable-next-line camelcase
        budget_current_state_key__in: string;
    };
    statesList?: DropdownOptions<string>[];
    buttonSize?: 'medium' | 'small' | 'large' | undefined;
};

const baseUrl = BUDGET;
export const BudgetFilters: FunctionComponent<Props> = ({
    params,
    buttonSize = 'medium',
    statesList = [],
}) => {
    const { filters, handleSearch, handleChange, filtersUpdated } =
        useFilterState({ baseUrl, params });
    const [textSearchError, setTextSearchError] = useState<boolean>(false);
    const theme = useTheme();
    const isXSLayout = useMediaQuery(theme.breakpoints.down('xs'));
    const { data, isFetching: isFetchingCountries } = useGetCountries();
    const { data: groupedOrgUnits, isFetching: isFetchingGroupedOrgUnits } =
        useGetGroups({});
    const countriesList = (data && data.orgUnits) || [];
    return (
        <Box mb={4}>
            <Grid container spacing={isXSLayout ? 0 : 2}>
                <Grid item xs={12} sm={6} md={3}>
                    <InputComponent
                        keyValue="search"
                        onChange={handleChange}
                        value={filters.search}
                        type="search"
                        label={MESSAGES.search}
                        onEnterPressed={handleSearch}
                        onErrorChange={setTextSearchError}
                        blockForbiddenChars
                    />
                    <InputComponent
                        loading={isFetchingGroupedOrgUnits}
                        keyValue="orgUnitGroups"
                        multi
                        clearable
                        onChange={handleChange}
                        value={filters.orgUnitGroups}
                        type="select"
                        options={groupedOrgUnits}
                        label={MESSAGES.group}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputComponent
                        type="select"
                        multi={false}
                        keyValue="budget_current_state_key__in"
                        onChange={handleChange}
                        value={filters.budget_current_state_key__in}
                        options={statesList}
                        label={MESSAGES.status}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InputComponent
                        loading={isFetchingCountries}
                        keyValue="country__id__in"
                        multi
                        clearable
                        onChange={handleChange}
                        value={filters.country__id__in}
                        type="select"
                        options={countriesList.map(c => ({
                            label: c.name,
                            value: c.id,
                        }))}
                        label={MESSAGES.country}
                    />
                </Grid>
                <Grid container item xs={12} md={3} justifyContent="flex-end">
                    <Box mt={2}>
                        <FilterButton
                            disabled={textSearchError || !filtersUpdated}
                            onFilter={handleSearch}
                            size={buttonSize}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
