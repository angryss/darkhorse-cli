import { jsx as _jsx } from "react/jsx-runtime";
import { WeekView } from './WeekView';
/**
 * WorkWeekView is essentially WeekView filtered to work days
 * The filtering logic is handled by the parent Scheduler component
 * or by using the workDays prop
 */
export const WorkWeekView = (props) => {
    // Use WeekView with workDays prop
    // The workDays prop defaults to [1,2,3,4,5] (Monday-Friday)
    // which will be used to determine which days to display and style
    return _jsx(WeekView, { ...props });
};
WorkWeekView.displayName = 'WorkWeekView';
//# sourceMappingURL=WorkWeekView.js.map