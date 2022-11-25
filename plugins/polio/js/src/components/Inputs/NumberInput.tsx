import { get } from 'lodash';
import React, { FunctionComponent } from 'react';
import InputComponent from '../../../../../../hat/assets/js/apps/Iaso/components/forms/InputComponent';

type Props = {
    label: string;
    field: Record<string, any>;
    form: Record<string, any>;
    min?: number;
    max?: number;
};

// TODO add errors
export const NumberInput: FunctionComponent<Props> = ({
    label,
    field,
    form,
    min,
    max,
}) => {
    const hasError =
        form.errors &&
        Boolean(get(form.errors, field.name) && get(form.touched, field.name));

    return (
        <InputComponent
            withMarginTop={false}
            keyValue={field.name}
            type="number"
            value={field.value}
            labelString={label}
            onChange={(_keyValue, value) => {
                form.setFieldTouched(field.name, true);
                form.setFieldValue(field.name, value);
            }}
            min={min}
            max={max}
            markThousands
            errors={hasError ? [get(form.errors, field.name)] : undefined}
        />
    );
};
