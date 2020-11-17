package org.apache.pinot.thirdeye.alert;

import static org.apache.pinot.thirdeye.datalayer.util.ThirdEyeSpiUtils.optional;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import java.sql.Timestamp;
import org.apache.pinot.thirdeye.api.AlertApi;
import org.apache.pinot.thirdeye.api.UserApi;
import org.apache.pinot.thirdeye.datalayer.dto.AlertDTO;
import org.apache.pinot.thirdeye.detection.DataProvider;
import org.apache.pinot.thirdeye.util.ApiBeanMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class AlertApiBeanMapper {

  protected static final Logger LOG = LoggerFactory.getLogger(AlertApiBeanMapper.class);

  private final DataProvider dataProvider;

  @Inject
  public AlertApiBeanMapper(
      final DataProvider dataProvider) {
    this.dataProvider = dataProvider;
  }

  public AlertDTO toAlertDTO(final AlertApi api) {
    final AlertDTO dto = new AlertDTO();

    dto.setName(api.getName());
    dto.setDescription(api.getDescription());
    dto.setActive(optional(api.getActive()).orElse(true));
    dto.setCron(api.getCron());
    dto.setLastTimestamp(optional(api.getLastTimestamp())
        .map(d -> d.toInstant().toEpochMilli())
        .orElse(0L));
    dto.setUpdateTime(new Timestamp(System.currentTimeMillis()));

    optional(api.getNodes())
        .map(ApiBeanMapper::toAlertNodeMap)
        .ifPresent(dto::setNodes);

    // May not get updated while edits
    optional(api.getOwner())
        .map(UserApi::getPrincipal)
        .ifPresent(dto::setCreatedBy);

    final AlertExecutionPlanBuilder builder = new AlertExecutionPlanBuilder(dataProvider)
        .process(api);
    dto.setProperties(builder.getProperties());
    dto.setComponentSpecs(builder.getComponentSpecs());

    return dto;
  }
}