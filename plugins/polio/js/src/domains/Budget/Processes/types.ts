import { Nullable } from '../../../../../../../hat/assets/js/apps/Iaso/types/utils';
import {
    BudgetStatusDeprecated,
    PaymentMode,
    ResponsibleLevel,
    Round,
} from '../../../constants/types';

/* eslint-disable camelcase */

export type BudgetProcess = {
    id: number;
    created_at: number;
    updated_at: number;
    budget_status: Nullable<BudgetStatusDeprecated>;
    budget_responsible: Nullable<ResponsibleLevel>;
    rounds: Round[];
    teams: number[];
    budget_current_state_key: string;
    budget_current_state_label: Nullable<string>;
    budget_status_at_WFEDITABLE?: string;
    rounds_at_WFEDITABLE: Nullable<string>; // date
    ra_completed_at_WFEDITABLE: Nullable<string>; // date
    who_sent_budget_at_WFEDITABLE: Nullable<string>; // date
    unicef_sent_budget_at_WFEDITABLE: Nullable<string>; // date
    gpei_consolidated_budgets_at_WFEDITABLE: Nullable<string>; // date
    submitted_to_rrt_at_WFEDITABLE: Nullable<string>; // date
    feedback_sent_to_gpei_at_WFEDITABLE: Nullable<string>; // date
    re_submitted_to_rrt_at_WFEDITABLE: Nullable<string>; // date
    submitted_to_orpg_operations1_at_WFEDITABLE: Nullable<string>; // date
    feedback_sent_to_rrt1_at_WFEDITABLE: Nullable<string>; // date
    submitted_to_orpg_wider_at_WFEDITABLE: Nullable<string>; // date
    feedback_sent_to_rrt2_at_WFEDITABLE: Nullable<string>; // date
    submitted_to_orpg_operations2_at_WFEDITABLE: Nullable<string>; // date
    re_submitted_to_orpg_operations1_at_WFEDITABLE: Nullable<string>; // date
    re_submitted_to_orpg_operations2_at_WFEDITABLE: Nullable<string>; // date
    submitted_for_approval_at_WFEDITABLE: Nullable<string>; // date
    feedback_sent_to_orpg_operations_unicef_at_WFEDITABLE: Nullable<string>; // date
    feedback_sent_to_orpg_operations_who_at_WFEDITABLE: Nullable<string>; // date
    approved_by_who_at_WFEDITABLE: Nullable<string>; // date
    approved_by_unicef_at_WFEDITABLE: Nullable<string>; // date
    approved_at_WFEDITABLE: Nullable<string>; // date
    approval_confirmed_at_WFEDITABLE: Nullable<string>; // date
    payment_mode: Nullable<PaymentMode>;
    who_disbursed_to_co_at: Nullable<string>; // date
    who_disbursed_to_moh_at: Nullable<string>; // date
    unicef_disbursed_to_co_at: Nullable<string>; // date
    unicef_disbursed_to_moh_at: Nullable<string>; // date
    district_count: Nullable<number>;
    no_regret_fund_amount: Nullable<number>; // decimal
};
