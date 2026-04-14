import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import type { KanbanCard, KanbanColumn, KanbanCardDialogField } from './types';
import './KanbanBoard.module.css';

const meta: Meta<typeof KanbanBoard> = {
  title: 'Components/KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

// Sample data
const sampleCards: KanbanCard[] = [
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

const sampleColumns: KanbanColumn[] = [
  { key: 'todo', headerText: 'To Do', maxItems: 5 },
  { key: 'inprogress', headerText: 'In Progress', maxItems: 3 },
  { key: 'review', headerText: 'Review', maxItems: 2 },
  { key: 'done', headerText: 'Done' },
];

const dialogFields: KanbanCardDialogField[] = [
  { key: 'title', label: 'Title', type: 'TextBox', required: true },
  { key: 'summary', label: 'Description', type: 'TextArea' },
  { key: 'assignee', label: 'Assignee', type: 'DropDown', options: [
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'Bob Johnson', label: 'Bob Johnson' },
    { value: 'Alice Williams', label: 'Alice Williams' },
  ]},
  { key: 'priority', label: 'Priority', type: 'DropDown', options: [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ]},
  { key: 'tags', label: 'Tags', type: 'Tags', placeholder: 'Enter tags separated by commas' },
];

// Interactive wrapper for stories with state
const InteractiveKanban = (props: Parameters<typeof KanbanBoard>[0]) => {
  const [cards, setCards] = useState(props.cards);

  const handleCardDrop = (card: KanbanCard, targetColumnKey: string) => {
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === card.id ? { ...c, status: targetColumnKey } : c
      )
    );
  };

  const handleCardSave = (updatedCard: KanbanCard) => {
    setCards(prevCards =>
      prevCards.map(c => (c.id === updatedCard.id ? updatedCard : c))
    );
  };

  const handleCardDelete = (cardId: string | number) => {
    setCards(prevCards => prevCards.filter(c => c.id !== cardId));
  };

  return (
    <KanbanBoard
      {...props}
      cards={cards}
      onCardDrop={handleCardDrop}
      onCardSave={handleCardSave}
      onCardDelete={handleCardDelete}
    />
  );
};

// Stories
export const Basic: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns,
  },
};

export const WithDragAndDrop: Story = {
  render: (args) => <InteractiveKanban {...args} />,
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    allowDragAndDrop: true,
  },
};

export const WithSwimlanes: Story = {
  render: (args) => <InteractiveKanban {...args} />,
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    allowDragAndDrop: true,
    swimlaneSettings: {
      keyField: 'assignee',
    },
  },
};

export const WithCustomSwimlaneLabels: Story = {
  render: (args) => <InteractiveKanban {...args} />,
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

export const WithColumnToggle: Story = {
  render: (args) => <InteractiveKanban {...args} />,
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    allowColumnToggle: true,
  },
};

export const WithSingleSelection: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    selectionMode: 'Single',
    onSelectionChange: (selected) => {
      console.log('Selected:', selected);
    },
  },
};

export const WithMultipleSelection: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    selectionMode: 'Multiple',
    onSelectionChange: (selected) => {
      console.log('Selected:', selected);
    },
  },
};

export const WithTooltips: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    enableTooltip: true,
  },
};

export const WithDialogEditing: Story = {
  render: (args) => <InteractiveKanban {...args} />,
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    dialogFields,
  },
};

export const WithCustomCardTemplate: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    cardTemplate: (card) => (
      <div style={{ padding: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          {card.title}
        </h4>
        {card.summary && (
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
            {card.summary}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '11px', 
            padding: '2px 8px', 
            borderRadius: '12px',
            backgroundColor: card.priority === 'Critical' ? '#fee' : '#eef',
            color: card.priority === 'Critical' ? '#c00' : '#06c',
          }}>
            {card.priority}
          </span>
          <span style={{ fontSize: '11px', color: '#999' }}>
            {card.assignee}
          </span>
        </div>
      </div>
    ),
  },
};

export const WithCustomColumnHeader: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns.map(col => ({
      ...col,
      headerTemplate: (column) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
        }}>
          <span style={{ fontWeight: 600 }}>{column.headerText}</span>
          <button
            onClick={() => alert(`Add card to ${column.headerText}`)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Add
          </button>
        </div>
      ),
    })),
  },
};

export const WithWIPLimits: Story = {
  render: (args) => <InteractiveKanban {...args} />,
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    allowDragAndDrop: true,
  },
};

export const EmptyBoard: Story = {
  args: {
    cards: [],
    columns: sampleColumns,
  },
};

export const SingleColumn: Story = {
  args: {
    cards: sampleCards.map(card => ({ ...card, status: 'todo' })),
    columns: [{ key: 'todo', headerText: 'Backlog' }],
  },
};

export const ManyCards: Story = {
  args: {
    cards: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      status: ['todo', 'inprogress', 'review', 'done'][i % 4] as string,
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

export const FullFeatured: Story = {
  render: (args) => <InteractiveKanban {...args} />,
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

export const CustomDimensions: Story = {
  args: {
    cards: sampleCards,
    columns: sampleColumns,
    height: 600,
    width: '100%',
  },
};

export const WithPriorityColors: Story = {
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

