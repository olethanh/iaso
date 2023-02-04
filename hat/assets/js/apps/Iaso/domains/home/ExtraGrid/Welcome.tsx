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
});

type Props = {
    location: any;
};

export const Welcome: FunctionComponent<Props> = ({ location }) => {
    const { hasInputCode } = useContext(InputContext);
    const classes = useStyles();
    if (hasInputCode) {
        return (
            <div
                className={classNames(
                    classes.blackBackground,
                    classes.oldSchoolGreen,
                )}
            >
                Welcome to Picross
            </div>
        );
    }
    return <div>Unauthorized</div>;
};
