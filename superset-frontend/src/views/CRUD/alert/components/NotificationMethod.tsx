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
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import { styled, t, useTheme } from '@superset-ui/core';
import { Select } from 'src/components';
import Icons from 'src/components/Icons';
import {
  NotificationMethodOption,
  RecipientConfigJson,
} from 'src/views/CRUD/alert/types';
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
  recipients: RecipientConfigJson;
  options: NotificationMethodOption[];
};

interface NotificationMethodProps {
  setting?: NotificationSetting | null;
  index: number;
  onUpdate?: (index: number, updatedSetting: NotificationSetting) => void;
  onRemove?: (index: number) => void;
  usernameValue: string;
  passwordValue: string;
  portValue: string;
  routeValue: string;
  timestampValue: boolean;
  zipValue: boolean;
  serverValue: string;
  folderValue: string;
  setUsernameValue: Dispatch<SetStateAction<string>>;
  setPasswordValue: Dispatch<SetStateAction<string>>;
  setPortValue: Dispatch<SetStateAction<string>>;
  setRouteValue: Dispatch<SetStateAction<string>>;
  setTimestampValue: Dispatch<SetStateAction<boolean>>;
  setZipValue: Dispatch<SetStateAction<boolean>>;
  setServerValue: Dispatch<SetStateAction<string>>;
  setFolderValue: Dispatch<SetStateAction<string>>;
}

export const NotificationMethod: FunctionComponent<NotificationMethodProps> = ({
  setting = null,
  index,
  onUpdate,
  onRemove,
  usernameValue,
  passwordValue,
  portValue,
  routeValue,
  timestampValue,
  serverValue,
  folderValue,
  zipValue,
  setUsernameValue,
  setPasswordValue,
  setPortValue,
  setRouteValue,
  setTimestampValue,
  setServerValue,
  setFolderValue,
  setZipValue,
}) => {
  const { method, recipients, options } = setting || {};
  const [recipientValue, setRecipientValue] = useState<string>(
    recipients?.target || '',
  );
  const theme = useTheme();

  useEffect(() => {
    if (recipients?.username) {
      setUsernameValue(recipients?.username);
    }
    if (recipients?.password) {
      setPasswordValue(recipients?.password);
    }
    if (recipients?.port) {
      setPortValue(recipients?.port);
    }
    if (recipients?.route) {
      setRouteValue(recipients?.route);
    }
    if (recipients?.timestamp) {
      setTimestampValue(recipients?.timestamp);
    }
    if (recipients?.server) {
      setServerValue(recipients?.server);
    }
    if (recipients?.folder) {
      setFolderValue(recipients?.folder);
    }
    if (recipients?.zip) {
      setZipValue(recipients?.zip);
    }
  }, []);

  if (!setting) {
    return null;
  }

  const onMethodChange = (method: NotificationMethodOption) => {
    // Since we're swapping the method, reset the recipients
    setRecipientValue('');
    if (onUpdate) {
      let updatedSetting: NotificationSetting = {
        ...setting,
        method,
        recipients: {
          target: '',
        },
      };
      if (method === 'Sftp') {
        updatedSetting = {
          ...setting,
          method,
          recipients: {
            target: '',
            username: '',
            password: '',
            port: '',
            route: '',
            timestamp: false,
          },
        };
        setUsernameValue('');
        setPasswordValue('');
        setPortValue('');
        setRouteValue('');
        setTimestampValue(false);
      }
      if (method === 'Samba') {
        updatedSetting = {
          ...setting,
          method,
          recipients: {
            target: '',
            username: '',
            password: '',
            server: '',
            folder: '',
            route: '',
            timestamp: false,
          },
        };
        setUsernameValue('');
        setPasswordValue('');
        setServerValue('');
        setRouteValue('');
        setFolderValue('');
        setTimestampValue(false);
      }
      if (method === 'Email') {
        updatedSetting = {
          ...setting,
          method,
          recipients: {
            target: '',
            zip: true,
          },
        };
        setZipValue(true);
      }
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
        recipients: { ...recipients, target: target.value },
      };

      onUpdate(index, updatedSetting);
    }
  };

  const onUsernameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setUsernameValue(target.value);
  };

  const onPasswordChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setPasswordValue(target.value);
  };

  const onPortChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setPortValue(target.value);
  };

  const onRouteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setRouteValue(target.value);
  };

  const onTimestampChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setTimestampValue(target.checked);
  };

  const onZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    setZipValue(target.checked);
  };

  const onServerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setServerValue(target.value);
  };

  const onFolderChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = event;
    setFolderValue(target.value);
  };

  // Set recipients
  if (!!recipients && recipientValue !== recipients.target) {
    setRecipientValue(recipients.target);
  }

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
              {method === 'Sftp' || method === 'Samba' ? 'IP' : t(method)}
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
          {(method === 'Sftp' || method === 'Samba') && (
            <StyledInputContainer>
              <div className="control-label">USERNAME</div>
              <div className="input-container">
                <textarea
                  name="username"
                  value={usernameValue}
                  onChange={onUsernameChange}
                />
              </div>
            </StyledInputContainer>
          )}

          {(method === 'Sftp' || method === 'Samba') && (
            <StyledInputContainer>
              <div className="control-label">PASSWORD</div>
              <div className="input-container">
                <textarea
                  name="password"
                  value={passwordValue}
                  onChange={onPasswordChange}
                />
              </div>
            </StyledInputContainer>
          )}

          {method === 'Sftp' && (
            <StyledInputContainer>
              <div className="control-label">PORT</div>
              <div className="input-container">
                <textarea
                  name="port"
                  value={portValue}
                  onChange={onPortChange}
                />
              </div>
            </StyledInputContainer>
          )}
          {method === 'Samba' && (
            <StyledInputContainer>
              <div className="control-label">SERVER</div>
              <div className="input-container">
                <textarea
                  name="server"
                  value={serverValue}
                  onChange={onServerChange}
                />
              </div>
            </StyledInputContainer>
          )}
          {(method === 'Sftp' || method === 'Samba') && (
            <StyledInputContainer>
              <div className="control-label">ROUTE</div>
              <div className="input-container">
                <textarea
                  name="route"
                  value={routeValue}
                  onChange={onRouteChange}
                />
              </div>
            </StyledInputContainer>
          )}
          {method === 'Samba' && (
            <StyledInputContainer>
              <div className="control-label">FOLDER</div>
              <div className="input-container">
                <textarea
                  name="path"
                  value={folderValue}
                  onChange={onFolderChange}
                />
              </div>
            </StyledInputContainer>
          )}
          {(method === 'Sftp' || method === 'Samba') && (
            <StyledInputContainer>
              <div className="input-container">
                <label
                  htmlFor="timestamp"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    id="timestamp"
                    onChange={onTimestampChange}
                    checked={timestampValue}
                    style={{ margin: '0' }}
                  />
                  Show timestamp on report name
                </label>
              </div>
            </StyledInputContainer>
          )}
          {method === 'Email' && (
            <StyledInputContainer>
              <div className="input-container">
                <label
                  htmlFor="zip"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    id="zip"
                    onChange={onZipChange}
                    checked={zipValue}
                    style={{ margin: '0' }}
                  />
                  Zip CSV
                </label>
              </div>
            </StyledInputContainer>
          )}
          {method !== 'Samba' && (
            <div className="helper">
              {method === 'Sftp'
                ? 'Route must end with "/"'
                : t('Recipients are separated by "," or ";"')}
            </div>
          )}
        </>
      ) : null}
    </StyledNotificationMethod>
  );
};
