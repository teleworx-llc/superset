/**
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
import React, {
  FunctionComponent,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { styled, t, useTheme } from '@superset-ui/core';
import { Select } from 'src/components';
import Icons from 'src/components/Icons';
import { NotificationMethodOption } from 'src/views/CRUD/alert/types';
import { StyledInputContainer } from '../AlertReportModal';

const StyledNotificationMethod = styled.div`
  margin-bottom: 10px;

  .input-container {
    textarea {
      height: auto;
    }
  }

  .inline-container {
    margin-bottom: 10px;

    .input-container {
      margin-left: 10px;
    }

    > div {
      margin: 0;
    }

    .delete-button {
      margin-left: 10px;
      padding-top: 3px;
    }
  }
`;

type NotificationSetting = {
  method?: NotificationMethodOption;
  recipients: string;
  options: NotificationMethodOption[];
};

interface NotificationMethodProps {
  setting?: NotificationSetting | null;
  index: number;
  onUpdate?: (index: number, updatedSetting: NotificationSetting) => void;
  onRemove?: (index: number) => void;
  usernameSftpValue: string;
  passwordSftpValue: string;
  portSftpValue: string;
  routeSftpValue: string;
  setUsernameSftpValue: Dispatch<SetStateAction<string>>;
  setPasswordSftpValue: Dispatch<SetStateAction<string>>;
  setPortSftpValue: Dispatch<SetStateAction<string>>;
  setRouteSftpValue: Dispatch<SetStateAction<string>>;
}

export const NotificationMethod: FunctionComponent<NotificationMethodProps> = ({
  setting = null,
  index,
  onUpdate,
  onRemove,
  usernameSftpValue,
  passwordSftpValue,
  portSftpValue,
  routeSftpValue,
  setUsernameSftpValue,
  setPasswordSftpValue,
  setPortSftpValue,
  setRouteSftpValue,
}) => {
  const { method, recipients, options } = setting || {};
  const [recipientValue, setRecipientValue] = useState<string>(
    recipients || '',
  );
  const theme = useTheme();

  if (!setting) {
    return null;
  }

  const onMethodChange = (method: NotificationMethodOption) => {
    // Since we're swapping the method, reset the recipients
    setRecipientValue('');
    if (onUpdate) {
      const updatedSetting = {
        ...setting,
        method,
        recipients: '',
      };

      onUpdate(index, updatedSetting);
    }
  };

  const onRecipientsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { target } = event;

    setRecipientValue(target.value);

    if (onUpdate) {
      const updatedSetting = {
        ...setting,
        recipients: target.value,
      };

      onUpdate(index, updatedSetting);
    }
  };

  const onUsernameSftpChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { target } = event;
    setUsernameSftpValue(target.value);
  };

  const onPasswordSftpChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { target } = event;
    setPasswordSftpValue(target.value);
  };

  const onPortSftpChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setPortSftpValue(target.value);
  };

  const onRouteSftpChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setRouteSftpValue(target.value);
  };

  // Set recipients
  if (!!recipients && recipientValue !== recipients) {
    setRecipientValue(recipients);
  }

  const recipientInputDisplay = method === 'Sftp' ? 'flex' : 'none';
  // const recipientInputDisplay = 'block';

  return (
    <StyledNotificationMethod>
      <div className="inline-container">
        <StyledInputContainer>
          <div className="input-container">
            <Select
              ariaLabel={t('Delivery method')}
              data-test="select-delivery-method"
              onChange={onMethodChange}
              placeholder={t('Select Delivery Method')}
              options={(options || []).map(
                (method: NotificationMethodOption) => ({
                  label: method,
                  value: method,
                }),
              )}
              value={method}
            />
          </div>
        </StyledInputContainer>
        {method !== undefined && !!onRemove ? (
          <span
            role="button"
            tabIndex={0}
            className="delete-button"
            onClick={() => onRemove(index)}
          >
            <Icons.Trash iconColor={theme.colors.grayscale.base} />
          </span>
        ) : null}
      </div>
      {method !== undefined ? (
        <>
          <StyledInputContainer>
            <div className="control-label">
              {method === 'Sftp' ? 'IP' : t(method)}
            </div>{' '}
            {}
            <div className="input-container">
              <textarea
                name="recipients"
                value={recipientValue}
                onChange={onRecipientsChange}
              />
            </div>
          </StyledInputContainer>
          {method === 'Sftp' && (
            <>
              <StyledInputContainer>
                <div className="control-label">USERNAME</div>
                <div
                  className="input-container"
                  style={{ display: recipientInputDisplay }}
                >
                  <textarea
                    name="username"
                    value={usernameSftpValue}
                    onChange={onUsernameSftpChange}
                  />
                </div>
              </StyledInputContainer>

              <StyledInputContainer>
                <div className="control-label">PASSWORD</div>
                <div className="input-container">
                  <textarea
                    name="password"
                    value={passwordSftpValue}
                    onChange={onPasswordSftpChange}
                  />
                </div>
              </StyledInputContainer>

              <StyledInputContainer>
                <div className="control-label">PORT</div>
                <div
                  className="input-container"
                  style={{ display: recipientInputDisplay }}
                >
                  <textarea
                    name="port"
                    value={portSftpValue}
                    onChange={onPortSftpChange}
                  />
                </div>
              </StyledInputContainer>

              <StyledInputContainer>
                <div className="control-label">ROUTE</div>
                <div
                  className="input-container"
                  style={{ display: recipientInputDisplay }}
                >
                  <textarea
                    name="route"
                    value={routeSftpValue}
                    onChange={onRouteSftpChange}
                  />
                </div>
              </StyledInputContainer>
            </>
          )}
          <div className="helper">
            {method === 'Sftp'
              ? 'Route must end with "/"'
              : t('Recipients are separated by "," or ";"')}
          </div>
        </>
      ) : null}
    </StyledNotificationMethod>
  );
};
