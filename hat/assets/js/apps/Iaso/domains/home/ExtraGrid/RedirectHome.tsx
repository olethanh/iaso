import { Box, makeStyles } from '@material-ui/core';
import classnames from 'classnames';
import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { redirectTo } from '../../../routing/actions';
import { useStyles } from './Welcome';

type Props = {
    tries: number;
};

const useOverlayStyle = makeStyles({
    color: { color: '#33FF00' },
    overlay: {
        position: 'fixed' /* Sit on top of the page content */,
        display: 'none' /* Hidden by default */,
        width: '100%' /* Full width (cover the whole page) */,
        height: '100' /* Full height (cover the whole page) */,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)' /* Black background with opacity */,
        zIndex: 2,
    },
    showOverlay: {
        display: 'grid',
        justifyContent: 'center',
    },
});

export const RedirectHome: FunctionComponent<Props> = ({ tries }) => {
    const overlayStyle = useOverlayStyle();
    const classes = useStyles();
    const dispatch = useDispatch();

    const redirect = useCallback(() => {
        dispatch(redirectTo('/', {}));
    }, [dispatch]);
    return (
        <div
            className={classnames(
                overlayStyle.color,
                overlayStyle.overlay,
                tries === 0 && overlayStyle.showOverlay,
            )}
        >
            <Box
                className={classes.title}
                style={{ marginTop: '30vh', maxWidth: '600px' }}
            >
                <span style={{ textAlign: 'center', flex: '1' }}>You lose</span>
            </Box>
            {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
            <div
                style={{
                    color: 'black',
                    backgroundColor: '#33FF00',
                    height: '50px',
                    width: '120px',
                    justifySelf: 'center',
                    display: 'flex',
                    alignItems: 'center',
                }}
                role="button"
                onClick={redirect}
            >
                <span
                    style={{
                        margin: 'auto',
                        fontSize: 16,
                        fontWeight: 'bold',
                        cursor: 'default',
                    }}
                >
                    Back to Iaso
                </span>
            </div>
        </div>
    );
};
