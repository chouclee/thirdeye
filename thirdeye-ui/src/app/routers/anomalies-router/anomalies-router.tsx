import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import { useAppBreadcrumbs } from "../../components/app-breadcrumbs/app-breadcrumbs.component";
import { LoadingIndicator } from "../../components/loading-indicator/loading-indicator.component";
import { PageContainer } from "../../components/page-container/page-container.component";
import { AnomaliesAllPage } from "../../pages/anomalies-all-page/anomalies-all-page.component";
import { AnomaliesDetailPage } from "../../pages/anomalies-detail-page/anomalies-detail-page.component";
import { PageNotFoundPage } from "../../pages/page-not-found-page/page-not-found-page.component";
import { useAppToolbarStore } from "../../store/app-toolbar-store/app-toolbar-store";
import {
    AppRoute,
    getAnomaliesAllPath,
    getAnomaliesPath,
} from "../../utils/routes-util/routes-util";

export const AnomaliesRouter: FunctionComponent = () => {
    const [loading, setLoading] = useState(true);
    const { setRouterBreadcrumbs } = useAppBreadcrumbs();
    const [removeAppToolbar] = useAppToolbarStore((state) => [
        state.removeAppToolbar,
    ]);
    const history = useHistory();
    const { t } = useTranslation();

    useEffect(() => {
        // Create router breadcrumbs
        setRouterBreadcrumbs([
            {
                text: t("label.anomalies"),
                onClick: (): void => {
                    history.push(getAnomaliesPath());
                },
            },
        ]);

        // No app toolbar under this router
        removeAppToolbar();

        setLoading(false);
    }, []);

    if (loading) {
        return (
            <PageContainer>
                <LoadingIndicator />
            </PageContainer>
        );
    }

    return (
        <Switch>
            {/* Anomalies path */}
            <Route exact path={AppRoute.ANOMALIES}>
                {/* Redirect to anomalies all path */}
                <Redirect to={getAnomaliesAllPath()} />
            </Route>

            {/* Anomalies all path */}
            <Route
                exact
                component={AnomaliesAllPage}
                path={AppRoute.ANOMALIES_ALL}
            />

            {/* Anomalies detail path */}
            <Route
                exact
                component={AnomaliesDetailPage}
                path={AppRoute.ANOMALIES_DETAIL}
            />

            {/* No match found, render page not found */}
            <Route component={PageNotFoundPage} />
        </Switch>
    );
};
