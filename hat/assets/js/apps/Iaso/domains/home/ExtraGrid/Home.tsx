import { Box } from '@material-ui/core';
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { useStyles } from './Welcome';

export const Home: FunctionComponent = () => {
    const classes = useStyles();
    return (
        <Box className={classNames(classes.border, classes.innerBody)}>
            <Box
                style={{
                    display: 'grid',
                    justifyContent: 'center',
                    marginTop: 'calc(25vh - 25px)',
                }}
            >
                <Box className={classes.title}>
                    <span style={{ textAlign: 'center', flex: '1' }}>
                        Welcome to Picross
                    </span>
                </Box>
            </Box>
            <Box className={classes.startText}>Press any key to start</Box>
        </Box>
    );
};
