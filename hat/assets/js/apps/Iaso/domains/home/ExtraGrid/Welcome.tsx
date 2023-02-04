import { makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import React, { FunctionComponent, useContext } from 'react';
import { InputContext } from '../../app/contexts/InputContext';

const useStyles = makeStyles({
    blackBackground: {
        backgroundColor: 'black',
    },
    oldSchoolGreen: {
        color: '#33FF00',
    },
    oldSchoolOrange: {
        color: '#FFB000',
    },
    oldSchoolGrey: {
        color: '#282828',
    },
    fullHeight: { height: '100vh' },
});

export const Welcome: FunctionComponent = () => {
    const { hasInputCode } = useContext(InputContext);
    const classes = useStyles();
    if (!hasInputCode) {
        return (
            <div
                className={classNames(
                    classes.blackBackground,
                    classes.oldSchoolGreen,
                    classes.fullHeight,
                )}
            >
                Welcome to Picross
            </div>
        );
    }
    return <div>Unauthorized</div>;
};
