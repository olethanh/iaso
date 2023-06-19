import { Slider, Typography } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
import OpacityIcon from '@material-ui/icons/Opacity';
import { useSafeIntl } from 'bluesquare-components';
import MESSAGES from '../messages';

type Props = {
    opacity: number;
    // eslint-disable-next-line no-unused-vars
    setOpacity: (value: number) => void;
};

export const OpacitySlider: FunctionComponent<Props> = ({
    opacity,
    setOpacity,
}) => {
    const { formatMessage } = useSafeIntl();

    // const classes: Record<string, string> = useStyles();
    console.log('FMSG', formatMessage(MESSAGES.shapeOpacity));

    return (
        <>
            <Typography variant="body2">
                {formatMessage(MESSAGES.shapeOpacity)}
            </Typography>
            <Slider
                min={0}
                max={1}
                name="opacitySlider"
                value={opacity}
                onChange={(_, value: number) => setOpacity(value)}
                step={0.1}
            />
        </>
    );
};
