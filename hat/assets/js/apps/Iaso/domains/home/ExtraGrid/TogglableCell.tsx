import { makeStyles, TableCell } from '@material-ui/core';
import classNames from 'classnames';
import React, { FunctionComponent, useState } from 'react';
import { useTableStyles } from './AdvancedGrid';
import { useStyles } from './Welcome';

type Props = {
    onClick: () => boolean;
    tries: number;
};

const useCellStyle = makeStyles({
    fill: {
        backgroundColor: '#33FF00',
    },
});

export const TogglableCell: FunctionComponent<Props> = ({ onClick, tries }) => {
    const classes = useStyles();
    const tableStyle = useTableStyles();
    const cellStyle = useCellStyle();
    const [isToggled, setIsToggled] = useState<boolean>(false);
    return (
        <TableCell
            className={classNames(
                classes.oldSchoolGreen,
                tableStyle.cellBorder,
                tableStyle.gridCell,
                isToggled && cellStyle.fill,
            )}
            onClick={() => {
                if (tries > 0 && !onClick()) {
                    setIsToggled(true);
                }
            }}
        />
    );
};
