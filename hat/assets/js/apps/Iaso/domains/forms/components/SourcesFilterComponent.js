import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import PropTypes from 'prop-types';
import { Box, Chip } from '@material-ui/core';

import { Select, useSafeIntl } from 'bluesquare-components';
import { setSourcesSelected } from '../../orgUnits/actions';

import { fetchAssociatedOrgUnits } from '../../../utils/requests';

import { getSourcesWithoutCurrentSource } from '../../orgUnits/utils';

import MESSAGES from '../messages';

const SourcesFilterComponent = ({ fitToBounds }) => {
    const { formatMessage } = useSafeIntl();
    const dispatch = useDispatch();
    const sourcesSelected = useSelector(
        state => state.orgUnits.currentSourcesSelected,
    );
    const currentSources = useSelector(state => state.orgUnits.sources);
    const currentOrgUnit = useSelector(state => state.orgUnits.current);
    if (!currentOrgUnit) return null;
    const sources = getSourcesWithoutCurrentSource(
        currentSources,
        currentOrgUnit.source_id,
    );
    const handleChange = async newSources => {
        if (!newSources) {
            dispatch(setSourcesSelected([]));
        } else {
            const fullSources = [...newSources];
            for (let i = 0; i < newSources.length; i += 1) {
                const ss = newSources[i];
                if (!ss.orgUnits) {
                    // eslint-disable-next-line no-await-in-loop
                    const detail = await fetchAssociatedOrgUnits(
                        dispatch,
                        ss,
                        currentOrgUnit,
                    );
                    fullSources[i] = detail;
                }
            }
            dispatch(setSourcesSelected(fullSources || []));
        }
        fitToBounds();
    };
    return (
        <Box m={4}>
            <Select
                keyValue="sources"
                label={formatMessage(MESSAGES.sources)}
                disabled={sources.length === 0}
                clearable
                multi
                value={sourcesSelected || []}
                getOptionLabel={option => option?.name}
                getOptionSelected={(option, val) => {
                    return val && option.id === val.id;
                }}
                options={sources}
                returnFullObject
                onChange={handleChange}
                renderTags={(tagValue, getTagProps) =>
                    tagValue
                        .filter(option => option)
                        .map((option, index) => (
                            <Chip
                                style={{
                                    backgroundColor: option.color,
                                    color: 'white',
                                }}
                                label={option.name}
                                {...getTagProps({ index })}
                            />
                        ))
                }
            />
        </Box>
    );
};
SourcesFilterComponent.propTypes = {
    fitToBounds: PropTypes.func.isRequired,
};

export default SourcesFilterComponent;
