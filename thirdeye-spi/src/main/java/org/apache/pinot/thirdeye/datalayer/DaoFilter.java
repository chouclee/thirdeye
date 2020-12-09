package org.apache.pinot.thirdeye.datalayer;

import org.apache.pinot.thirdeye.datalayer.pojo.AbstractBean;
import org.apache.pinot.thirdeye.datalayer.util.Predicate;

public class DaoFilter {

  private Class<? extends AbstractBean> beanClass;
  private Predicate predicate;
  private Integer limit;
  private Integer offset;
  private String orderByKey;
  private boolean isDesc = false;

  public Predicate getPredicate() {
    return predicate;
  }

  public DaoFilter setPredicate(final Predicate predicate) {
    this.predicate = predicate;
    return this;
  }

  public Integer getLimit() {
    return limit;
  }

  public DaoFilter setLimit(final Integer limit) {
    this.limit = limit;
    return this;
  }

  public Integer getOffset() {
    return offset;
  }

  public DaoFilter setOffset(final Integer offset) {
    this.offset = offset;
    return this;
  }

  public Class<? extends AbstractBean> getBeanClass() {
    return beanClass;
  }

  public DaoFilter setBeanClass(
      final Class<? extends AbstractBean> beanClass) {
    this.beanClass = beanClass;
    return this;
  }

  public String getOrderByKey() {
    return orderByKey;
  }

  public DaoFilter setOrderByKey(final String orderByKey) {
    this.orderByKey = orderByKey;
    return this;
  }

  public boolean isDesc() {
    return isDesc;
  }

  public DaoFilter setDesc(final boolean desc) {
    isDesc = desc;
    return this;
  }
}