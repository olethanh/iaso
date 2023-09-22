import React from 'react';
import { Column, useSafeIntl } from 'bluesquare-components';
import MESSAGES from '../messages';
import { LinkToOrgUnit } from '../../orgUnits/components/LinkToOrgUnit';
import { DateCell } from '../../../components/Cells/DateTimeCell';
import DeleteDialog from '../../../components/dialogs/DeleteDialogComponent';
import { useDeleteStockMovement } from './requests/useDeleteStockMovement';

export const useGetMovementsColumns = (): Array<Column> => {
    const { formatMessage } = useSafeIntl();
    const { mutate: deleteMovement } = useDeleteStockMovement();
    return [
        {
            Header: formatMessage(MESSAGES.org_unit),
            id: 'org_unit',
            accessor: 'org_unit',
            Cell: settings => (
                <LinkToOrgUnit orgUnit={settings.row.original.org_unit} />
            ),
        },
        {
            Header: formatMessage(MESSAGES.stockItem),
            id: 'stock_item',
            accessor: 'stock_item',
            Cell: settings => <>{settings.row.original.stock_item.name}</>,
        },
        {
            Header: formatMessage(MESSAGES.quantity),
            id: 'quantity',
            accessor: 'quantity',
            Cell: settings => {
                const { quantity } = settings.row.original;
                return <>{quantity > 0 ? `+${quantity}` : quantity}</>;
            },
        },
        {
            Header: formatMessage(MESSAGES.created_at),
            id: 'creation_date',
            accessor: 'creation_date',
            Cell: DateCell,
        },
        {
            Header: formatMessage(MESSAGES.actions),
            accessor: 'actions',
            resizable: false,
            sortable: false,
            Cell: settings => {
                return (
                    <DeleteDialog
                        keyName="stockMovement"
                        titleMessage={MESSAGES.delete}
                        onConfirm={() =>
                            deleteMovement(settings.row.original.id)
                        }
                    />
                );
            },
        },
    ];
};