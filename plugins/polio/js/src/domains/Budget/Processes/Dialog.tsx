import {
    makeFullModal,
    AddButton,
    IntlMessage,
    ConfirmCancelModal,
    useSafeIntl,
} from 'bluesquare-components';
import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useFormik } from 'formik';
import { isEqual } from 'lodash';

import {
    useApiErrorValidation,
    useTranslatedErrors,
} from '../../../../../../../hat/assets/js/apps/Iaso/libs/validation';
import InputComponent from '../../../../../../../hat/assets/js/apps/Iaso/components/forms/InputComponent';
import { InputWithInfos } from '../../../../../../../hat/assets/js/apps/Iaso/components/InputWithInfos';
import { commaSeparatedIdsToArray } from '../../../../../../../hat/assets/js/apps/Iaso/utils/forms';

import MESSAGES from '../../../constants/messages';
import { useProcessValidation } from './validation';
import { useGetCountriesDropdown } from '../../../hooks/useGetCountriesDropdown';
import { useSaveProcess, SaveProccessQuery } from '../hooks/api/useSaveProcess';
import { useGetCampaigns } from '../../Campaigns/hooks/api/useGetCampaigns';
import { makeCampaignsDropDown } from '../../../utils';
import { Campaign } from '../../../constants/types';

type Props = {
    titleMessage: IntlMessage;
    isOpen: boolean;
    closeDialog: () => void;
};

const ProcessDialog: FunctionComponent<Props> = ({
    titleMessage,
    isOpen,
    closeDialog,
}) => {
    const { formatMessage } = useSafeIntl();

    const [selectedCountryId, setSelectedCountryId] = useState<
        number | undefined
    >();
    const [selectedCampaign, setSelectedCampaign] = useState<
        Campaign | undefined
    >();

    // API calls
    const { data: countriesList, isFetching: isFetchingCountries } =
        useGetCountriesDropdown();
    const { data: campaignsList = [], isFetching: isFetchingCampaigns } =
        useGetCampaigns({
            countries: [`${selectedCountryId}`],
            enabled: Boolean(selectedCountryId),
        });

    const { mutateAsync: saveProcess } = useSaveProcess();
    const campaignsDropdown = useMemo(
        () => makeCampaignsDropDown(campaignsList),
        [campaignsList],
    );
    const handleChangeCampaign = useCallback(
        (_, newCampaignid) => {
            const selected = campaignsDropdown.find(
                campaign => `${campaign.value}` === `${newCampaignid}`,
            );
            setSelectedCampaign(selected?.original);
        },
        [campaignsDropdown],
    );
    // API form validation
    const {
        apiErrors,
        payload,
        mutation: save,
    } = useApiErrorValidation<Partial<SaveProccessQuery>, any>({
        mutationFn: saveProcess,
        onSuccess: () => {
            closeDialog();
        },
    });

    // Form validation
    const schema = useProcessValidation(apiErrors, payload);

    // Formik
    const formik = useFormik({
        initialValues: {
            rounds: [],
            teams: [],
        },
        enableReinitialize: true,
        validateOnBlur: false,
        validationSchema: schema,
        onSubmit: save,
    });
    const {
        values,
        setFieldValue,
        touched,
        setFieldTouched,
        errors,
        isValid,
        initialValues,
        handleSubmit,
        resetForm,
    } = formik;
    const getErrors = useTranslatedErrors({
        errors,
        formatMessage,
        touched,
        messages: MESSAGES,
    });

    const roundsOptions = useMemo(
        () =>
            selectedCampaign?.rounds.map(round => ({
                label: `${formatMessage(MESSAGES.round)} ${round.number}`,
                value: round.id,
            })) || [],
        [formatMessage, selectedCampaign?.rounds],
    );

    const onChange = useCallback(
        (keyValue, value) => {
            setFieldValue(keyValue, value);
            setFieldTouched(keyValue, true);
        },
        [setFieldTouched, setFieldValue],
    );
    return (
        <ConfirmCancelModal
            titleMessage={titleMessage}
            onConfirm={() => handleSubmit()}
            maxWidth="xs"
            closeDialog={() => null}
            open={isOpen}
            cancelMessage={MESSAGES.cancel}
            confirmMessage={MESSAGES.save}
            id="process-dialog"
            dataTestId="process-dialog"
            allowConfirm={isValid && !isEqual(values, initialValues)}
            onClose={() => null}
            onCancel={() => {
                resetForm();
                closeDialog();
            }}
        >
            <InputComponent
                type="select"
                keyValue="country"
                loading={isFetchingCountries}
                onChange={(_, value) => setSelectedCountryId(value)}
                value={selectedCountryId}
                label={MESSAGES.country}
                options={countriesList}
                required
                clearable={false}
            />
            <InputWithInfos
                infos={formatMessage(MESSAGES.processCampaignInfos)}
            >
                <InputComponent
                    type="select"
                    keyValue="campaign"
                    loading={isFetchingCampaigns}
                    onChange={handleChangeCampaign}
                    value={selectedCampaign?.obr_name}
                    label={MESSAGES.campaign}
                    options={campaignsDropdown}
                    required
                    clearable={false}
                    disabled={!selectedCountryId}
                />
            </InputWithInfos>
            <InputWithInfos
                infos={formatMessage(MESSAGES.processCampaignInfos)}
            >
                <InputComponent
                    type="select"
                    keyValue="rounds"
                    multi
                    loading={false}
                    onChange={(key, newValue) =>
                        onChange(key, commaSeparatedIdsToArray(newValue))
                    }
                    value={values.rounds}
                    label={MESSAGES.rounds}
                    options={roundsOptions}
                    required
                    clearable={false}
                    errors={getErrors('rounds')}
                    disabled={!selectedCountryId || !selectedCampaign}
                />
            </InputWithInfos>
        </ConfirmCancelModal>
    );
};

const modalWithButton = makeFullModal(ProcessDialog, AddButton);

export { modalWithButton as AddProcessDialog };
