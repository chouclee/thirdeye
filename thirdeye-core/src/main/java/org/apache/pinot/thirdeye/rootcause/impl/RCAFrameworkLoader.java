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

package org.apache.pinot.thirdeye.rootcause.impl;

import static org.apache.pinot.thirdeye.util.ConfigurationLoader.readConfig;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import java.io.File;
import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import org.apache.commons.collections4.MapUtils;
import org.apache.pinot.thirdeye.datalayer.bao.DatasetConfigManager;
import org.apache.pinot.thirdeye.datalayer.bao.EntityToEntityMappingManager;
import org.apache.pinot.thirdeye.datalayer.bao.EventManager;
import org.apache.pinot.thirdeye.datalayer.bao.MergedAnomalyResultManager;
import org.apache.pinot.thirdeye.datalayer.bao.MetricConfigManager;
import org.apache.pinot.thirdeye.datasource.ThirdEyeCacheRegistry;
import org.apache.pinot.thirdeye.rootcause.Pipeline;
import org.apache.pinot.thirdeye.rootcause.PipelineInitContext;
import org.apache.pinot.thirdeye.rootcause.RCAFramework;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * RCAFrameworkLoader creates Pipeline instances based on a YAML config file. It expects the
 * Pipeline
 * implementation to support a constructor that takes (name, inputs, properties map) as arguments.
 * It further augments certain properties with additional information, e.g. the {@code PROP_PATH}
 * property with absolute path information.
 */
@Singleton
public class RCAFrameworkLoader {

  public static final String PROP_PATH = "path";
  public static final String PROP_PATH_POSTFIX = "Path";

  private static final Logger LOG = LoggerFactory.getLogger(RCAFrameworkLoader.class);

  private final MetricConfigManager metricConfigManager;
  private final DatasetConfigManager datasetConfigManager;
  private final ThirdEyeCacheRegistry thirdEyeCacheRegistry;
  private final EntityToEntityMappingManager entityToEntityMappingManager;
  private final EventManager eventManager;
  private final MergedAnomalyResultManager mergedAnomalyResultManager;

  @Inject
  public RCAFrameworkLoader(
      final MetricConfigManager metricConfigManager,
      final DatasetConfigManager datasetConfigManager,
      final ThirdEyeCacheRegistry thirdEyeCacheRegistry,
      final EntityToEntityMappingManager entityToEntityMappingManager,
      final EventManager eventManager,
      final MergedAnomalyResultManager mergedAnomalyResultManager) {
    this.metricConfigManager = metricConfigManager;
    this.datasetConfigManager = datasetConfigManager;
    this.thirdEyeCacheRegistry = thirdEyeCacheRegistry;
    this.entityToEntityMappingManager = entityToEntityMappingManager;
    this.eventManager = eventManager;
    this.mergedAnomalyResultManager = mergedAnomalyResultManager;
  }

  static Map<String, Object> augmentPathProperty(Map<String, Object> properties, File rcaConfig) {
    for (Map.Entry<String, Object> entry : properties.entrySet()) {
      if ((entry.getKey().equals(PROP_PATH) ||
          entry.getKey().endsWith(PROP_PATH_POSTFIX)) &&
          entry.getValue() instanceof String) {
        File path = new File(entry.getValue().toString());
        if (!path.isAbsolute()) {
          properties.put(entry.getKey(), rcaConfig.getParent() + File.separator + path);
        }
      }
    }
    return properties;
  }

  public Map<String, RCAFramework> getFrameworksFromConfig(File rcaFile,
      ExecutorService executor) throws Exception {
    Map<String, RCAFramework> frameworks = new HashMap<>();

    LOG.info("Loading all frameworks from '{}'", rcaFile);
    final RCAConfiguration rcaConfiguration = readConfig(rcaFile, RCAConfiguration.class);

    for (String frameworkName : rcaConfiguration.getFrameworks().keySet()) {
      List<Pipeline> pipelines = getPipelinesFromConfig(rcaFile, frameworkName);
      frameworks.put(frameworkName, new RCAFramework(pipelines, executor));
    }

    return frameworks;
  }

  List<Pipeline> getPipelinesFromConfig(File rcaFile, String frameworkName)
      throws Exception {
    LOG.info("Loading framework '{}' from '{}'", frameworkName, rcaFile);
    final RCAConfiguration rcaConfiguration = readConfig(rcaFile, RCAConfiguration.class);

    return getPipelines(rcaConfiguration, rcaFile, frameworkName);
  }

  private List<Pipeline> getPipelines(RCAConfiguration config, File configPath,
      String frameworkName)
      throws Exception {
    List<Pipeline> pipelines = new ArrayList<>();
    Map<String, List<PipelineConfiguration>> rcaPipelinesConfiguration = config.getFrameworks();
    if (!MapUtils.isEmpty(rcaPipelinesConfiguration)) {
      if (!rcaPipelinesConfiguration.containsKey(frameworkName)) {
        throw new IllegalArgumentException(
            String.format("Framework '%s' does not exist", frameworkName));
      }

      for (PipelineConfiguration pipelineConfig : rcaPipelinesConfiguration.get(frameworkName)) {
        String outputName = pipelineConfig.getOutputName();
        Set<String> inputNames = new HashSet<>(pipelineConfig.getInputNames());
        String className = pipelineConfig.getClassName();
        Map<String, Object> properties = pipelineConfig.getProperties();
        if (properties == null) {
          properties = new HashMap<>();
        }

        properties = augmentPathProperty(properties, configPath);

        LOG.info("Creating pipeline '{}' [{}] with inputs '{}'", outputName, className, inputNames);
        final PipelineInitContext initContext = new PipelineInitContext()
            .setInputNames(inputNames)
            .setOutputName(outputName)
            .setProperties(properties)
            .setDatasetConfigManager(datasetConfigManager)
            .setMetricConfigManager(metricConfigManager)
            .setThirdEyeCacheRegistry(thirdEyeCacheRegistry)
            .setEntityToEntityMappingManager(entityToEntityMappingManager)
            .setEventManager(eventManager)
            .setMergedAnomalyResultManager(mergedAnomalyResultManager);
        ;

        final Constructor<?> constructor = Class.forName(className)
            .getConstructor();
        final Pipeline pipeline = (Pipeline) constructor.newInstance();
        pipeline.init(initContext);

        pipelines.add(pipeline);
      }
    }

    return pipelines;
  }
}
