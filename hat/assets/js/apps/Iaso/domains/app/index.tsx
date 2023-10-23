import React, { FunctionComponent } from 'react';
import {
    Link,
    BrowserRouter as Router,
    // useRouteError,
    // Route,
} from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { LinkProvider, LoadingSpinner } from 'bluesquare-components';
import SnackBarContainer from '../../components/snackBars/SnackBarContainer';
import LocalizedApp from './components/LocalizedAppComponent';

import { useRoutes } from './hooks/useRoutes';
// import Forms from '../forms';

type Props = {
    history: Record<string, any>;
    userHomePage?: string;
};

const App: FunctionComponent<Props> = ({ history, userHomePage }) => {
    const { routes, isLoadingRoutes } = useRoutes(userHomePage);
    console.log('routes', routes);
    return (
        <>
            {isLoadingRoutes && <LoadingSpinner />}
            {!isLoadingRoutes && (
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
                            <Router basename="/dashboard">
                                {routes}
                                {/* <Route
                                        path="/forms/list//accountId/:accountId?"
                                        Component={props => (
                                            <Forms {...props} />
                                        )}
                                    /> */}
                            </Router>
                        </SnackbarProvider>
                    </LinkProvider>
                </LocalizedApp>
            )}
        </>
    );
};

export default App;
// https://stackoverflow.com/questions/35604617/react-router-with-optional-path-parameter#:~:text=React%20Router%20v4%20and%20above&text=Instead%2C%20you%20are%20instructed%20to,question%2Dmark%20(%20%3F%20).
// "/forms/list/accountId?/:accountId?/order?/:order?/pageSize?/:pageSize?/page?/:page?/search?/:search?/searchActive?/:searchActive?/showDeleted?/:showDeleted?"

// forms/list/accountId?/:accountId?/order?/:order?/pageSize?/:pageSize?/page?/:page?/search?/:search?/searchActive?/:searchActive?/showDeleted?/:showDeleted?
// forms/list/accountId?/:accountId?/order?/:order?/pageSize?/:pageSize?/page?/:page?/search?/:search?/searchActive?/:searchActive?/showDeleted?/:showDeleted?
// http://localhost:8081/dashboard/forms/list/accountId=1/order=id/pageSize/10/page/1/search/brol/searchActive/true/showDeleted/1/planning/1/orgUnitTypeIds/1/projectsIds/1
