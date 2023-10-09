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

import { Typography, makeStyles } from '@material-ui/core';
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
import { useSaveProcess, SaveProccessQuery } from './hooks/api/useSaveProcess';
import { useGetCampaigns } from '../../Campaigns/hooks/api/useGetCampaigns';
import { makeCampaignsDropDown } from '../../../utils';
import { Campaign } from '../../../constants/types';
import { useGetBudgetProcesses } from './hooks/api/useGetBudgetProcesses';
import { useGetProcessesRounds } from './hooks/useGetProcessesRounds';
import { useFormatRound } from './hooks/useFormatRound';

type Props = {
    titleMessage: IntlMessage;
    isOpen: boolean;
    closeDialog: () => void;
};

const useStyles = makeStyles(theme => ({
    warning: {
        color: theme.palette.warning.main,
        marginTop: theme.spacing(2),
    },
}));

const ProcessDialog: FunctionComponent<Props> = ({
    titleMessage,
    isOpen,
    closeDialog,
}) => {
    const { formatMessage } = useSafeIntl();
    const classes = useStyles();

    const [selectedCountryId, setSelectedCountryId] = useState<
        number | undefined
    >();
    const [selectedCampaign, setSelectedCampaign] = useState<
        Campaign | undefined
    >();

    const { data: countriesList, isFetching: isFetchingCountries } =
        useGetCountriesDropdown();
    const { data: campaignsList = [], isFetching: isFetchingCampaigns } =
        useGetCampaigns({
            countries: [`${selectedCountryId}`],
            enabled: Boolean(selectedCountryId),
        });

    const {
        data: existingProcesses = [],
        isFetching: isFetchingExistingProcesses,
    } = useGetBudgetProcesses({
        rounds: selectedCampaign?.rounds.map(round => round.id).join(','),
        enabled: Boolean(selectedCampaign),
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

    const schema = useProcessValidation(apiErrors, payload);

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
    const formatRound = useFormatRound();
    const roundsOptions = useMemo(
        () =>
            selectedCampaign?.rounds
                .filter(round => {
                    if (
                        existingProcesses.length === 0 &&
                        !isFetchingExistingProcesses
                    )
                        return true;
                    return !existingProcesses.some(process =>
                        process.rounds.map(r => r.id).includes(round.id),
                    );
                })
                .map(round => ({
                    label: formatRound(round.number),
                    value: round.id,
                })) || [],
        [
            existingProcesses,
            formatRound,
            isFetchingExistingProcesses,
            selectedCampaign?.rounds,
        ],
    );

    const onChange = useCallback(
        (keyValue, value) => {
            setFieldValue(keyValue, value);
            setFieldTouched(keyValue, true);
        },
        [setFieldTouched, setFieldValue],
    );

    const handleClose = useCallback(() => {
        resetForm();
        closeDialog();
    }, [closeDialog, resetForm]);

    const getProcessesRounds = useGetProcessesRounds();
    const processRounds = getProcessesRounds(existingProcesses);
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
            onClose={handleClose}
            onCancel={handleClose}
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
            {existingProcesses.length > 0 && (
                <Typography className={classes.warning}>
                    {`${processRounds} ${
                        existingProcesses.length === 1
                            ? formatMessage(MESSAGES.roundAlreadyUsed)
                            : formatMessage(MESSAGES.roundsAlreadyUsed)
                    }`}
                </Typography>
            )}
            <InputWithInfos infos={formatMessage(MESSAGES.processRoundInfos)}>
                <InputComponent
                    type="select"
                    keyValue="rounds"
                    multi
                    loading={isFetchingCampaigns || isFetchingExistingProcesses}
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
                {processRounds.split(',').length ===
                    selectedCampaign?.rounds.length && (
                    <Typography className={classes.warning}>
                        {formatMessage(MESSAGES.processRoundWarning)}
                    </Typography>
                )}
            </InputWithInfos>
        </ConfirmCancelModal>
    );
};

const modalWithButton = makeFullModal(ProcessDialog, AddButton);

export { modalWithButton as AddProcessDialog };
