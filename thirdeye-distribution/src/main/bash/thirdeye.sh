#!/bin/bash
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
#

# Script Usage
# ---------------------------------------------
# ./thirdeye.sh ${MODE}
#
# - MODE: Choices: {coordinator, worker, * }
#       coordinator: Start the coordinator
#       worker: Start the worker
#       For any other value, the script fails.
#

# Attempt to set APP_HOME
# Resolve links: $0 may be a link
PRG="$0"
# Need this for relative symlinks.
while [ -h "$PRG" ] ; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '.*-> \(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=`dirname "$PRG"`"/$link"
    fi
done
SAVED="`pwd`"
cd "`dirname \"$PRG\"`/.." >/dev/null
APP_HOME="`pwd -P`"
cd "$SAVED" >/dev/null

CONFIG_DIR="${APP_HOME}/config"
LIB_DIR="${APP_HOME}/lib"

CLASSPATH=""
for filepath in "${LIB_DIR}"/*; do
  CLASSPATH="${CLASSPATH}:${filepath}"
done

function start_worker {
  class_ref="org.apache.pinot.thirdeye.worker.ThirdEyeWorker"

  echo "Starting Thirdeye worker.. config_dir: ${CONFIG_DIR}"
  java -cp "${CLASSPATH}" ${class_ref} "${CONFIG_DIR}"
}

function start_coordinator {
  class_ref="org.apache.pinot.thirdeye.ThirdEyeCoordinator"

  echo "Starting Thirdeye coordinator.. config_dir: ${CONFIG_DIR}"
  java -cp "${CLASSPATH}" ${class_ref} server "${CONFIG_DIR}"/coordinator.yaml
}

MODE=$1
case ${MODE} in
    "coordinator" )  start_coordinator ;;
    "worker"  )      start_worker ;;
    * )              echo "Invalid argument: ${MODE}! Exiting."; exit 1;;
esac