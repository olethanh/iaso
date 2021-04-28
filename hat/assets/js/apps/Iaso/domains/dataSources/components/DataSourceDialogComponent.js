import React, { Component } from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { Grid, Box } from '@material-ui/core';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';

import {
    createDataSource,
    updateDataSource,
    updateDefaultSource,
} from '../../../utils/requests';
import ConfirmCancelDialogComponent from '../../../components/dialogs/ConfirmCancelDialogComponent';
import InputComponent from '../../../components/forms/InputComponent';
import { enqueueSnackbar } from '../../../redux/snackBarsReducer';
import { succesfullSnackBar } from '../../../constants/snackBars';

import { setIsLoading } from '../actions';
import { fetchCurrentUser } from '../../users/actions';
import MESSAGES from '../messages';
import { commaSeparatedIdsToArray } from '../../../utils/forms';
import { EditableTextFields } from '../../../components/forms/EditableTextFields';

export class DataSourceDialogComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDataTouched: false,
            form: this.inititalForm(),
            hasConfirmed: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (
            !isEqual(prevProps.initialData, this.props.initialData) ||
            !isEqual(
                prevProps.defaultSourceVersion,
                this.props.defaultSourceVersion,
            )
        ) {
            this.setInitialState();
        }
    }

    onConfirm(closeDialog) {
        const { dispatch, initialData, onSuccess, currentUser } = this.props;
        const { form } = this.state;
        let saveCurrentDataSource;
        const currentDataSource = {};
        Object.keys(form).forEach(key => {
            if (key !== 'is_default_source') {
                currentDataSource[key] = form[key].value;
            }
        });
        this.setState({ hasConfirmed: true });
        currentDataSource.credentials = {
            dhis_name: currentDataSource.dhis_name,
            dhis_login: currentDataSource.dhis_login,
            dhis_url: currentDataSource.dhis_url,
            dhis_password: currentDataSource.dhis_password,
        };
        delete currentDataSource.dhis_name;
        delete currentDataSource.dhis_login;
        delete currentDataSource.dhis_url;
        delete currentDataSource.dhis_password;
        if (initialData === null) {
            saveCurrentDataSource = createDataSource(
                dispatch,
                currentDataSource,
            );
        } else {
            saveCurrentDataSource = updateDataSource(
                dispatch,
                form.id.value,
                currentDataSource,
            );
        }
        dispatch(setIsLoading(true));

        const onSuccesfullUpdate = () => {
            closeDialog();
            dispatch(enqueueSnackbar(succesfullSnackBar()));
            onSuccess();
            this.setState({ hasConfirmed: false });
        };

        return saveCurrentDataSource
            .then(() => {
                if (
                    form.is_default_source.value &&
                    currentUser &&
                    form.default_version_id.value
                ) {
                    updateDefaultSource(
                        dispatch,
                        currentUser.account.id,
                        form.default_version_id.value,
                    ).then(() => {
                        dispatch(fetchCurrentUser()).then(() => {
                            onSuccesfullUpdate();
                        });
                    });
                } else {
                    onSuccesfullUpdate();
                }
            })
            .catch(error => {
                dispatch(setIsLoading(false));
                this.setState({ hasConfirmed: false });
                if (error.status === 400) {
                    Object.entries(error.details).forEach(
                        ([errorKey, errorMessages]) => {
                            this.setFieldErrors(errorKey, errorMessages);
                        },
                    );
                }
            });
    }

    setFieldValue(fieldName, fieldValue) {
        const { form } = this.state;
        const newForm = {
            ...form,
            [fieldName]: { value: fieldValue, errors: [] },
        };
        const isDataTouched = !isEqual(this.inititalForm(), newForm);
        this.setState({
            form: newForm,
            isDataTouched,
        });
    }

    setFieldErrors(fieldName, fieldErrors) {
        this.setState({
            form: {
                ...this.state.form,
                [fieldName]: {
                    value: this.state[fieldName].value,
                    errors: fieldErrors,
                },
            },
        });
    }

    inititalForm() {
        const { defaultSourceVersion } = this.props;
        const initialData = this.props.initialData
            ? this.props.initialData
            : {};
        const isDefaultSource =
            initialData &&
            defaultSourceVersion &&
            defaultSourceVersion.source &&
            defaultSourceVersion.source.id === initialData.id;
        let defaultVersionId = null;
        const defaultVersion = get(initialData, 'default_version', null);
        if (defaultVersion) {
            defaultVersionId = defaultVersion.id;
        }
        return {
            id: { value: get(initialData, 'id', null), errors: [] },
            name: { value: get(initialData, 'name', ''), errors: [] },
            read_only: {
                value: get(initialData, 'read_only', false),
                errors: [],
            },
            versions: {
                value: get(initialData, 'versions', []),
                errors: [],
            },
            description: {
                value: get(initialData, 'description', ''),
                errors: [],
            },
            project_ids: {
                value: get(initialData, 'projects', []).map(p => p.id),
                errors: [],
            },
            default_version_id: {
                value: defaultVersionId,
                errors: [],
            },
            is_default_source: {
                value: isDefaultSource,
                errors: [],
            },
            dhis_name: {
                value: this.props.sourceCredentials.name
                    ? this.props.sourceCredentials.name
                    : '',
                errors: [],
            },
            dhis_url: {
                value: this.props.sourceCredentials.url
                    ? this.props.sourceCredentials.url
                    : '',
                errors: [],
            },
            dhis_login: {
                value: this.props.sourceCredentials.login
                    ? this.props.sourceCredentials.login
                    : '',
                errors: [],
            },
            dhis_password: {
                value: '',
                errors: [],
            },
        };
    }

    setInitialState() {
        this.setState({
            isDataTouched: false,
            form: this.inititalForm(),
        });
    }

    render() {
        const {
            renderTrigger,
            projects,
            titleMessage,
            initialData,
        } = this.props;
        const { form, isDataTouched, hasConfirmed } = this.state;
        let allowConfirm = isDataTouched;
        if (
            (form.is_default_source.value && !form.default_version_id.value) ||
            hasConfirmed
        ) {
            allowConfirm = false;
        }
        return (
            <ConfirmCancelDialogComponent
                renderTrigger={renderTrigger}
                titleMessage={titleMessage}
                onConfirm={closeDialog => this.onConfirm(closeDialog)}
                onClosed={() => this.setInitialState()}
                confirmMessage={MESSAGES.save}
                cancelMessage={MESSAGES.cancel}
                maxWidth="md"
                allowConfirm={allowConfirm}
            >
                <Grid container spacing={4} justify="flex-start">
                    <Grid xs={6} item>
                        <InputComponent
                            keyValue="name"
                            onChange={(key, value) =>
                                this.setFieldValue(key, value)
                            }
                            value={form.name.value}
                            errors={form.name.errors}
                            type="text"
                            label={MESSAGES.dataSourceName}
                            required
                        />

                        <InputComponent
                            keyValue="description"
                            onChange={(key, value) => {
                                this.setFieldValue(key, value);
                            }}
                            value={form.description.value}
                            errors={form.description.errors}
                            type="text"
                            label={MESSAGES.dataSourceDescription}
                            multiline
                        />
                        <InputComponent
                            multi
                            clearable
                            keyValue="project_ids"
                            onChange={(key, value) =>
                                this.setFieldValue(
                                    key,
                                    commaSeparatedIdsToArray(value),
                                )
                            }
                            value={form.project_ids.value.join(',')}
                            errors={form.project_ids.errors}
                            type="select"
                            options={projects.map(p => ({
                                label: p.name,
                                value: p.id,
                            }))}
                            label={MESSAGES.projects}
                        />
                        {form.id.value && (
                            <InputComponent
                                multi={false}
                                clearable={!form.is_default_source.value}
                                keyValue="default_version_id"
                                onChange={(key, value) =>
                                    this.setFieldValue(key, value)
                                }
                                value={form.default_version_id.value}
                                errors={form.default_version_id.errors}
                                type="select"
                                options={
                                    initialData
                                        ? initialData.versions.map(v => ({
                                              label: v.number,
                                              value: v.id,
                                          }))
                                        : []
                                }
                                label={MESSAGES.defaultVersion}
                            />
                        )}
                        <Box>
                            <InputComponent
                                keyValue="read_only"
                                onChange={(key, value) =>
                                    this.setFieldValue(key, value)
                                }
                                value={form.read_only.value}
                                errors={form.read_only.errors}
                                type="checkbox"
                                label={MESSAGES.dataSourceReadOnly}
                            />
                        </Box>
                        {form.id.value && (
                            <Box>
                                <InputComponent
                                    keyValue="is_default_source"
                                    disabled={
                                        form.is_default_source.value &&
                                        !isDataTouched
                                    }
                                    onChange={(key, value) =>
                                        this.setFieldValue(key, value)
                                    }
                                    value={form.is_default_source.value}
                                    errors={form.is_default_source.errors}
                                    type="checkbox"
                                    label={MESSAGES.defaultSource}
                                />
                            </Box>
                        )}
                    </Grid>
                    <Grid xs={6} item>
                        <EditableTextFields
                            fields={[
                                {
                                    value: form.dhis_name.value,
                                    keyValue: 'dhis_name',
                                    errors: form.dhis_name.errors,
                                    label: MESSAGES.dhisName,
                                    onChange: (key, value) => {
                                        this.setFieldValue(key, value);
                                    },
                                },
                                {
                                    value: form.dhis_url.value,
                                    keyValue: 'dhis_url',
                                    errors: form.dhis_url.errors,
                                    label: MESSAGES.dhisUrl,
                                    onChange: (key, value) => {
                                        this.setFieldValue(key, value);
                                    },
                                },
                                {
                                    value: form.dhis_login.value,
                                    keyValue: 'dhis_login',
                                    errors: form.dhis_login.errors,
                                    label: MESSAGES.dhisLogin,
                                    onChange: (key, value) =>
                                        this.setFieldValue(key, value),
                                },
                                {
                                    value: form.dhis_password.value,
                                    keyValue: 'dhis_password',
                                    errors: form.dhis_password.errors,
                                    label: MESSAGES.dhisPassword,
                                    onChange: (key, value) =>
                                        this.setFieldValue(key, value),
                                    password: true,
                                },
                            ]}
                        />
                    </Grid>
                </Grid>
            </ConfirmCancelDialogComponent>
        );
    }
}
DataSourceDialogComponent.defaultProps = {
    initialData: null,
    defaultSourceVersion: null,
    currentUser: null,
    projects: [],
    sourceCredentials: {},
};
DataSourceDialogComponent.propTypes = {
    dispatch: PropTypes.func.isRequired,
    projects: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.arrayOf(PropTypes.object),
    ]),
    onSuccess: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    renderTrigger: PropTypes.func.isRequired,
    titleMessage: PropTypes.object.isRequired,
    currentUser: PropTypes.object,
    defaultSourceVersion: PropTypes.object,
    sourceCredentials: PropTypes.object,
};
const mapStateToProps = state => ({
    projects: state.projects.allProjects,
    currentUser: state.users.current,
});
const mapDispatchToProps = dispatch => ({ dispatch });
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DataSourceDialogComponent);
