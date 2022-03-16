/*
 * Copyright (c) 2022 StarTree Inc. All rights reserved.
 * Confidential and Proprietary Information of StarTree Inc.
 */

package ai.startree.thirdeye.detection.alert.filter;

import static ai.startree.thirdeye.spi.Constants.NO_AUTH_USER;

import ai.startree.thirdeye.datalayer.bao.TestDbEnv;
import ai.startree.thirdeye.detection.DetectionTestUtils;
import ai.startree.thirdeye.detection.alert.DetectionAlertFilterNotification;
import ai.startree.thirdeye.spi.datalayer.dto.AnomalyFeedbackDTO;
import ai.startree.thirdeye.spi.datalayer.dto.EmailSchemeDto;
import ai.startree.thirdeye.spi.datalayer.dto.MergedAnomalyResultDTO;
import ai.startree.thirdeye.spi.datalayer.dto.NotificationSchemesDto;
import ai.startree.thirdeye.spi.datalayer.dto.SubscriptionGroupDTO;
import ai.startree.thirdeye.spi.detection.AnomalySeverity;
import ai.startree.thirdeye.spi.detection.AnomalyType;
import ai.startree.thirdeye.spi.detection.dimension.DimensionMap;
import ai.startree.thirdeye.spi.rootcause.impl.MetricEntity;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class AlertFilterUtils {

  public static final List<String> PROP_TO_VALUE = Arrays.asList("test@example.com", "test@example.org");
  public static final List<String> PROP_CC_VALUE = Arrays.asList("cctest@example.com", "cctest@example.org");
  public static final List<String> PROP_BCC_VALUE = Arrays.asList("bcctest@example.com", "bcctest@example.org");

  static DetectionAlertFilterNotification makeEmailNotifications(SubscriptionGroupDTO config) {
    return makeEmailNotifications(config, new ArrayList<>());
  }

  static DetectionAlertFilterNotification makeEmailNotifications(SubscriptionGroupDTO config,
      List<String> toRecipients) {
    List<String> recipients = new ArrayList<>();
    recipients.addAll(PROP_TO_VALUE);
    recipients.addAll(toRecipients);
    return makeEmailNotifications(config, recipients, PROP_CC_VALUE, PROP_BCC_VALUE);
  }

  static DetectionAlertFilterNotification makeEmailNotifications(SubscriptionGroupDTO config,
      List<String> toRecipients, List<String> ccRecipients, List<String> bccRecipients) {
    NotificationSchemesDto notificationSchemes = new NotificationSchemesDto();
    notificationSchemes.setEmailScheme(new EmailSchemeDto()
      .setTo(toRecipients)
      .setCc(ccRecipients)
      .setBcc(bccRecipients));
    SubscriptionGroupDTO subsConfig = SubscriptionUtils
        .makeChildSubscriptionConfig(config, notificationSchemes, config.getRefLinks());

    return new DetectionAlertFilterNotification(subsConfig);
  }

  static MergedAnomalyResultDTO makeAnomaly(Long configId, long baseTime, long start, long end,
      Map<String, String> dimensions, AnomalyFeedbackDTO feedback) {
    return makeAnomaly(configId, baseTime, start, end, dimensions, feedback,
        AnomalySeverity.DEFAULT);
  }

  static MergedAnomalyResultDTO makeAnomaly(Long configId, long baseTime, long start, long end,
      Map<String, String> dimensions, AnomalyFeedbackDTO feedback, AnomalySeverity severity) {
    MergedAnomalyResultDTO anomaly = DetectionTestUtils
        .makeAnomaly(configId, baseTime + start, baseTime + end);
    anomaly.setType(AnomalyType.DEVIATION);
    anomaly.setChildIds(Collections.emptySet());

    Multimap<String, String> filters = HashMultimap.create();
    for (Map.Entry<String, String> dimension : dimensions.entrySet()) {
      filters.put(dimension.getKey(), dimension.getValue());
    }
    anomaly.setMetricUrn(MetricEntity.fromMetric(1.0, 1l, filters).getUrn());

    DimensionMap dimMap = new DimensionMap();
    dimMap.putAll(dimensions);
    anomaly.setDimensions(dimMap);

    anomaly.setCreatedBy(NO_AUTH_USER);
    anomaly.setUpdatedBy(NO_AUTH_USER);
    anomaly.setSeverityLabel(severity);
    anomaly.setId(TestDbEnv.getInstance().getMergedAnomalyResultDAO().save(anomaly));

    if (feedback != null) {
      anomaly.setFeedback(feedback);
      anomaly.setDimensions(null);
      TestDbEnv.getInstance().getMergedAnomalyResultDAO().updateAnomalyFeedback(anomaly);
    }

    return anomaly;
  }

  static MergedAnomalyResultDTO makeAnomaly(Long configId, long baseTime, long start, long end) {
    return makeAnomaly(configId, baseTime, start, end, Collections.emptyMap(), null);
  }
}
