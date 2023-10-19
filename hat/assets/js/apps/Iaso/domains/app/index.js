import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Router, Link, Route } from 'react-router';
import { SnackbarProvider } from 'notistack';
import { LinkProvider } from 'bluesquare-components';
import SnackBarContainer from '../../components/snackBars/SnackBarContainer';
import LocalizedApp from './components/LocalizedAppComponent';

import { getRoutes } from '../../routing/redirections.tsx';
import { useHasNoAccount } from '../../utils/usersUtils.ts';

import {
    routeConfigs,
    getPath,
    setupAccountPath,
    page404,
} from '../../constants/routes';

import ProtectedRoute from '../users/components/ProtectedRoute';
import { useGetAndStoreCurrentUser } from '../users/hooks/useGetAndStoreCurrentUser.ts';

const getBaseRoutes = (plugins, hasNoAccount) => {
    const routesWithAccount = [
        ...routeConfigs,
        ...plugins
            .map(plugin =>
                plugin.routes.map(route => {
                    if (route.allowAnonymous) return route;
                    return {
                        ...route,
                        params: [
                            {
                                isRequired: false,
                                key: 'accountId',
                            },
                            ...route.params,
                        ],
                    };
                }),
            )
            .flat(),
    ];
    const allRoutesConfigs = hasNoAccount
        ? [setupAccountPath, page404]
        : routesWithAccount;
    return {
        baseRoutes: allRoutesConfigs.map(routeConfig => {
            const { allowAnonymous, component } = routeConfig;
            const renderProtectedComponent = props => (
                <ProtectedRoute
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    routeConfig={routeConfig}
                    component={routeConfig.component(props)}
                    allRoutes={allRoutesConfigs}
                    hasNoAccount={hasNoAccount}
                />
            );
            const page =
                allowAnonymous || hasNoAccount
                    ? component
                    : renderProtectedComponent;
            return <Route path={getPath(routeConfig)} component={page} />;
        }),
        currentRoute: allRoutesConfigs.find(route =>
            window.location.pathname.includes(`/${route.baseUrl}/`),
        ),
    };
};

export default function App({ history, userHomePage, plugins }) {
    const hasNoAccount = useHasNoAccount();
    const { baseRoutes, currentRoute } = useMemo(
        () => getBaseRoutes(plugins, hasNoAccount),
        [plugins, hasNoAccount],
    );

    const overrideLanding = useMemo(() => {
        const overrideLandingRoutes = plugins
            .filter(plugin => plugin.overrideLanding)
            .map(plugin => plugin.overrideLanding);
        // using the last plugin override (arbitrary choice)
        return overrideLandingRoutes.length > 0
            ? overrideLandingRoutes[overrideLandingRoutes.length - 1]
            : undefined;
    }, [plugins]);
    const { data: currentUser } = useGetAndStoreCurrentUser(
        !currentRoute?.allowAnonymous,
    );
    // routes should only change id currentUser has changed
    const routes = useMemo(() => {
        if (!currentUser && !currentRoute?.allowAnonymous) {
            return [];
        }
        return getRoutes(
            baseRoutes,
            userHomePage || overrideLanding,
            hasNoAccount,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, hasNoAccount]);

    if ((!currentUser || routes.length === 0) && !currentRoute?.allowAnonymous)
        return null;
    return (
        <LocalizedApp>
            <LinkProvider linkComponent={Link}>
                <SnackbarProvider
                    maxSnack={3}
                    autoHideDuration={4000}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                >
                    <SnackBarContainer />
                    <Router routes={routes} history={history} />
                </SnackbarProvider>
            </LinkProvider>
        </LocalizedApp>
    );
}
App.defaultProps = {
    userHomePage: undefined,
};

App.propTypes = {
    plugins: PropTypes.array.isRequired,
    history: PropTypes.object.isRequired,
    userHomePage: PropTypes.string,
};
