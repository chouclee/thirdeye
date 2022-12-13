/*
 * Copyright 2022 StarTree Inc
 *
 * Licensed under the StarTree Community License (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.startree.ai/legal/startree-community-license
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT * WARRANTIES OF ANY KIND,
 * either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under
 * the License.
 */
import { Box, Button, Grid, Typography } from "@material-ui/core";
import { default as React, FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AlgorithmSelection } from "../../../../components/alert-wizard-v3/algorithm-selection/algorithm-selection.component";
import { AvailableAlgorithmOption } from "../../../../components/alert-wizard-v3/algorithm-selection/algorithm-selection.interfaces";
import { filterOptionWithTemplateNames } from "../../../../components/alert-wizard-v3/algorithm-selection/algorithm-selection.utils";
import { SampleAlertSelection } from "../../../../components/alert-wizard-v3/sample-alert-selection/sample-alert-selection.component";
import { SampleAlertOption } from "../../../../components/alert-wizard-v3/sample-alert-selection/sample-alert-selection.interfaces";
import { useAppBarConfigProvider } from "../../../../components/app-bar/app-bar-config-provider/app-bar-config-provider.component";
import { NoDataIndicator } from "../../../../components/no-data-indicator/no-data-indicator.component";
import { EmptyStateSwitch } from "../../../../components/page-states/empty-state-switch/empty-state-switch.component";
import {
    PageContentsCardV1,
    PageContentsGridV1,
} from "../../../../platform/components";
import { createDefaultAlertTemplates } from "../../../../rest/alert-templates/alert-templates.rest";
import { createAlert } from "../../../../rest/alerts/alerts.rest";
import { AlertTemplate } from "../../../../rest/dto/alert-template.interfaces";
import { EditableAlert } from "../../../../rest/dto/alert.interfaces";
import { QUERY_PARAM_KEYS } from "../../../../utils/constants/constants.util";
import {
    AppRouteRelative,
    getHomePath,
} from "../../../../utils/routes/routes.util";

export const SelectTypePage: FunctionComponent = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setShowAppNavBar } = useAppBarConfigProvider();

    const {
        handleAlertPropertyChange,
        simpleOptions,
        advancedOptions,
        getAlertTemplates,
        alertTemplates,
    } = useOutletContext<{
        alert: EditableAlert;
        handleAlertPropertyChange: (contents: Partial<EditableAlert>) => void;
        simpleOptions: AvailableAlgorithmOption[];
        advancedOptions: AvailableAlgorithmOption[];
        getAlertTemplates: () => void;
        alertTemplates: AlertTemplate[];
    }>();

    const handleAlgorithmSelection = (
        isDimensionExploration: boolean
    ): void => {
        if (isDimensionExploration) {
            navigate(
                `../${AppRouteRelative.WELCOME_CREATE_ALERT_SETUP_DIMENSION_EXPLORATION}`
            );

            return;
        }

        navigate(
            `../${AppRouteRelative.WELCOME_CREATE_ALERT_SETUP_MONITORING}`
        );
    };

    const handleCreateDefaultAlertTemplates = (): void => {
        createDefaultAlertTemplates().then(() => {
            getAlertTemplates();
        });
    };

    const handleSampleAlertSelect = (option: SampleAlertOption): void => {
        createAlert(option.alertConfiguration).then(() => {
            const queryParams = new URLSearchParams([
                [QUERY_PARAM_KEYS.SHOW_FIRST_ALERT_SUCCESS, "true"],
            ]);
            navigate(`${getHomePath()}?${queryParams.toString()}`);
            setShowAppNavBar(true);
        });
    };

    return (
        <PageContentsGridV1>
            <Grid item xs={12}>
                <Typography variant="h5">
                    {t("message.select-alert-type")}
                </Typography>
                <Typography variant="body1">
                    {t(
                        "message.this-is-the-detector-algorithm-that-will-rule-alert"
                    )}
                </Typography>
            </Grid>
            <SampleAlertSelection
                alertTemplates={alertTemplates}
                onSampleAlertSelect={handleSampleAlertSelect}
            />
            <Grid item xs={12}>
                <EmptyStateSwitch
                    emptyState={
                        <PageContentsCardV1>
                            <Box padding={10}>
                                <NoDataIndicator>
                                    <Box textAlign="center">
                                        {t(
                                            "message.in-order-to-continue-you-will-need-to-load"
                                        )}
                                    </Box>
                                    <Box marginTop={2} textAlign="center">
                                        <Button
                                            color="primary"
                                            onClick={
                                                handleCreateDefaultAlertTemplates
                                            }
                                        >
                                            {t("label.load-defaults")}
                                        </Button>
                                    </Box>
                                </NoDataIndicator>
                            </Box>
                        </PageContentsCardV1>
                    }
                    isEmpty={
                        filterOptionWithTemplateNames(advancedOptions)
                            .length === 0 &&
                        filterOptionWithTemplateNames(simpleOptions).length ===
                            0
                    }
                >
                    <AlgorithmSelection
                        advancedOptions={advancedOptions}
                        simpleOptions={simpleOptions}
                        onAlertPropertyChange={handleAlertPropertyChange}
                        onSelectionComplete={handleAlgorithmSelection}
                    />
                </EmptyStateSwitch>
            </Grid>
        </PageContentsGridV1>
    );
};
