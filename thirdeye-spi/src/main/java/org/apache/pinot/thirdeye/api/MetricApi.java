package org.apache.pinot.thirdeye.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.util.Date;
import java.util.List;
import org.apache.pinot.thirdeye.constant.MetricAggFunction;
import org.apache.pinot.thirdeye.datalayer.pojo.LogicalView;

@JsonInclude(Include.NON_NULL)
public class MetricApi implements ThirdEyeApi {

  private Long id;
  private String name;
  private String urn;
  private DatasetApi dataset;
  private Boolean active;
  private Date created;
  private Date updated;
  private Boolean derived;
  private String derivedMetricExpression;
  private MetricAggFunction aggregationFunction;
  private Double rollupThreshold;
  private List<LogicalView> views;

  public Long getId() {
    return id;
  }

  public MetricApi setId(final Long id) {
    this.id = id;
    return this;
  }

  public String getName() {
    return name;
  }

  public MetricApi setName(final String name) {
    this.name = name;
    return this;
  }

  public String getUrn() {
    return urn;
  }

  public MetricApi setUrn(final String urn) {
    this.urn = urn;
    return this;
  }

  public DatasetApi getDataset() {
    return dataset;
  }

  public MetricApi setDataset(final DatasetApi dataset) {
    this.dataset = dataset;
    return this;
  }

  public Boolean getActive() {
    return active;
  }

  public MetricApi setActive(final Boolean active) {
    this.active = active;
    return this;
  }

  public Date getCreated() {
    return created;
  }

  public MetricApi setCreated(final Date created) {
    this.created = created;
    return this;
  }

  public Date getUpdated() {
    return updated;
  }

  public MetricApi setUpdated(final Date updated) {
    this.updated = updated;
    return this;
  }

  public Boolean getDerived() {
    return derived;
  }

  public MetricApi setDerived(final Boolean derived) {
    this.derived = derived;
    return this;
  }

  public String getDerivedMetricExpression() {
    return derivedMetricExpression;
  }

  public MetricApi setDerivedMetricExpression(final String derivedMetricExpression) {
    this.derivedMetricExpression = derivedMetricExpression;
    return this;
  }

  public MetricAggFunction getAggregationFunction() {
    return aggregationFunction;
  }

  public MetricApi setAggregationFunction(final MetricAggFunction aggregationFunction) {
    this.aggregationFunction = aggregationFunction;
    return this;
  }

  public Double getRollupThreshold() {
    return rollupThreshold;
  }

  public MetricApi setRollupThreshold(final Double rollupThreshold) {
    this.rollupThreshold = rollupThreshold;
    return this;
  }

  public List<LogicalView> getViews() {
    return views;
  }

  public MetricApi setViews(List<LogicalView> views) {
    this.views = views;
    return this;
  }
}
