/*
 * Copyright (c) 2022 StarTree Inc. All rights reserved.
 * Confidential and Proprietary Information of StarTree Inc.
 */

package ai.startree.thirdeye.detection.anomalydetection.performanceEvaluation;

import ai.startree.thirdeye.spi.datalayer.dto.MergedAnomalyResultDTO;
import ai.startree.thirdeye.spi.detection.dimension.DimensionMap;
import ai.startree.thirdeye.util.IntervalUtils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.joda.time.DateTimeZone;
import org.joda.time.Interval;

/**
 * The recall of the cloned function with regarding to the labeled anomalies in original function.
 * The calculation is based on the time overlapped with the labeled anomalies.
 * recall = (the overlapped time duration between detected anomalies and labelled anomalies) / (the
 * time length of the labelled anomalies)
 */
public class RecallByTimePreformanceEvaluation extends BasePerformanceEvaluate {

  private final Map<DimensionMap, List<Interval>> knownAnomalyIntervals;      // The merged anomaly intervals which are labeled by user
  private final List<MergedAnomalyResultDTO> detectedAnomalies;        // The merged anomalies which are generated by anomaly function
  private final Map<DimensionMap, Long> knownAnomalyTimeLength;

  public RecallByTimePreformanceEvaluation(List<MergedAnomalyResultDTO> knownAnomalies,
      List<MergedAnomalyResultDTO> detectedAnomalies) {
    this.knownAnomalyIntervals = mergedAnomalyResultsToIntervalMap(knownAnomalies);
    this.knownAnomalyTimeLength = new HashMap<DimensionMap, Long>();
    for (Map.Entry<DimensionMap, List<Interval>> entry : this.knownAnomalyIntervals.entrySet()) {
      long timeLength = 0L;
      for (Interval interval : entry.getValue()) {
        timeLength += interval.toDurationMillis();
      }
      this.knownAnomalyTimeLength.put(entry.getKey(), timeLength);
    }
    this.detectedAnomalies = detectedAnomalies;
  }

  @Override
  public double evaluate() {
    if (knownAnomalyIntervals == null || knownAnomalyIntervals.size() == 0) {
      return 0;
    }
    Map<DimensionMap, List<Interval>> anomalyIntervals = mergedAnomalyResultsToIntervalMap(
        detectedAnomalies);
    IntervalUtils.mergeIntervals(anomalyIntervals);
    Map<DimensionMap, Long> dimensionToOverlapTimeLength = new HashMap<>();

    for (MergedAnomalyResultDTO detectedAnomaly : detectedAnomalies) {
      Interval anomalyInterval = new Interval(detectedAnomaly.getStartTime(),
          detectedAnomaly.getEndTime(), DateTimeZone.UTC);
      DimensionMap dimensions = detectedAnomaly.getDimensions();
      for (Interval knownAnomalyInterval : knownAnomalyIntervals.get(dimensions)) {
        if (!dimensionToOverlapTimeLength.containsKey(dimensions)) {
          dimensionToOverlapTimeLength.put(dimensions, 0L);
        }
        Interval overlapInterval = knownAnomalyInterval.overlap(anomalyInterval);
        if (overlapInterval != null) {
          dimensionToOverlapTimeLength.put(dimensions,
              dimensionToOverlapTimeLength.get(dimensions) + overlapInterval.toDurationMillis());
        }
      }
    }

    // take average of all the recalls
    double avgRecall = 0.0;
    long totalKnownAnomalyTimeLength = 0;
    long totalDimensionOverlapTimeLength = 0;
    for (DimensionMap dimensions : dimensionToOverlapTimeLength.keySet()) {
      totalKnownAnomalyTimeLength += knownAnomalyTimeLength.get(dimensions);
      totalDimensionOverlapTimeLength += dimensionToOverlapTimeLength.get(dimensions);
    }
    if (totalKnownAnomalyTimeLength == 0) {
      return Double.NaN;
    }
    return (double) totalDimensionOverlapTimeLength / totalKnownAnomalyTimeLength;
  }
}
