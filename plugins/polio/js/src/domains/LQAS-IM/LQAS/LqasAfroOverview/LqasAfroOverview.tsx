import React, { FunctionComponent, useCallback, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useSafeIntl } from 'bluesquare-components';
import { useDispatch } from 'react-redux';
import { push } from 'react-router-redux';
import { useParams } from 'react-router';
import TopBar from '../../../../../../../../hat/assets/js/apps/Iaso/components/nav/TopBarComponent';
import { LqasAfroMapFilters } from './Filters/LqasAfroMapFilters';
import { useStyles } from '../../../../styles/theme';
import { Router } from '../../../../../../../../hat/assets/js/apps/Iaso/types/general';
import { AfroMapParams } from './types';
import { useGenUrl } from '../../../../../../../../hat/assets/js/apps/Iaso/routing/routing';
import MESSAGES from '../../../../constants/messages';
import { LqasAfroMapWithSelector } from './Map/LqasAfroMapWithSelector';
import { redirectToReplace } from '../../../../../../../../hat/assets/js/apps/Iaso/routing/actions';
import { LQAS_AFRO_MAP_URL } from '../../../../constants/routes';

type Props = {
    router: Router;
};
export const LqasAfroOverview: FunctionComponent<Props> = () => {
    const classes: Record<string, string> = useStyles();
    const genUrl = useGenUrl();
    const params = useParams();
    const { formatMessage } = useSafeIntl();
    const dispatch = useDispatch();
    const [selectedRounds, setSelectedRounds] = useState(
        params?.rounds?.split(',') ?? ['penultimate', 'latest'],
    );

    const onRoundChange = useCallback(
        (value, side) => {
            const updatedSelection = [...selectedRounds];
            if (side === 'left') {
                updatedSelection[0] = value;
            } else {
                updatedSelection[1] = value;
            }
            setSelectedRounds(updatedSelection);
            const url = genUrl({
                rounds: updatedSelection,
            });
            dispatch(push(url));
        },
        [dispatch, genUrl, selectedRounds],
    );
    const onDisplayedShapeChange = useCallback(
        (value, side) => {
            const tempParams = {
                ...params,
            };
            if (side === 'left') {
                tempParams.displayedShapesLeft = value;
            }
            if (side === 'right') {
                tempParams.displayedShapesRight = value;
            }
            dispatch(
                redirectToReplace(
                    LQAS_AFRO_MAP_URL,
                    tempParams as AfroMapParams,
                ),
            );
        },
        [dispatch, params],
    );

    return (
        <>
            <TopBar
                title={formatMessage(MESSAGES.lqasMap)}
                displayBackButton={false}
            />
            <Box className={classes.containerFullHeightNoTabPadded}>
                <LqasAfroMapFilters params={params as AfroMapParams} />

                <Box mt={2}>
                    <Grid container spacing={2} direction="row">
                        <Grid item xs={6}>
                            <LqasAfroMapWithSelector
                                onRoundChange={onRoundChange}
                                side="left"
                                selectedRound={selectedRounds[0]}
                                params={params as AfroMapParams}
                                onDisplayedShapeChange={onDisplayedShapeChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <LqasAfroMapWithSelector
                                onRoundChange={onRoundChange}
                                side="right"
                                selectedRound={selectedRounds[1]}
                                params={params as AfroMapParams}
                                onDisplayedShapeChange={onDisplayedShapeChange}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    );
};
