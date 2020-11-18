package org.apache.pinot.thirdeye.resources;

import static org.apache.pinot.thirdeye.ThirdEyeStatus.ERR_OBJECT_UNEXPECTED;

import com.google.common.collect.ImmutableList;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import org.apache.pinot.thirdeye.ThirdEyeStatus;
import org.apache.pinot.thirdeye.api.StatusApi;
import org.apache.pinot.thirdeye.api.StatusListApi;

public class ResourceUtils {

  public static void authenticate(boolean condition) {
    if (!condition) {
      throw unauthenticatedException();
    }
  }

  public static NotAuthorizedException unauthenticatedException() {
    return new NotAuthorizedException("Authentication Failure.");  // throw 401
  }

  public static <T> T ensureExists(T o, Object... args) {
    return ensureExists(o, ThirdEyeStatus.ERR_OBJECT_DOES_NOT_EXIST, args);
  }

  public static <T> T ensureExists(T o, ThirdEyeStatus status, Object... args) {
    ensure(o != null, status, args);
    return o;
  }

  public static void ensureNull(Object o, String message) {
    ensure(o == null, ERR_OBJECT_UNEXPECTED, message);
  }

  public static void ensureNull(Object o, ThirdEyeStatus status, Object... args) {
    ensure(o == null, status, args);
  }

  public static void ensure(boolean condition, String message) {
    ensure(condition, ThirdEyeStatus.ERR_UNKNOWN, message);
  }

  public static void ensure(boolean condition, ThirdEyeStatus status, Object... args) {
    if (!condition) {
      throw badRequest(status, args);
    }
  }

  public static StatusListApi statusResponse(ThirdEyeStatus status, Object... args) {
    return new StatusListApi()
        .setList(ImmutableList.of(new StatusApi()
            .setCode(status)
            .setMsg(String.format(status.getMessage(), args))
        ));
  }

  public static BadRequestException badRequest(ThirdEyeStatus status, Object... args) {
    return badRequest(statusResponse(status, args));
  }

  public static BadRequestException badRequest(final StatusListApi response) {
    return new BadRequestException(Response
        .status(Status.BAD_REQUEST)
        .entity(response)
        .build()
    );
  }
}
