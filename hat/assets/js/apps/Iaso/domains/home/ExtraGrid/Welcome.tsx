import { Box, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import React, {
    FunctionComponent,
    useContext,
    useEffect,
    useState,
} from 'react';
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
    fullHeight: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
    },
    border: { border: '2px dashed #33FF00' },
    innerBody: {
        height: 'calc(100vh - 25px)',
        width: 'calc(100vw - 25px)',
        margin: 'auto',
    },
    title: {
        height: '30vh',
        width: '50vw',
        border: '3px solid #33FF00',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1,
        fontSize: 60,
    },
    '@keyframes blinker': {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
    startText: {
        fontSize: 40,
        marginTop: '50px',
        animationName: '$blinker',
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
    },
});

export const Welcome: FunctionComponent = () => {
    const { hasInputCode } = useContext(InputContext);
    const [showPage, setShowPage] = useState<boolean>(false);

    useEffect(() => {
        if (hasInputCode) {
            setShowPage(true);
        }
    }, [hasInputCode]);

    const classes = useStyles();
    if (showPage) {
        return (
            <div
                className={classNames(
                    classes.blackBackground,
                    classes.oldSchoolGreen,
                    classes.fullHeight,
                    classes.border,
                )}
            >
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
                    <Box className={classes.startText}>
                        Press any key to start
                    </Box>
                </Box>
            </div>
        );
    }
    return <div>Unauthorized</div>;
};
