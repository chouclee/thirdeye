/*
 * Copyright 2022 StarTree Inc
 *
 * Licensed under the StarTree Community License (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.startree.ai/legal/startree-community-license
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT * WARRANTIES OF ANY KIND,
 * either express or implied.
 * See the License for the specific language governing permissions and limitations under
 * the License.
 */
package ai.startree.thirdeye.detectionpipeline.operator;

import ai.startree.thirdeye.spi.detection.model.DetectionResult;
import ai.startree.thirdeye.spi.detection.v2.DetectionPipelineResult;
import ai.startree.thirdeye.spi.detection.v2.OperatorContext;
import java.util.List;

public class EchoOperator extends DetectionPipelineOperator {

  public static final String DEFAULT_INPUT_KEY = "input_Echo";
  public static final String DEFAULT_OUTPUT_KEY = "output_Echo";

  public EchoOperator() {
    super();
  }

  @Override
  public void init(final OperatorContext context) {
    super.init(context);
  }

  @Override
  public void execute() throws Exception {
    final String echoText = getPlanNode().getParams().get(DEFAULT_INPUT_KEY).toString();
    setOutput(DEFAULT_OUTPUT_KEY, new EchoResult(echoText));
  }

  @Override
  public String getOperatorName() {
    return "EchoOperator";
  }

  public static class EchoResult implements DetectionPipelineResult {

    private final String text;

    public EchoResult(final String text) {
      this.text = text;
    }

    @Override
    public List<DetectionResult> getDetectionResults() {
      return null;
    }

    public String text() {
      return text;
    }
  }
}