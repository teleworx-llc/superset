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
import re
import socket
import tempfile

from smb.SMBConnection import SMBConnection
from io import IOBase
from typing import Sequence, Union

from flask_babel import gettext as __

from superset import app
from superset.models.reports import ReportRecipientType
from superset.reports.notifications.base import BaseNotification
from superset.reports.notifications.exceptions import NotificationError
from superset.utils import csv

logger = logging.getLogger(__name__)

class SambaNotification(BaseNotification):
    """
    Sends a samba notification for a report recipient
    """
    type = ReportRecipientType.SAMBA

    def _get_data(self, tag_name) -> str:
        return json.loads(self._recipient.recipient_config_json)[tag_name]


    def _get_inline_files(self) -> Sequence[Union[str, IOBase, bytes]]:
        if self._content.csv:
            return [self._content.csv]
        if self._content.screenshots:
            return self._content.screenshots
        return []

    def send(self) -> None:
        client_machine_name = socket.gethostname()
        user_ID = self._get_data("username")
        password = self._get_data("password")
        server_name = self._get_data("server")
        shared_folder = self._get_data("folder")
        path = self._get_data("route")
        server_ip = self._get_data("target")
        timestamp = self._get_data("timestamp")
        delimiter = self._get_data("divider")

        files = self._get_inline_files()

        try:

            conn = SMBConnection(user_ID, password, client_machine_name, server_name, use_ntlm_v2 = True)
            assert conn.connect(server_ip, 139)

            if files:
                for file in files:
                    file_csv = self.csv_manager(file, delimiter)
                    temp = tempfile.TemporaryFile()
                    temp.write(file_csv)
                    temp.seek(0)
                    conn.storeFile(path, shared_folder + self.set_timestamp(timestamp, self.set_file_type()), temp)

            else:
                content = str.encode(self._content.embedded_data.to_string())
                temp = tempfile.TemporaryFile()
                temp.write(content)
                temp.seek(0)
                conn.storeFile(path, shared_folder + self.set_timestamp(timestamp, self.set_file_type()), temp) 

            conn.close()
            
        except Exception as ex:
                raise NotificationError(ex) from ex


