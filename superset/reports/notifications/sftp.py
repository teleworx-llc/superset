# -*- coding: utf-8 -*-
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

import json
import logging
import paramiko
from io import IOBase
from io import BytesIO
from io import StringIO
from typing import Sequence, Union

from flask_babel import gettext as __

from superset import app
from superset.models.reports import ReportRecipientType
from superset.reports.notifications.base import BaseNotification
from superset.reports.notifications.exceptions import NotificationError

logger = logging.getLogger(__name__)

class SftpNotification(BaseNotification):
    """
    Sends an sftp notification for a report recipient
    """
    type = ReportRecipientType.SFTP


    def _get_data(self, tag_name) -> str:
        return json.loads(self._recipient.recipient_config_json)[tag_name]


    def _get_inline_files(self) -> Sequence[Union[str, IOBase, bytes]]:
        if self._content.csv:
            return [self._content.csv]
        if self._content.screenshots:
            return self._content.screenshots
        return []


    def send(self) -> None:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        host_ip = self._get_data("target")
        host_username = self._get_data("username")
        host_password = self._get_data("password")
        host_port = self._get_data("port")
        send_route = self._get_data("route")
        timestamp = self._get_data("timestamp")
        delimiter = self._get_data("divider")

        files = self._get_inline_files()

        try:
            ssh.connect(hostname=host_ip, username=host_username, password=host_password, port=host_port)
            sftp_client = ssh.open_sftp()

            if files:
                for file in files:
                    file_csv = self.csv_manager(file, delimiter)
                    sftp_client.putfo(BytesIO(file_csv), send_route + self.set_timestamp(timestamp, self.set_file_type()))
            else:
                sftp_client.putfo(StringIO(self._content.embedded_data.to_string()), send_route + self.set_timestamp(timestamp, self.set_file_type()) , confirm=False)

            sftp_client.close()
            ssh.close()

        except Exception as ex:
                raise NotificationError(ex) from ex



