import { FC, useContext, useState } from 'react';
import { ValidateFieldsError } from 'async-validator';

import { Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import * as SecurityApi from '../../api/security';
import { SecuritySettings } from '../../types';
import { ButtonRow, FormLoader, MessageBox, SectionContent, ValidatedPasswordField } from '../../components';
import { SECURITY_SETTINGS_VALIDATOR, validate } from '../../validators';
import { updateValue, useRest } from '../../utils';
import { AuthenticatedContext } from '../../contexts/authentication';

const SecuritySettingsForm: FC = () => {
  const [fieldErrors, setFieldErrors] = useState<ValidateFieldsError>();
  const { loadData, saving, data, setData, saveData, errorMessage } = useRest<SecuritySettings>({
    read: SecurityApi.readSecuritySettings,
    update: SecurityApi.updateSecuritySettings
  });

  const authenticatedContext = useContext(AuthenticatedContext);
  const updateFormValue = updateValue(setData);

  const content = () => {
    if (!data) {
      return <FormLoader onRetry={loadData} errorMessage={errorMessage} />;
    }

    const validateAndSubmit = async () => {
      try {
        setFieldErrors(undefined);
        await validate(SECURITY_SETTINGS_VALIDATOR, data);
        await saveData();
        await authenticatedContext.refresh();
      } catch (errors: any) {
        setFieldErrors(errors);
      }
    };

    return (
      <>
        <ValidatedPasswordField
          fieldErrors={fieldErrors}
          name="jwt_secret"
          label="su Password"
          fullWidth
          variant="outlined"
          value={data.jwt_secret}
          onChange={updateFormValue}
          margin="normal"
        />
        <MessageBox
          level="info"
          message="The su (super user) password is used to sign authentication tokens and also enable admin privileges within the Console."
          mt={1}
        />
        <ButtonRow>
          <Button
            startIcon={<SaveIcon />}
            disabled={saving}
            variant="outlined"
            color="primary"
            type="submit"
            onClick={validateAndSubmit}
          >
            Save
          </Button>
        </ButtonRow>
      </>
    );
  };

  return (
    <SectionContent title="Security Settings" titleGutter>
      {content()}
    </SectionContent>
  );
};

export default SecuritySettingsForm;
