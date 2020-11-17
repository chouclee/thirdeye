package org.apache.pinot.thirdeye.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.util.List;
import java.util.Map;
import org.apache.pinot.thirdeye.datalayer.pojo.AlertNodeType;

@JsonInclude(Include.NON_NULL)
public class AlertNodeApi {

  private String name;
  private AlertNodeType type;
  private String subType;
  private MetricApi metric;
  private Map<String, Object> params;
  private List<String> dependsOn;

  public String getName() {
    return name;
  }

  public AlertNodeApi setName(final String name) {
    this.name = name;
    return this;
  }

  public AlertNodeType getType() {
    return type;
  }

  public AlertNodeApi setType(final AlertNodeType type) {
    this.type = type;
    return this;
  }

  public String getSubType() {
    return subType;
  }

  public AlertNodeApi setSubType(final String subType) {
    this.subType = subType;
    return this;
  }

  public MetricApi getMetric() {
    return metric;
  }

  public AlertNodeApi setMetric(final MetricApi metric) {
    this.metric = metric;
    return this;
  }

  public Map<String, Object> getParams() {
    return params;
  }

  public AlertNodeApi setParams(final Map<String, Object> params) {
    this.params = params;
    return this;
  }

  public List<String> getDependsOn() {
    return dependsOn;
  }

  public AlertNodeApi setDependsOn(final List<String> dependsOn) {
    this.dependsOn = dependsOn;
    return this;
  }
}