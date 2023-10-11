/* eslint-disable camelcase */
import { Tab, Box } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useSafeIntl } from 'bluesquare-components';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';

import { useStyles } from '../../../styles/theme';
import MESSAGES from '../../../constants/messages';

import { PreparednessConfig } from '../Preparedness/PreparednessConfig';

export const BudgetFormContainer: FunctionComponent = () => {
    const classes: Record<string, string> = useStyles();
    const { formatMessage } = useSafeIntl();
    const { values } = useFormikContext<any>();
    const { rounds = [] } = values;
    const sortedRounds = useMemo(
        () => [...rounds].sort((a, b) => a.number - b.number),
        [],
    );

    const defaultRoundNumber = Number.isInteger(sortedRounds[0]?.number)
        ? `${sortedRounds[0]?.number}`
        : '1';

    const [currentTab, setCurrentTab] = useState(defaultRoundNumber);

    const handleChangeTab = useCallback((_, newValue) => {
        setCurrentTab(newValue);
    }, []);

    return (
        <Box mt={-4}>
            <TabContext value={currentTab}>
                <TabList onChange={handleChangeTab} className={classes.subTabs}>
                    {sortedRounds.map(round => (
                        <Tab
                            className={classes.subTab}
                            key={round.number}
                            label={`${formatMessage(MESSAGES.round)} ${
                                round.number
                            }`}
                            value={`${round.number}`}
                        />
                    ))}
                </TabList>
                {sortedRounds.map(round => (
                    <TabPanel
                        value={`${round.number}`}
                        key={round.number}
                        className={classes.tabPanel}
                    >
                        <PreparednessConfig
                            roundNumber={round.number}
                            campaignName={values.obr_name}
                        />
                    </TabPanel>
                ))}
            </TabContext>
        </Box>
    );
};
