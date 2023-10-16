import { Tab, Box } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { FunctionComponent, useCallback, useState } from 'react';
// import { useSafeIntl } from 'bluesquare-components';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';

import { useStyles } from '../../../styles/theme';
// import MESSAGES from '../../../constants/messages';

import { useFormatRound } from '../../Budget/Processes/hooks/useFormatRound';
import { BudgetProcess } from '../../Budget/Processes/types';
import { BudgetForm } from './BudgetForm';

export const budgetFormFields = (processes: BudgetProcess[]): string[] => {
    const processKeys = [
        ...processes
            .map((process, i) => {
                return [
                    `processes[${i}].budget_status_at_WFEDITABLE`,
                    `processes[${i}].rounds_at_WFEDITABLE`,
                    `processes[${i}].ra_completed_at_WFEDITABLE`,
                    `processes[${i}].who_sent_budget_at_WFEDITABLE`,
                    `processes[${i}].unicef_sent_budget_at_WFEDITABLE`,
                    `processes[${i}].gpei_consolidated_budgets_at_WFEDITABLE`,
                    `processes[${i}].submitted_to_rrt_at_WFEDITABLE`,
                    `processes[${i}].feedback_sent_to_gpei_at_WFEDITABLE`,
                    `processes[${i}].re_submitted_to_rrt_at_WFEDITABLE`,
                    `processes[${i}].submitted_to_orpg_operations1_at_WFEDITABLE`,
                    `processes[${i}].feedback_sent_to_rrt1_at_WFEDITABLE`,
                    `processes[${i}].submitted_to_orpg_wider_at_WFEDITABLE`,
                    `processes[${i}].feedback_sent_to_rrt2_at_WFEDITABLE`,
                    `processes[${i}].submitted_to_orpg_operations2_at_WFEDITABLE`,
                    `processes[${i}].re_submitted_to_orpg_operations1_at_WFEDITABLE`,
                    `processes[${i}].re_submitted_to_orpg_operations2_at_WFEDITABLE`,
                    `processes[${i}].submitted_for_approval_at_WFEDITABLE`,
                    `processes[${i}].feedback_sent_to_orpg_operations_unicef_at_WFEDITABLE`,
                    `processes[${i}].feedback_sent_to_orpg_operations_who_at_WFEDITABLE`,
                    `processes[${i}].approved_by_who_at_WFEDITABLE`,
                    `processes[${i}].approved_by_unicef_at_WFEDITABLE`,
                    `processes[${i}].approved_at_WFEDITABLE`,
                    `processes[${i}].approval_confirmed_at_WFEDITABLE`,
                    `processes[${i}].payment_mode`,
                    `processes[${i}].who_disbursed_to_co_at`,
                    `processes[${i}].who_disbursed_to_moh_at`,
                    `processes[${i}].unicef_disbursed_to_co_at`,
                    `processes[${i}].unicef_disbursed_to_moh_at`,
                    `processes[${i}].district_count`,
                    `processes[${i}].no_regret_fund_amount`,
                    ...process.rounds.map((__, y) => {
                        return `rounds[${y}].cost`;
                    }),
                ];
            })
            .flat(),
    ];
    return processKeys;
};

export const BudgetFormContainer: FunctionComponent = () => {
    const classes: Record<string, string> = useStyles();
    // const { formatMessage } = useSafeIntl();
    const {
        values: { processes = [] },
    } = useFormikContext<any>();
    const [currentTab, setCurrentTab] = useState<string | undefined>(
        processes.length > 0 ? `${processes[0].id}` : undefined,
    );

    const handleChangeTab = useCallback((_, newValue) => {
        setCurrentTab(newValue);
    }, []);

    const formatRound = useFormatRound();
    return (
        <Box width="100%">
            {processes.length === 0 && 'NO PROCESSES'}

            {processes.length > 0 && currentTab && (
                <Box mt={-4} width="100%">
                    <TabContext value={currentTab}>
                        <TabList
                            onChange={handleChangeTab}
                            className={classes.subTabs}
                        >
                            {processes.map(process => (
                                <Tab
                                    // className={classes.subTab}
                                    key={process.id}
                                    label={process.rounds
                                        .map(round => formatRound(round.number))
                                        .join(', ')}
                                    value={`${process.id}`}
                                />
                            ))}
                        </TabList>
                        {processes.map((process, index) => (
                            <TabPanel
                                value={`${process.id}`}
                                key={process.id}
                                className={classes.tabPanel}
                            >
                                <Box mt={2}>
                                    <BudgetForm processIndex={index} />
                                </Box>
                            </TabPanel>
                        ))}
                    </TabContext>
                </Box>
            )}
        </Box>
    );
};
