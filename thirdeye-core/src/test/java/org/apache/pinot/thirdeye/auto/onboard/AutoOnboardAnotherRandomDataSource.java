package org.apache.pinot.thirdeye.auto.onboard;

import org.apache.pinot.thirdeye.spi.auto.onboard.AutoOnboard;
import org.apache.pinot.thirdeye.spi.datalayer.pojo.DataSourceMetaBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AutoOnboardAnotherRandomDataSource extends AutoOnboard {

  private static final Logger LOG = LoggerFactory
      .getLogger(AutoOnboardAnotherRandomDataSource.class);

  public AutoOnboardAnotherRandomDataSource(DataSourceMetaBean meta) {
    super(meta);
  }

  @Override
  public void run() {
    throw new RuntimeException("There was an exception while executing this Source");
  }

  @Override
  public void runAdhoc() {

  }
}