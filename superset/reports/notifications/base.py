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
from dataclasses import dataclass
from typing import Any, List, Optional, Type
from datetime import datetime
from io import StringIO


import pandas as pd
import csv
import re

from flask import current_app

from superset.models.reports import ReportRecipients, ReportRecipientType
from superset.utils import csv


@dataclass
class NotificationContent:
    name: str
    csv: Optional[bytes] = None  # bytes for csv file
    screenshots: Optional[List[bytes]] = None  # bytes for a list of screenshots
    text: Optional[str] = None
    description: Optional[str] = ""
    url: Optional[str] = None  # url to chart/dashboard for this screenshot
    embedded_data: Optional[pd.DataFrame] = None


class BaseNotification:  # pylint: disable=too-few-public-methods
    """
    Serves has base for all notifications and creates a simple plugin system
    for extending future implementations.
    Child implementations get automatically registered and should identify the
    notification type
    """

    plugins: List[Type["BaseNotification"]] = []
    type: Optional[ReportRecipientType] = None
    """
    Child classes set their notification type ex: `type = "email"` this string will be
    used by ReportRecipients.type to map to the correct implementation
    """

    def __init_subclass__(cls, *args: Any, **kwargs: Any) -> None:
        super().__init_subclass__(*args, **kwargs)
        cls.plugins.append(cls)

    def __init__(
        self, recipient: ReportRecipients, content: NotificationContent
    ) -> None:
        self._recipient = recipient
        self._content = content

    def send(self) -> None:
        raise NotImplementedError()

    def set_file_type(self) -> None:
        if self._content.csv:
            file_type = '.csv'
        elif self._content.screenshots:
            file_type = '.png'
        else:
            file_type = '.txt'
        return file_type

    def set_timestamp(self, timestamp, file_type) -> None:
        if timestamp:
            dt = datetime.now()
            ts = str(dt).split('.', 1)[0]
            file_name = self._content.name + ' ' + ts + file_type
        else:
            file_name = self._content.name + file_type
        file_name = re.sub(r'[\\/*?:"<>|]',"",file_name) #Clean Filename Replacing not valid characters
        return file_name

    def csv_manager(self, file, delimiter) -> None:
        encoding = current_app.config["CSV_EXPORT"].get("encoding", "utf-8")
        sep = current_app.config["CSV_EXPORT"].get("sep", ";")
        if delimiter:
            f_delimiter = delimiter
        else:
            f_delimiter = sep
        file_content = file.decode(encoding)
        df = pd.read_csv(StringIO(file_content), sep=sep) 
        escaped_csv_str = csv.df_to_escaped_csv(df, encoding=encoding, sep=f_delimiter if f_delimiter != 'Tab' else '\t', index=False)
        file_csv = escaped_csv_str.encode(encoding)
        return file_csv
