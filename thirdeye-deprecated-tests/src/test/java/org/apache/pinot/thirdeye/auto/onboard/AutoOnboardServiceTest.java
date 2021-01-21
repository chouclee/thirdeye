/**
 * Copyright (C) 2014-2018 LinkedIn Corp. (pinot-core@linkedin.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.pinot.thirdeye.auto.onboard;

import java.net.URL;
import java.time.Duration;
import org.apache.pinot.thirdeye.anomaly.ThirdEyeAnomalyConfiguration;
import org.testng.annotations.Test;

public class AutoOnboardServiceTest {

  @Test
  public void testAutoOnboardService() throws Exception {
    ThirdEyeAnomalyConfiguration thirdEyeAnomalyConfiguration = new ThirdEyeAnomalyConfiguration();

    AutoOnboardConfiguration autoOnboardConfiguration = new AutoOnboardConfiguration();
    autoOnboardConfiguration.setFrequency(Duration.ofSeconds(1));
    thirdEyeAnomalyConfiguration.setAutoOnboardConfiguration(autoOnboardConfiguration);

    URL url = AutoOnboardServiceTest.class.getResource("/data-sources/data-sources-config-1.yml");
    thirdEyeAnomalyConfiguration.setDataSources(url.getPath());

    AutoOnboardService autoOnboardService = new AutoOnboardService(thirdEyeAnomalyConfiguration);
    autoOnboardService.start();

    Thread.sleep(2000);

    // Execute without exceptions

    autoOnboardService.shutdown();
  }
}