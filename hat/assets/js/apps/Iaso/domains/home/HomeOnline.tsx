import React, { FunctionComponent, useCallback, useContext } from 'react';
import { Link } from 'react-router';
import {
    Box,
    makeStyles,
    Container,
    Typography,
    IconButton,
    Grid,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { useDispatch } from 'react-redux';
import iasoBg from '../../images/iaso-bg.jpg';
import { LogoSvg } from '../app/components/LogoSvg';
import { ThemeConfigContext } from '../app/contexts/ThemeConfigContext';
import { LangSwitch } from './components/LangSwitch';
import { toggleSidebarMenu } from '../../redux/sidebarMenuReducer';
import SidebarMenuComponent from '../app/components/SidebarMenuComponent';
import { useHomeButtons } from './hooks/useHomeButtons';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundImage: `url("${iasoBg}")`,
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'center',
        backgroundSize: '100%',
        display: 'flex',
        alignItems: 'center',
    },
    logo: {
        textAlign: 'center',
        '& svg': { filter: 'drop-shadow(0px 0px 24px rgba(0, 0, 0, 0.24))' },
        '& img': { filter: 'drop-shadow(0px 0px 24px rgba(0, 0, 0, 0.24))' },
    },
    title: {
        fontFamily: '"DINAlternate-Bold", "DIN Alternate", sans-serif',
        fontSize: 50,
        textAlign: 'center',
    },
    text: {
        fontFamily: '"DINAlternate-Bold", "DIN Alternate", sans-serif',
        fontSize: 25,
        textAlign: 'center',
        textTransform: 'uppercase',
        // @ts-ignore
        color: theme.palette.gray.main,
        width: '50vw',
    },
    login: {
        textAlign: 'center',
        marginTop: theme.spacing(2),
    },
    topMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    logoButton: {
        display: 'flex',
        color: theme.palette.primary.main,
        width: '33%',
        textDecoration: 'none !important',
        '& div': {
            width: '100%',
            margin: theme.spacing(1),
            padding: theme.spacing(2),
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: theme.spacing(2),
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            alignItems: 'center',
            transition: 'transform .2s ease, background-color .2s ease',
            filter: 'drop-shadow(2px 5px 5px rgba(0, 0, 0, 0.24));',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
                transform: 'scale(1.07, 1.07)',
                backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            '& svg': {
                fontSize: 60,
            },
            '& span': {
                fontSize: 15,
                textTransform: 'uppercase',
                display: 'flex',
                marginTop: theme.spacing(1),
                width: '100%',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                height: 30,
            },
        },
    },
}));
export const HomeOnline: FunctionComponent = () => {
    const classes = useStyles();
    const { LOGO_PATH, APP_TITLE } = useContext(ThemeConfigContext);
    // @ts-ignore
    const staticUrl = window.STATIC_URL ?? '/static/';
    const dispatch = useDispatch();
    const toggleSidebar = useCallback(
        () => dispatch(toggleSidebarMenu()),
        [dispatch],
    );
    const homeButtons = useHomeButtons();
    return (
        <Box className={classes.root}>
            <Grid className={classes.topMenu} container spacing={2}>
                <Grid container item xs={6} justifyContent="flex-start">
                    <Box m={2}>
                        <IconButton
                            color="inherit"
                            aria-label="Menu"
                            onClick={toggleSidebar}
                            id="menu-button"
                        >
                            <MenuIcon />
                        </IconButton>
                        <SidebarMenuComponent location={window.location} />
                    </Box>
                </Grid>
                <Grid container item xs={6} justifyContent="flex-end">
                    <Box p={4} display="flex">
                        <LangSwitch />
                    </Box>
                </Grid>
            </Grid>
            <Container maxWidth="md">
                <Box
                    justifyContent="center"
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                >
                    <Box>
                        <Box className={classes.logo}>
                            {APP_TITLE !== 'Iaso' && LOGO_PATH && (
                                <img
                                    alt="logo"
                                    src={`${staticUrl}${LOGO_PATH}`}
                                    style={{ width: 150, height: 'auto' }}
                                />
                            )}
                            {APP_TITLE === 'Iaso' && (
                                <LogoSvg width={150} height={160} />
                            )}
                        </Box>
                        <Typography className={classes.title}>
                            {APP_TITLE}
                        </Typography>
                    </Box>
                </Box>

                <Container maxWidth="sm">
                    <Box
                        mt={2}
                        display="flex"
                        justifyContent="center"
                        flexWrap="wrap"
                    >
                        {homeButtons.map(button => (
                            <Link
                                className={classes.logoButton}
                                key={button.label}
                                to={button.url}
                            >
                                <div>
                                    {button.Icon}
                                    <span>{button.label}</span>
                                </div>
                            </Link>
                        ))}
                    </Box>
                </Container>
            </Container>
        </Box>
    );
};