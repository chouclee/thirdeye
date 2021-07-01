/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.apache.pinot.thirdeye.datasource;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.apache.commons.lang3.StringUtils;
import org.apache.pinot.thirdeye.spi.datalayer.bao.DataSourceManager;
import org.apache.pinot.thirdeye.spi.datalayer.bao.DatasetConfigManager;
import org.apache.pinot.thirdeye.spi.datalayer.bao.MetricConfigManager;
import org.apache.pinot.thirdeye.spi.datalayer.dto.DataSourceDTO;
import org.apache.pinot.thirdeye.spi.datalayer.pojo.DataSourceMetaBean;
import org.apache.pinot.thirdeye.spi.datasource.AutoOnboard;
import org.apache.pinot.thirdeye.spi.datasource.ThirdEyeDataSourceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is a service to onboard datasets automatically to thirdeye from the different data sources
 * This service runs periodically and runs auto load for each data source
 */
@Singleton
public class AutoOnboardService implements Runnable {

  private static final Logger LOG = LoggerFactory.getLogger(AutoOnboardService.class);

  private final ScheduledExecutorService scheduledExecutorService;

  private final List<AutoOnboard> autoOnboardServices = new ArrayList<>();
  private final AutoOnboardConfiguration autoOnboardConfiguration;
  private final MetricConfigManager metricConfigManager;
  private final DatasetConfigManager datasetConfigManager;
  private final DataSourceManager dataSourceManager;

  /**
   * Reads data sources configs and instantiates the constructors for auto load of all data sources,
   * if availble
   */
  @Inject
  public AutoOnboardService(
      final AutoOnboardConfiguration autoOnboardConfiguration,
      final MetricConfigManager metricConfigManager,
      final DatasetConfigManager datasetConfigManager,
      final DataSourceManager dataSourceManager) {
    this.autoOnboardConfiguration = autoOnboardConfiguration;
    this.metricConfigManager = metricConfigManager;
    this.datasetConfigManager = datasetConfigManager;
    this.dataSourceManager = dataSourceManager;

    scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();
  }

  public static Map<String, List<AutoOnboard>> getDataSourceToAutoOnboardMap(
      final List<DataSourceDTO> dataSources,
      final ThirdEyeDataSourceContext context) {
    final Map<String, List<AutoOnboard>> dataSourceToOnboardMap = new HashMap<>();

    for (DataSourceDTO dataSource : dataSources) {
      processDataSourceConfig(dataSourceToOnboardMap,
          dataSource,
          context);
    }

    return dataSourceToOnboardMap;
  }

  private static void processDataSourceConfig(
      final Map<String, List<AutoOnboard>> dataSourceToOnboardMap,
      final DataSourceDTO dataSource,
      final ThirdEyeDataSourceContext context) {
    final List<DataSourceMetaBean> metaList = dataSource
        .getMetaList();
    if (metaList == null) {
      return;
    }

    for (DataSourceMetaBean meta : metaList) {
      String metaClassRef = meta.getClassRef();
      // Inherit properties from Data Source
      meta.getProperties().put("name", dataSource.getName());
      meta.getProperties().putAll(dataSource.getProperties());
      if (StringUtils.isNotBlank(metaClassRef)) {
        try {
          final AutoOnboard instance = createAutoOnboardInstance(context, meta);

          dataSourceToOnboardMap
              .computeIfAbsent(dataSource.getName(), k -> new ArrayList<>())
              .add(instance);
        } catch (Exception e) {
          LOG.error("Exception in creating metadata constructor {}", metaClassRef, e);
        }
      }
    }
  }

  private static AutoOnboard createAutoOnboardInstance(final ThirdEyeDataSourceContext context,
      final DataSourceMetaBean meta)
      throws ReflectiveOperationException {
    final AutoOnboard instance = (AutoOnboard) Class
        .forName(meta.getClassRef())
        .getConstructor(DataSourceMetaBean.class)
        .newInstance(meta);
    instance.init(context);
    return instance;
  }

  public void start() {
    scheduledExecutorService.scheduleAtFixedRate(this, 0,
        autoOnboardConfiguration.getFrequency().getSeconds(),
        TimeUnit.SECONDS);
  }

  public void shutdown() {
    LOG.info("Shutting down AutoOnboardService");
    scheduledExecutorService.shutdown();
  }

  @Override
  public void run() {
    final ThirdEyeDataSourceContext context = new ThirdEyeDataSourceContext()
        .setMetricConfigManager(metricConfigManager)
        .setDatasetConfigManager(datasetConfigManager);
    final Map<String, List<AutoOnboard>> dataSourceToOnboardMap = getDataSourceToAutoOnboardMap(
        dataSourceManager.findAll(),
        context);

    for (List<AutoOnboard> autoOnboards : dataSourceToOnboardMap.values()) {
      autoOnboardServices.addAll(autoOnboards);
    }
    for (AutoOnboard autoOnboard : autoOnboardServices) {
      LOG.info("Running AutoOnboard for {}", autoOnboard.getClass().getSimpleName());
      try {
        autoOnboard.run();
      } catch (Throwable t) {
        LOG.error("Uncaught exception is detected while running AutoOnboard for {}",
            autoOnboard.getClass().getSimpleName());
        t.printStackTrace();
      }
    }
  }
}