import { Box, Divider, Grid, makeStyles, Paper } from '@material-ui/core';
import { commonStyles, useSafeIntl } from 'bluesquare-components';
import classnames from 'classnames';
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
// import { useImmer } from 'use-immer';
// import { isEqual } from 'lodash';
import { isEqual } from 'lodash';
import TopBar from '../../../components/nav/TopBarComponent';
import { TableWithDeepLink } from '../../../components/tables/TableWithDeepLink';
import { baseUrls } from '../../../constants/urls';
import { useArrayState } from '../../../hooks/useArrayState';
import { useObjectState } from '../../../hooks/useObjectState';
import { redirectTo } from '../../../routing/actions';
import { useDuplicationDetailsColumns } from './hooks/useDuplicationDetailsColumns';
import {
    useGetDuplicateDetails,
    useGetDuplicates,
} from './hooks/useGetDuplicates';
import MESSAGES from './messages';
import { DuplicateInfos } from './DuplicateInfos';
import { useDuplicateInfos } from './hooks/useDuplicateInfos';
import { DuplicateDetailsTableButtons } from './DuplicateDetailsTableButtons';
import { DuplicateData } from './types';
import { useGoBack } from '../../../routing/useGoBack';
import { Router } from '../../../types/general';

type Props = {
    params: { accountId?: string; entities: string };
    router: Router;
};

const useStyles = makeStyles(theme => {
    return {
        ...commonStyles(theme),
        table: {
            '& .MuiTable-root': {
                borderLeft: `1px solid rgb(224, 224, 224)`,
                borderRight: `1px solid rgb(224, 224, 224)`,
                borderBottom: `1px solid rgb(224, 224, 224)`,
                width: '100%',
            },
        },
        fullWidth: { width: '100%' },
        hidden: { visibility: 'collapse' },
        diff: {
            backgroundColor: '#FFEB99',
            // @ts-ignore
            borderRight: `2px solid ${theme.palette.ligthGray.main}`,
        },
        dropped: {
            // @ts-ignore
            backgroundColor: theme.palette.error.background,
            // @ts-ignore
            borderRight: `2px solid ${theme.palette.ligthGray.main}`,
            color: 'rgba(0,0,0,0.6)',
        },
        selected: {
            // @ts-ignore
            backgroundColor: theme.palette.success.background,
            // @ts-ignore
            borderRight: `2px solid ${theme.palette.ligthGray.main}`,
            fontWeight: 'bold',
        },
    };
});

export const DuplicateDetails: FunctionComponent<Props> = ({
    router,
    params,
}) => {
    const { formatMessage } = useSafeIntl();
    // const [tableState, setTableState] = useArrayState([]);
    const [tableState, setTableState] = useArrayState([]);
    const [unfilteredTableState, setUnfilteredTableState] = useArrayState([]);
    const [query, setQuery] = useObjectState();
    const [onlyShowUnmatched, setOnlyShowUnmatched] = useState<boolean>(false);
    const classes: Record<string, string> = useStyles();
    const goBack = useGoBack(router, baseUrls.entityDuplicates);
    const { data: duplicatesInfos } = useGetDuplicates({
        params: { entities: params.entities },
    }) as { data: DuplicateData[] };

    const disableMerge = Boolean(
        tableState.find(row => row.final.status === 'dropped'),
    );

    // TODO params as array, since comma is modified
    const { data: entities, isFetching } = useGetDuplicateDetails({
        params,
    });
    const dispatch = useDispatch();

    const {
        unmatchedRemaining,
        formName,
        algorithmRuns,
        algorithmsUsed,
        similarityScore,
        isLoading: isLoadingInfos,
        entityIds,
    } = useDuplicateInfos({ tableState, duplicatesInfos, params });

    const getRowProps = useCallback(
        row => {
            if (
                row.original.entity1.status === 'identical' &&
                row.original.entity2.status === 'identical' &&
                row.original.final.status === 'identical' &&
                onlyShowUnmatched
            ) {
                return { className: `${classes.hidden}` };
            }
            return {};
        },
        [classes.hidden, onlyShowUnmatched],
    );

    const getCellProps = useCallback(
        cell => {
            return { className: classes[cell.value.status] };
        },
        [classes],
    );

    const toggleUnmatchedDisplay = useCallback(
        (value: boolean) => {
            setOnlyShowUnmatched(value);
            if (value) {
                const filtered = tableState.filter(
                    item => item.entity1.status !== 'identical',
                );
                setTableState({ index: 'all', value: filtered });
            }
            if (!value) {
                setTableState({ index: 'all', value: unfilteredTableState });
            }
        },
        [setTableState, tableState, unfilteredTableState],
    );

    const updateCellState = useCallback(
        (index, newValues) => {
            setTableState({
                index,
                value: newValues,
            });
            const unfilteredIndex = unfilteredTableState.findIndex(row =>
                isEqual(row.field, newValues.field),
            );

            setUnfilteredTableState({
                index: unfilteredIndex,
                value: newValues,
            });
        },
        [setTableState, setUnfilteredTableState, unfilteredTableState],
    );

    const takeAllValuesFromEntity = useCallback(
        (entity: 'entity1' | 'entity2') => {
            const stateCopy = [...tableState];
            const selected = entity;
            const dropped = entity === 'entity1' ? 'entity2' : 'entity1';
            const newState = stateCopy.map(row => {
                if (row.entity1.status === 'identical') return row;
                return {
                    ...row,
                    [selected]: { ...row[selected], status: 'selected' },
                    final: {
                        ...row.final,
                        status: 'selected',
                        value: row[selected].value,
                    },
                    [dropped]: { ...row[dropped], status: 'dropped' },
                };
            });
            const newQuery = {};
            newState.forEach(row => {
                if (row.entity1.status !== 'identical') {
                    newQuery[row.field.field] = row[selected].id;
                }
            });
            setTableState({ index: 'all', value: newState });
            setQuery(newQuery);
        },
        [setQuery, setTableState, tableState],
    );

    const resetSelection = useCallback(() => {
        const newState = [...tableState].map(row => {
            if (row.entity1.status === 'identical') return row;
            return {
                ...row,
                entity1: { ...row.entity1, status: 'diff' },
                entity2: { ...row.entity2, status: 'diff' },
                final: { ...row.final, status: 'dropped', value: '' },
            };
        });
        setTableState({ index: 'all', value: newState });
        setQuery({});
    }, [setQuery, setTableState, tableState]);

    const columns = useDuplicationDetailsColumns({
        state: tableState,
        setState: updateCellState,
        setQuery,
    });

    useEffect(() => {
        if (tableState.length === 0 && entities) {
            setTableState({ index: 'all', value: entities });
            setUnfilteredTableState({ index: 'all', value: entities });
        }
    }, [entities, setTableState, setUnfilteredTableState, tableState.length]);

    return (
        <>
            <TopBar
                title={formatMessage(MESSAGES.compareDuplicates)}
                displayBackButton
                goBack={() => goBack()}
            />
            <Box
                className={classnames(
                    classes.diffCell,
                    classes.droppedCell,
                    classes.selectedCell,
                    classes.containerFullHeightNoTabPadded,
                )}
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Box pb={4}>
                            <DuplicateInfos
                                unmatchedRemaining={unmatchedRemaining}
                                formName={formName}
                                algorithmRuns={algorithmRuns}
                                algorithmsUsed={algorithmsUsed}
                                similarityScore={similarityScore}
                                isLoading={isLoadingInfos}
                                entityIds={entityIds}
                                query={query}
                                disableMerge={disableMerge}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Paper elevation={2} className={classes.fullWidth}>
                    <DuplicateDetailsTableButtons
                        onlyShowUnmatched={onlyShowUnmatched}
                        setOnlyShowUnmatched={toggleUnmatchedDisplay}
                        fillValues={takeAllValuesFromEntity}
                        resetSelection={resetSelection}
                    />
                    <Divider />
                    <TableWithDeepLink
                        showPagination={false}
                        baseUrl={baseUrls.entityDuplicateDetails}
                        columns={columns}
                        marginTop={false}
                        countOnTop={false}
                        elevation={0}
                        data={tableState}
                        rowProps={getRowProps}
                        cellProps={getCellProps}
                        // defaultSorted={}
                        params={params}
                        extraProps={{
                            loading: isFetching,
                            onlyShowUnmatched,
                            entities,
                            getRowProps,
                        }}
                        onTableParamsChange={p =>
                            dispatch(
                                redirectTo(baseUrls.entityDuplicateDetails, p),
                            )
                        }
                    />
                </Paper>
            </Box>
        </>
    );
};
