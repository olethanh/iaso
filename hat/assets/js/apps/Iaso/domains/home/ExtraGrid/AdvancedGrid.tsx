/* eslint-disable react/no-array-index-key */
import {
    Box,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@material-ui/core';
import classNames from 'classnames';
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { redirectTo } from '../../../routing/actions';
import { RedirectHome } from './RedirectHome';
import { TogglableCell } from './TogglableCell';
import { useStyles } from './Welcome';

const makeGrid = (size: number): [number, number][] => {
    const grid: [number, number][] = [];
    for (let y = 1; y <= size; y += 1) {
        for (let x = 1; x <= size; x += 1) {
            grid.push([x, y]);
        }
    }
    return grid;
};

const pageControl: [number, number][] = [
    [2, 1],
    [3, 1],
    [1, 2],
    [3, 2],
    [4, 2],
    [1, 3],
    [4, 3],
    [4, 4],
    [5, 4],
    [5, 5],
    [4, 6],
    [5, 6],
    [6, 6],
    [4, 7],
    [5, 7],
    [6, 7],
    [3, 8],
    [4, 8],
    [6, 8],
    [7, 8],
    [9, 8],
    [3, 9],
    [4, 9],
    [7, 9],
    [8, 9],
    [9, 9],
    [1, 10],
    [2, 10],
    [7, 10],
    [8, 10],
];

const pageGrid = makeGrid(10);

const gridAsRows = (grid: [number, number][]) => {
    const lengthAsArray = Array.from(new Set(grid.map(tuple => tuple[0])));
    const result: Record<number, number[][]> = {};
    lengthAsArray.forEach(position => {
        result[position] = grid.filter(cell => cell[1] === position);
    });
    return result;
};

const tableGrid = gridAsRows(pageGrid);

const getHints = (coordinates: number[], control: number[]): number[] => {
    const result: number[] = [];
    let previousMatch = 0;
    coordinates.forEach((position: number) => {
        control.forEach((activePosition: number) => {
            if (position === activePosition) {
                if (activePosition > previousMatch + 1) {
                    result.push(1);
                    previousMatch = activePosition;
                } else if (activePosition === previousMatch + 1) {
                    if (result.length > 0) {
                        result[result.length - 1] += 1;
                    } else {
                        result.push(1);
                    }
                    previousMatch = activePosition;
                }
            }
        });
    });
    if (result.length === 0) {
        result.push(0);
    }
    return result;
};

const makeHints = (
    grid: [number, number][],
    control: [number, number][],
    type: 'x' | 'y',
) => {
    const coordinates =
        type === 'x'
            ? Array.from(new Set(grid.map(tuple => tuple[0])))
            : Array.from(new Set(grid.map(tuple => tuple[1])));
    const gridIndex = type === 'x' ? 0 : 1;
    const controlIndex = type === 'x' ? 1 : 0;

    const result: Record<number, number[]> = {};
    coordinates.forEach((value: number) => {
        result[value] = [];
    });

    const controlCoordinatesByPosition: Record<number, number[]> = {};
    coordinates.forEach((value: number) => {
        controlCoordinatesByPosition[value] = control
            .filter(
                (controlCell: [number, number]) =>
                    controlCell[gridIndex] === value,
            )
            .map(cell => cell[controlIndex]);
    });

    coordinates.forEach((position: number) => {
        const hints = getHints(
            coordinates,
            controlCoordinatesByPosition[position],
        );
        result[position] = hints;
    });
    return result;
};

const YHints = makeHints(pageGrid, pageControl, 'y');
const XHints = makeHints(pageGrid, pageControl, 'x');

const compareCells = (
    cell: [number, number],
    reference: [number, number][],
): boolean => {
    return (
        reference.filter(
            refCell => refCell[0] === cell[0] && refCell[1] === cell[1],
        ).length > 0
    );
};

export const useTableStyles = makeStyles({
    table: {
        width: '500px',
        height: '500px',
        margin: 'auto',
    },
    cellBorder: { border: '1px solid  #33FF00' },
    li: { listStyle: 'none', margin: 'auto' },
    horizontalHint: { marginRight: '16px' },
    gridCell: {
        height: '60px !important',
        width: '60px !important',
        padding: '0px',
    },
    topHintCell: { width: '60px' },
    sideHintCell: { height: '60px' },
    tableWrap: { display: 'flex', justifyContent: 'center' },
});

const useEscToReturn = () => {
    const dispatch = useDispatch();
    // const [keyPressed, setKeyPressed] = useState<boolean>(false);

    useEffect(() => {
        const update = e => {
            // if (!keyPressed && activate) setKeyPressed(true);
            if (e.key === 'Escape') {
                dispatch(redirectTo('/', {}));
            }
        };
        document.addEventListener('keydown', update);
        return () => {
            document.removeEventListener('keydown', update);
        };
    });
};

export const AdvancedGrid: FunctionComponent = () => {
    const classes = useStyles();
    const tableStyle = useTableStyles();
    const [tries, setTries] = useState<number>(3);
    useEscToReturn();

    const onCellClick = useCallback(
        (cell: [number, number], reference: [number, number][]) => {
            const isReference = compareCells(cell, reference);
            if (isReference) {
                setTries(value => (value > 0 ? value - 1 : value));
            }
            return isReference;
        },
        [],
    );

    return (
        <Box
            className={classNames(
                classes.border,
                classes.innerBody,
                tableStyle.tableWrap,
            )}
        >
            <RedirectHome tries={tries} />
            <Table className={tableStyle.table}>
                <TableBody>
                    <TableRow>
                        <TableCell
                            className={classNames(
                                tableStyle.cellBorder,
                                classes.oldSchoolGreen,
                            )}
                        >
                            <div>{`Tries left:${tries}`}</div>
                            <span>Esc: return to Iaso</span>
                        </TableCell>
                        {Object.keys(XHints).map((hintPos, index) => {
                            return (
                                <TableCell
                                    key={`${hintPos}-${index}`}
                                    className={classNames(
                                        classes.oldSchoolGreen,
                                        tableStyle.cellBorder,
                                        tableStyle.topHintCell,
                                    )}
                                >
                                    <ul>
                                        {XHints[hintPos].map((pos, i) => (
                                            <li
                                                key={`${hintPos}-${index}-${pos}-${i}`}
                                                className={tableStyle.li}
                                            >
                                                {pos}
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>
                            );
                        })}
                    </TableRow>
                    {Object.keys(tableGrid).map(position => {
                        return (
                            <TableRow key={`${position}-row`}>
                                <TableCell
                                    className={classNames(
                                        classes.oldSchoolGreen,
                                        tableStyle.cellBorder,
                                        tableStyle.sideHintCell,
                                    )}
                                    key={`${position}-cell`}
                                >
                                    {YHints[position].map((pos, i) => {
                                        return (
                                            <span
                                                key={`${position}--${pos}-${i}`}
                                                className={classNames(
                                                    classes.oldSchoolGreen,
                                                    tableStyle.horizontalHint,
                                                )}
                                            >
                                                {pos}
                                            </span>
                                        );
                                    })}
                                </TableCell>
                                {tableGrid[position].map((cell, index) => {
                                    return (
                                        <TogglableCell
                                            key={`${cell}-${index}`}
                                            onClick={() => {
                                                return onCellClick(
                                                    cell,
                                                    pageControl,
                                                );
                                            }}
                                            tries={tries}
                                        />
                                    );
                                })}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
};
