import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import './KanbanBoard.module.css';
const meta = {
    title: 'Components/KanbanBoard',
    component: KanbanBoard,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};
export default meta;
// Sample data
const sampleCards = [
    {
        id: 1,
        status: 'todo',
        title: 'Implement user authentication',
        summary: 'Add login and registration functionality',
        tags: ['feature', 'high-priority'],
        assignee: 'John Doe',
        priority: 'High',
        rank: 1,
    },
    {
        id: 2,
        status: 'todo',
        title: 'Fix bug in payment processing',
        summary: 'Payment fails for international cards',
        tags: ['bug', 'urgent'],
        assignee: 'Jane Smith',
        priority: 'Critical',
        rank: 2,
    },
    {
        id: 3,
        status: 'inprogress',
        title: 'Design new landing page',
        summary: 'Create modern landing page design',
        tags: ['design', 'marketing'],
        assignee: 'Bob Johnson',
        priority: 'Medium',
        rank: 1,
    },
    {
        id: 4,
        status: 'inprogress',
        title: 'Optimize database queries',
        summary: 'Improve query performance for reports',
        tags: ['performance', 'backend'],
        assignee: 'Alice Williams',
        priority: 'High',
        rank: 2,
    },
    {
        id: 5,
        status: 'review',
        title: 'Update documentation',
        summary: 'Update API documentation with new endpoints',
        tags: ['documentation'],
        assignee: 'Charlie Brown',
        priority: 'Low',
        rank: 1,
    },
    {
        id: 6,
        status: 'done',
        title: 'Setup CI/CD pipeline',
        summary: 'Configure GitHub Actions for automated deployment',
        tags: ['devops', 'automation'],
        assignee: 'David Lee',
        priority: 'High',
        rank: 1,
    },
    {
        id: 7,
        status: 'done',
        title: 'Implement dark mode',
        summary: 'Add dark theme support to application',
        tags: ['feature', 'ui'],
        assignee: 'Eva Martinez',
        priority: 'Medium',
        rank: 2,
    },
];
const sampleColumns = [
    { key: 'todo', headerText: 'To Do', maxItems: 5 },
    { key: 'inprogress', headerText: 'In Progress', maxItems: 3 },
    { key: 'review', headerText: 'Review', maxItems: 2 },
    { key: 'done', headerText: 'Done' },
];
const dialogFields = [
    { key: 'title', label: 'Title', type: 'TextBox', required: true },
    { key: 'summary', label: 'Description', type: 'TextArea' },
    { key: 'assignee', label: 'Assignee', type: 'DropDown', options: [
            { value: 'John Doe', label: 'John Doe' },
            { value: 'Jane Smith', label: 'Jane Smith' },
            { value: 'Bob Johnson', label: 'Bob Johnson' },
            { value: 'Alice Williams', label: 'Alice Williams' },
        ] },
    { key: 'priority', label: 'Priority', type: 'DropDown', options: [
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
        ] },
    { key: 'tags', label: 'Tags', type: 'Tags', placeholder: 'Enter tags separated by commas' },
];
// Interactive wrapper for stories with state
const InteractiveKanban = (props) => {
    const [cards, setCards] = useState(props.cards);
    const handleCardDrop = (card, targetColumnKey) => {
        setCards(prevCards => prevCards.map(c => c.id === card.id ? { ...c, status: targetColumnKey } : c));
    };
    const handleCardSave = (updatedCard) => {
        setCards(prevCards => prevCards.map(c => (c.id === updatedCard.id ? updatedCard : c)));
    };
    const handleCardDelete = (cardId) => {
        setCards(prevCards => prevCards.filter(c => c.id !== cardId));
    };
    return (_jsx(KanbanBoard, { ...props, cards: cards, onCardDrop: handleCardDrop, onCardSave: handleCardSave, onCardDelete: handleCardDelete }));
};
// Stories
export const Basic = {
    args: {
        cards: sampleCards,
        columns: sampleColumns,
    },
};
export const WithDragAndDrop = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        allowDragAndDrop: true,
    },
};
export const WithSwimlanes = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        allowDragAndDrop: true,
        swimlaneSettings: {
            keyField: 'assignee',
        },
    },
};
export const WithCustomSwimlaneLabels = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        allowDragAndDrop: true,
        swimlaneSettings: {
            keyField: 'assignee',
            labelTemplate: (value) => `👤 ${value || 'Unassigned'}`,
        },
    },
};
export const WithColumnToggle = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        allowColumnToggle: true,
    },
};
export const WithSingleSelection = {
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        selectionMode: 'Single',
        onSelectionChange: (selected) => {
            console.log('Selected:', selected);
        },
    },
};
export const WithMultipleSelection = {
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        selectionMode: 'Multiple',
        onSelectionChange: (selected) => {
            console.log('Selected:', selected);
        },
    },
};
export const WithTooltips = {
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        enableTooltip: true,
    },
};
export const WithDialogEditing = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        dialogFields,
    },
};
export const WithCustomCardTemplate = {
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        cardTemplate: (card) => (_jsxs("div", { style: { padding: '12px' }, children: [_jsx("h4", { style: { margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }, children: card.title }), card.summary && (_jsx("p", { style: { margin: '0 0 8px 0', fontSize: '12px', color: '#666' }, children: card.summary })), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("span", { style: {
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: card.priority === 'Critical' ? '#fee' : '#eef',
                                color: card.priority === 'Critical' ? '#c00' : '#06c',
                            }, children: card.priority }), _jsx("span", { style: { fontSize: '11px', color: '#999' }, children: card.assignee })] })] })),
    },
};
export const WithCustomColumnHeader = {
    args: {
        cards: sampleCards,
        columns: sampleColumns.map(col => ({
            ...col,
            headerTemplate: (column) => (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                }, children: [_jsx("span", { style: { fontWeight: 600 }, children: column.headerText }), _jsx("button", { onClick: () => alert(`Add card to ${column.headerText}`), style: {
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#0066cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }, children: "+ Add" })] })),
        })),
    },
};
export const WithWIPLimits = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        allowDragAndDrop: true,
    },
};
export const EmptyBoard = {
    args: {
        cards: [],
        columns: sampleColumns,
    },
};
export const SingleColumn = {
    args: {
        cards: sampleCards.map(card => ({ ...card, status: 'todo' })),
        columns: [{ key: 'todo', headerText: 'Backlog' }],
    },
};
export const ManyCards = {
    args: {
        cards: Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            status: ['todo', 'inprogress', 'review', 'done'][i % 4],
            title: `Task ${i + 1}`,
            summary: `Description for task ${i + 1}`,
            tags: ['tag1', 'tag2'],
            assignee: ['John', 'Jane', 'Bob', 'Alice'][i % 4],
            priority: ['Low', 'Medium', 'High', 'Critical'][i % 4],
        })),
        columns: sampleColumns,
        allowDragAndDrop: true,
    },
};
export const FullFeatured = {
    render: (args) => _jsx(InteractiveKanban, { ...args }),
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        allowDragAndDrop: true,
        allowColumnToggle: true,
        selectionMode: 'Multiple',
        enableTooltip: true,
        dialogFields,
        swimlaneSettings: {
            keyField: 'assignee',
        },
        onCardClick: (card) => console.log('Card clicked:', card),
        onColumnToggle: (key, collapsed) => console.log('Column toggled:', key, collapsed),
    },
};
export const CustomDimensions = {
    args: {
        cards: sampleCards,
        columns: sampleColumns,
        height: 600,
        width: '100%',
    },
};
export const WithPriorityColors = {
    args: {
        cards: [
            ...sampleCards,
            { id: 8, status: 'todo', title: 'Critical Issue', priority: 'Critical', summary: 'Needs immediate attention' },
            { id: 9, status: 'todo', title: 'High Priority', priority: 'High', summary: 'Important task' },
            { id: 10, status: 'todo', title: 'Medium Priority', priority: 'Medium', summary: 'Normal task' },
            { id: 11, status: 'todo', title: 'Low Priority', priority: 'Low', summary: 'Can wait' },
        ],
        columns: sampleColumns,
    },
};
//# sourceMappingURL=KanbanBoard.stories.js.map