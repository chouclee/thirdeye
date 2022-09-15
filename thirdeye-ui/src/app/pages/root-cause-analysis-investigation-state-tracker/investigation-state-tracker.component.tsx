/**
 * Copyright 2022 StarTree Inc
 *
 * Licensed under the StarTree Community License (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.startree.ai/legal/startree-community-license
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT * WARRANTIES OF ANY KIND,
 * either express or implied.
 * See the License for the specific language governing permissions and limitations under
 * the License.
 */
import { Box, Card, CardContent, Link, Typography } from "@material-ui/core";
import { cloneDeep, isEmpty } from "lodash";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../../components/breadcrumbs/breadcrumbs.component";
import { InvestigationOptions } from "../../components/rca/investigation-options/investigation-options.component";
import {
    AppLoadingIndicatorV1,
    HelpLinkIconV1,
    NotificationTypeV1,
    PageHeaderActionsV1,
    PageHeaderTextV1,
    PageHeaderV1,
    PageV1,
    TooltipV1,
    useNotificationProviderV1,
} from "../../platform/components";
import { ActionStatus } from "../../rest/actions.interfaces";
import { useGetAnomaly } from "../../rest/anomalies/anomaly.actions";
import { Investigation, SavedStateKeys } from "../../rest/dto/rca.interfaces";
import { useGetInvestigation } from "../../rest/rca/rca.actions";
import { THIRDEYE_DOC_LINK } from "../../utils/constants/constants.util";
import {
    createNewInvestigation,
    determineInvestigationIDFromSearchParams,
    INVESTIGATION_ID_QUERY_PARAM,
} from "../../utils/investigation/investigation.util";
import {
    getAlertsAlertPath,
    getAnomaliesAllPath,
    getAnomaliesAnomalyViewPath,
} from "../../utils/routes/routes.util";
import { RootCauseAnalysisForAnomalyPageParams } from "../root-cause-analysis-for-anomaly-page/root-cause-analysis-for-anomaly-page.interfaces";

export const InvestigationStateTracker: FunctionComponent = () => {
    const { t } = useTranslation();
    const { notify } = useNotificationProviderV1();
    const [searchParams, setSearchParams] = useSearchParams();
    const [investigationId, setInvestigationId] = useState(
        determineInvestigationIDFromSearchParams(searchParams)
    );
    const [localInvestigation, setLocalInvestigation] =
        useState<Investigation | null>(null);
    const [investigationFromServer, setInvestigationFromServer] =
        useState<Investigation | null>(null);
    const { id: anomalyId } =
        useParams<RootCauseAnalysisForAnomalyPageParams>();
    const { anomaly, getAnomaly } = useGetAnomaly();

    const {
        getInvestigation,
        status: getInvestigationRequestStatus,
        errorMessages: getInvestigationRequestErrors,
    } = useGetInvestigation();

    useEffect(() => {
        getAnomaly(Number(anomalyId));
    }, [anomalyId]);

    /**
     * If investigation's associated anomaly id does not match current anomalyId
     * then remove it from the search params to effectively disassociate it from
     * the UI
     */
    useEffect(() => {
        if (
            investigationFromServer &&
            investigationFromServer.anomaly &&
            investigationFromServer.anomaly.id
        ) {
            if (Number(anomalyId) !== investigationFromServer.anomaly.id) {
                searchParams.delete(INVESTIGATION_ID_QUERY_PARAM);
                setSearchParams(searchParams);
            }
        }
    }, [anomalyId, investigationFromServer]);

    useEffect(() => {
        setInvestigationId(
            determineInvestigationIDFromSearchParams(searchParams)
        );
        if (localInvestigation) {
            localInvestigation.uiMetadata[SavedStateKeys.QUERY_SEARCH_STRING] =
                searchParams.toString();
            handleInvestigationChange(localInvestigation);
        }
    }, [searchParams]);

    /**
     * Inform users there was issues when retrieving the investigation for the
     * associated investigation id
     */
    useEffect(() => {
        if (getInvestigationRequestStatus === ActionStatus.Error) {
            const genericMsg = t("message.error-while-fetching", {
                entity: t("label.saved-investigation"),
            });
            !isEmpty(getInvestigationRequestErrors)
                ? getInvestigationRequestErrors.map((msg) =>
                      notify(NotificationTypeV1.Error, `${genericMsg}: ${msg}`)
                  )
                : notify(NotificationTypeV1.Error, genericMsg);
        }
    }, [getInvestigationRequestStatus, getInvestigationRequestErrors]);

    useEffect(() => {
        if (investigationId) {
            getInvestigation(investigationId).then(
                (fetchedInvestigation: Investigation | undefined) => {
                    if (fetchedInvestigation) {
                        setInvestigationFromServer(fetchedInvestigation);
                        setLocalInvestigation(
                            cloneDeep<Investigation>(fetchedInvestigation)
                        );
                    } else {
                        setLocalInvestigation(
                            createNewInvestigation(Number(anomalyId))
                        );
                    }
                }
            );
        } else {
            setLocalInvestigation(createNewInvestigation(Number(anomalyId)));
            setInvestigationFromServer(null);
        }
    }, [investigationId]);

    // Ensure localInvestigation is always so the children views can access a valid object
    if (
        localInvestigation === null ||
        getInvestigationRequestStatus === ActionStatus.Working
    ) {
        return (
            <PageV1>
                <Card variant="outlined">
                    <CardContent>
                        <Box padding={20}>
                            <AppLoadingIndicatorV1 />
                        </Box>
                    </CardContent>
                </Card>
            </PageV1>
        );
    }

    const handleInvestigationChange = (
        modifiedInvestigation: Investigation
    ): void => {
        setLocalInvestigation(cloneDeep(modifiedInvestigation));
    };

    const handleServerUpdatedInvestigation = (
        updatedInvestigation: Investigation
    ): void => {
        searchParams.set(
            INVESTIGATION_ID_QUERY_PARAM,
            updatedInvestigation.id.toString()
        );
        setSearchParams(searchParams, { replace: true });
        setInvestigationFromServer(updatedInvestigation);
        setLocalInvestigation(cloneDeep(updatedInvestigation));
    };

    const handleRemoveInvestigationAssociation = (): void => {
        searchParams.delete(INVESTIGATION_ID_QUERY_PARAM);
        setSearchParams(searchParams, { replace: true });
        setInvestigationFromServer(null);
        setLocalInvestigation(createNewInvestigation(Number(anomalyId)));
    };

    return (
        <PageV1>
            <PageHeaderV1>
                <Box display="inline">
                    <Breadcrumbs
                        crumbs={[
                            {
                                link: getAnomaliesAllPath(),
                                label: t("label.anomalies"),
                            },
                            {
                                label: anomalyId,
                                link: getAnomaliesAnomalyViewPath(
                                    Number(anomalyId)
                                ),
                            },
                            {
                                label: t("label.investigate"),
                            },
                        ]}
                    />
                    <div>
                        <PageHeaderTextV1>
                            {anomaly && (
                                <>
                                    {t("label.investigate")}:{" "}
                                    <Link
                                        href={getAlertsAlertPath(
                                            anomaly.alert.id
                                        )}
                                    >
                                        {anomaly.alert.name}
                                    </Link>
                                    :{" "}
                                </>
                            )}
                            {!anomaly && <>{t("label.investigate")}: </>}
                            <Link
                                href={getAnomaliesAnomalyViewPath(
                                    Number(anomalyId)
                                )}
                            >
                                {t("label.anomaly")} #{anomalyId}
                            </Link>
                            <TooltipV1
                                placement="top"
                                title={
                                    t(
                                        "label.how-to-perform-root-cause-analysis-doc"
                                    ) as string
                                }
                            >
                                <span>
                                    <HelpLinkIconV1
                                        displayInline
                                        enablePadding
                                        externalLink
                                        href={`${THIRDEYE_DOC_LINK}/how-tos/perform-root-cause-analysis`}
                                    />
                                </span>
                            </TooltipV1>
                        </PageHeaderTextV1>
                    </div>

                    {investigationId && (
                        <div>
                            <Typography variant="subtitle1">
                                Viewing saved investigation (#
                                {investigationId}):{" "}
                                {investigationFromServer &&
                                    investigationFromServer.name}
                            </Typography>
                        </div>
                    )}
                </Box>

                <PageHeaderActionsV1>
                    <InvestigationOptions
                        investigationId={investigationId}
                        localInvestigation={localInvestigation}
                        serverInvestigation={investigationFromServer}
                        onRemoveInvestigationAssociation={
                            handleRemoveInvestigationAssociation
                        }
                        onSuccessfulUpdate={handleServerUpdatedInvestigation}
                    />
                </PageHeaderActionsV1>
            </PageHeaderV1>

            <Outlet
                context={{
                    investigation: localInvestigation,
                    investigationHasChanged: handleInvestigationChange,
                }}
            />
        </PageV1>
    );
};
