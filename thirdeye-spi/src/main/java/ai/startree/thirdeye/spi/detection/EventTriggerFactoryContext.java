/*
 * Copyright (c) 2022 StarTree Inc. All rights reserved.
 * Confidential and Proprietary Information of StarTree Inc.
 */

package ai.startree.thirdeye.spi.detection;

import java.util.Map;

public class EventTriggerFactoryContext {

  private Map<String, Object> properties;

  public Map<String, Object> getProperties() {
    return properties;
  }

  public EventTriggerFactoryContext setProperties(
      final Map<String, Object> properties) {
    this.properties = properties;
    return this;
  }
}