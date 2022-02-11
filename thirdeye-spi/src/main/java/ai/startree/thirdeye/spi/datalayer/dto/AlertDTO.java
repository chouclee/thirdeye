/*
 * Copyright (c) 2022 StarTree Inc. All rights reserved.
 * Confidential and Proprietary Information of StarTree Inc.
 */

package ai.startree.thirdeye.spi.datalayer.dto;

import ai.startree.thirdeye.spi.detection.BaseComponent;
import ai.startree.thirdeye.spi.detection.health.DetectionHealth;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class AlertDTO extends AbstractDTO {

  String name;
  String description;
  boolean active;
  String cron;
  long lastTimestamp;
  long lastTuningTimestamp;
  boolean isDataAvailabilitySchedule;
  long taskTriggerFallBackTimeInSec;
  List<String> owners;
  Map<String, Object> properties;
  Map<String, Object> componentSpecs;
  DetectionHealth health;

  // The alert template
  AlertTemplateDTO template;

  // Values to be plugged into the above template
  private Map<String, Object> templateProperties;

  @JsonIgnore
  private Map<String, BaseComponent> components = new HashMap<>();

  public List<String> getOwners() {
    return owners;
  }

  public void setOwners(List<String> owners) {
    this.owners = owners;
  }

  public Map<String, Object> getComponentSpecs() {
    return componentSpecs;
  }

  public void setComponentSpecs(Map<String, Object> componentSpecs) {
    this.componentSpecs = componentSpecs;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getCron() {
    return cron;
  }

  public void setCron(String cron) {
    this.cron = cron;
  }

  public Map<String, Object> getProperties() {
    return properties;
  }

  public void setProperties(Map<String, Object> properties) {
    this.properties = properties;
  }

  public long getLastTimestamp() {
    return lastTimestamp;
  }

  public void setLastTimestamp(long lastTimestamp) {
    this.lastTimestamp = lastTimestamp;
  }

  public long getLastTuningTimestamp() {
    return lastTuningTimestamp;
  }

  public void setLastTuningTimestamp(long lastTuningTimestamp) {
    this.lastTuningTimestamp = lastTuningTimestamp;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public boolean isDataAvailabilitySchedule() {
    return isDataAvailabilitySchedule;
  }

  public void setDataAvailabilitySchedule(boolean dataAvailabilitySchedule) {
    isDataAvailabilitySchedule = dataAvailabilitySchedule;
  }

  public long getTaskTriggerFallBackTimeInSec() {
    return taskTriggerFallBackTimeInSec;
  }

  public void setTaskTriggerFallBackTimeInSec(long taskTriggerFallBackTimeInSec) {
    this.taskTriggerFallBackTimeInSec = taskTriggerFallBackTimeInSec;
  }

  public DetectionHealth getHealth() {
    return health;
  }

  public void setHealth(DetectionHealth health) {
    this.health = health;
  }

  public AlertTemplateDTO getTemplate() {
    return template;
  }

  public AlertDTO setTemplate(
      final AlertTemplateDTO template) {
    this.template = template;
    return this;
  }

  public Map<String, Object> getTemplateProperties() {
    return templateProperties;
  }

  public AlertDTO setTemplateProperties(
      final Map<String, Object> templateProperties) {
    this.templateProperties = templateProperties;
    return this;
  }

  public Map<String, BaseComponent> getComponents() {
    return components;
  }

  public void setComponents(Map<String, BaseComponent> components) {
    this.components = components;
  }

  //fixme make sure equals and hashCode implems are correct
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof AlertDTO)) {
      return false;
    }
    AlertDTO that = (AlertDTO) o;
    return lastTimestamp == that.lastTimestamp
        && active == that.active
        && Objects.equals(cron, that.cron)
        && Objects.equals(name, that.name)
        && Objects.equals(properties, that.properties)
        && Objects.equals(isDataAvailabilitySchedule, that.isDataAvailabilitySchedule)
        && Objects.equals(taskTriggerFallBackTimeInSec, that.taskTriggerFallBackTimeInSec)
        ;
  }

  @Override
  public int hashCode() {
    return Objects.hash(cron, name, lastTimestamp, properties, active);
  }
}