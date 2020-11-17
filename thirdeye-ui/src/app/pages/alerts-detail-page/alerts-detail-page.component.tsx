import { Card, Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import AlertCard from "../../components/alerts/alert-card.component";
import { CustomBreadcrumbs } from "../../components/breadcrumbs/breadcrumbs.component";
import { PageContainer } from "../../components/containers/page-container.component";
import { RouterLink } from "../../components/router-link/router-link.component";
import { cardStyles } from "../../components/styles/common.styles";
import { getAlert, updateAlert } from "../../rest/alert/alert.rest";
import { Alert } from "../../rest/dto/alert.interfaces";
import { AppRoute } from "../../utils/route/routes.util";

export const AlertsDetailPage = withRouter((props) => {
    const { id } = props.match.params;
    const [alert, setAlert] = useState<Alert>();

    useEffect(() => {
        fetchAlert(parseInt(id));
    }, [id]);

    const fetchAlert = async (id: number): Promise<void> => {
        setAlert(await getAlert(id));
    };

    const cardClasses = cardStyles();

    if (!alert) {
        return <>LOADING</>;
    }

    const breadcrumbs = (
        <CustomBreadcrumbs>
            <RouterLink to={AppRoute.ALERTS_ALL}>Alerts</RouterLink>
            <Typography color="textPrimary">{alert.name}</Typography>
        </CustomBreadcrumbs>
    );

    const handleActiveStateChange = async (
        _event: React.ChangeEvent,
        state: boolean
    ): Promise<void> => {
        await updateAlert({ ...alert, active: state });
        // Temporary fix
        // Found some other way to update alert
        window.location.reload();
    };

    return (
        <PageContainer breadcrumbs={breadcrumbs}>
            <Typography variant="h4">{alert.name}</Typography>
            <AlertCard
                data={alert}
                mode="detail"
                onActiveChange={handleActiveStateChange}
            />
            <Card className={cardClasses.base}>
                <Typography variant="subtitle2">
                    All detection rules anomalies over time (0)
                </Typography>
                <Card className={cardClasses.base}>Chart</Card>
            </Card>
            <Card className={cardClasses.base}>
                <Grid container spacing={0}>
                    <Grid item xs={10}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">
                                    Alert Performance
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">
                                            Annomalies
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">
                                            Response Rate
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">
                                            Precision
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">
                                            Recall
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">0</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">-%</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">-%</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="h4">-%</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={2}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">
                                    Detection Health
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">
                                    30-day Status
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2">Normal</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </PageContainer>
    );
});