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
import { isEmpty, map } from "lodash";
import { BaselineOffsetUnitsKey } from "../../pages/anomalies-view-page/anomalies-view-page.interfaces";
import { AnomalyBreakdown } from "../../rest/dto/rca.interfaces";
import {
    DAY_IN_MILLISECONDS,
    MONTH_IN_MILLISECONDS,
    WEEK_IN_MILLISECONDS,
    YEAR_IN_MILLISECONDS,
} from "../../utils/time/time.util";
import { TreemapData } from "../visualizations/treemap/treemap.interfaces";
import {
    AnomalyBreakdownComparisonData,
    AnomalyBreakdownComparisonDataByDimensionColumn,
    AnomalyFilterOption,
    DimensionDisplayData,
    SummarizeDataFunctionParams,
    SummaryData,
} from "./anomaly-breakdown-comparison-heatmap.interfaces";

export const OFFSET_TO_MILLISECONDS = {
    [BaselineOffsetUnitsKey.DAY]: DAY_IN_MILLISECONDS,
    [BaselineOffsetUnitsKey.WEEK]: WEEK_IN_MILLISECONDS,
    [BaselineOffsetUnitsKey.MONTH]: MONTH_IN_MILLISECONDS,
    [BaselineOffsetUnitsKey.YEAR]: YEAR_IN_MILLISECONDS,
};

export function summarizeDimensionValueData(
    dimensionValueData: SummarizeDataFunctionParams
): [number, SummaryData] {
    const summarized: SummaryData = {};
    if (isEmpty(dimensionValueData)) {
        return [0, summarized];
    }

    const totalCount = Object.keys(dimensionValueData).reduce(
        (total, dimensionValueKey) =>
            total + dimensionValueData[dimensionValueKey],
        0
    );

    Object.keys(dimensionValueData).forEach((dimension: string) => {
        summarized[dimension] = {
            count: dimensionValueData[dimension],
            percentage: dimensionValueData[dimension] / totalCount,
            totalCount,
        };
    });

    return [totalCount, summarized];
}

export function formatTreemapData(
    dimensionData: AnomalyBreakdownComparisonDataByDimensionColumn,
    columnName: string
): TreemapData<AnomalyBreakdownComparisonData & DimensionDisplayData>[] {
    const parentId = `${dimensionData.column}-parent`;

    return [
        { id: parentId, size: 0, parent: null },
        ...map(dimensionData.dimensionComparisonData, (comparisonData, k) => {
            const comparisonAndDisplayData = { ...comparisonData, columnName };

            return {
                id: k,
                // when current is 0, treemap won't render anything
                // fix: https://cortexdata.atlassian.net/browse/TE-453
                size: comparisonData.current || 1,
                parent: parentId,
                extraData: comparisonAndDisplayData,
            };
        }),
    ];
}

export function formatDimensionOptions(
    anomalyMetricBreakdown: AnomalyBreakdown
): AnomalyFilterOption[] {
    let options: AnomalyFilterOption[] = [];
    Object.keys(anomalyMetricBreakdown.current.breakdown).forEach(
        (dimensionColumnName) => {
            const optionsForColumn = Object.keys(
                anomalyMetricBreakdown.current.breakdown[dimensionColumnName]
            ).map((value) => ({
                key: dimensionColumnName,
                value,
            }));
            options = [...options, ...optionsForColumn];
        }
    );

    return options;
}

export function formatComparisonData(
    anomalyMetricBreakdown: AnomalyBreakdown
): AnomalyBreakdownComparisonDataByDimensionColumn[] {
    const breakdownComparisonDataByDimensionColumn: AnomalyBreakdownComparisonDataByDimensionColumn[] =
        [];

    Object.keys(anomalyMetricBreakdown.current.breakdown).forEach(
        (dimensionColumnName) => {
            const [currentTotal, currentDimensionValuesData] =
                summarizeDimensionValueData(
                    anomalyMetricBreakdown.current.breakdown[
                        dimensionColumnName
                    ]
                );
            const [baselineTotal, baselineDimensionValuesData] =
                summarizeDimensionValueData(
                    anomalyMetricBreakdown.baseline.breakdown[
                        dimensionColumnName
                    ]
                );
            const dimensionComparisonData: {
                [key: string]: AnomalyBreakdownComparisonData;
            } = {};

            Object.keys(currentDimensionValuesData).forEach(
                (dimension: string) => {
                    const currentDataForDimension =
                        currentDimensionValuesData[dimension];
                    const baselineDataForDimension =
                        baselineDimensionValuesData[dimension] || {};
                    const baselineMetricValue =
                        baselineDataForDimension.count || 0;

                    dimensionComparisonData[dimension] = {
                        current: currentDataForDimension.count,
                        baseline: baselineMetricValue,
                        metricValueDiff:
                            currentDataForDimension.count - baselineMetricValue,
                        metricValueDiffPercentage: null,
                        currentContributionPercentage:
                            currentDataForDimension.percentage || 0,
                        baselineContributionPercentage:
                            baselineDataForDimension.percentage || 0,
                        contributionDiff:
                            (currentDataForDimension.percentage || 0) -
                            (baselineDataForDimension.percentage || 0),
                        currentTotalCount: currentTotal,
                        baselineTotalCount: baselineTotal,
                    };

                    if (baselineMetricValue > 0) {
                        dimensionComparisonData[
                            dimension
                        ].metricValueDiffPercentage =
                            ((currentDataForDimension.count -
                                baselineMetricValue) /
                                baselineMetricValue) *
                            100;
                    }
                }
            );

            breakdownComparisonDataByDimensionColumn.push({
                column: dimensionColumnName,
                dimensionComparisonData,
            });
        }
    );

    return breakdownComparisonDataByDimensionColumn;
}
