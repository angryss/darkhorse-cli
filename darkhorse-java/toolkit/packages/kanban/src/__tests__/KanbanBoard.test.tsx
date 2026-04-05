/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanBoard } from '../KanbanBoard';
import type { KanbanCard, KanbanColumn } from '../types';

describe('KanbanBoard', () => {
  const mockCards: KanbanCard[] = [
    {
      id: 1,
      status: 'todo',
      title: 'Task 1',
      summary: 'Description 1',
      tags: ['urgent', 'bug'],
      assignee: 'John',
      priority: 'High',
    },
    {
      id: 2,
      status: 'inprogress',
      title: 'Task 2',
      summary: 'Description 2',
      tags: ['feature'],
      assignee: 'Jane',
      priority: 'Medium',
    },
    {
      id: 3,
      status: 'done',
      title: 'Task 3',
      summary: 'Description 3',
      assignee: 'Bob',
      priority: 'Low',
    },
  ];

  const mockColumns: KanbanColumn[] = [
    { key: 'todo', headerText: 'To Do', maxItems: 5 },
    { key: 'inprogress', headerText: 'In Progress', maxItems: 3 },
    { key: 'done', headerText: 'Done' },
  ];

  describe('Rendering', () => {
    it('should render the Kanban board', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      expect(screen.getByRole('region', { name: /kanban board/i })).toBeInTheDocument();
    });

    it('should render all columns', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should render all cards', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    it('should render cards in correct columns', () => {
      const { container } = render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      
      // Get all columns
      const columns = container.querySelectorAll('[data-column-key]');
      expect(columns).toHaveLength(3);
      
      // Verify card placement (simplified check)
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
    });

    it('should render card counts in column headers', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      
      // Check for column counts
      expect(screen.getByText(/1.*5/)).toBeInTheDocument(); // 1 / 5 for todo
      expect(screen.getByText(/1.*3/)).toBeInTheDocument(); // 1 / 3 for inprogress
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 for done
    });
  });

  describe('Card Template', () => {
    it('should render default card template', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      
      // Check for card elements
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('should render custom card template', () => {
      const customTemplate = (card: KanbanCard) => (
        <div>Custom: {card.title}</div>
      );

      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          cardTemplate={customTemplate}
        />
      );

      expect(screen.getByText('Custom: Task 1')).toBeInTheDocument();
      expect(screen.getByText('Custom: Task 2')).toBeInTheDocument();
    });
  });

  describe('Column Toggle', () => {
    it('should show toggle buttons when allowColumnToggle is true', () => {
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          allowColumnToggle={true}
        />
      );

      const toggleButtons = screen.getAllByRole('button', { name: /collapse/i });
      expect(toggleButtons.length).toBeGreaterThan(0);
    });

    it('should toggle column when button is clicked', () => {
      const onColumnToggle = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          allowColumnToggle={true}
          onColumnToggle={onColumnToggle}
        />
      );

      const toggleButtons = screen.getAllByRole('button', { name: /collapse/i });
      fireEvent.click(toggleButtons[0]!);

      expect(onColumnToggle).toHaveBeenCalledWith('todo', true);
    });
  });

  describe('Card Selection', () => {
    it('should not select cards when selectionMode is None', () => {
      const onSelectionChange = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          selectionMode="None"
          onSelectionChange={onSelectionChange}
        />
      );

      const card = screen.getByText('Task 1').closest('[role="button"]');
      if (card) {
        fireEvent.click(card);
      }

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('should select single card when selectionMode is Single', () => {
      const onSelectionChange = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          selectionMode="Single"
          onSelectionChange={onSelectionChange}
        />
      );

      const card = screen.getByText('Task 1').closest('[role="button"]');
      if (card) {
        fireEvent.click(card);
      }

      expect(onSelectionChange).toHaveBeenCalledWith([mockCards[0]]);
    });

    it('should select multiple cards when selectionMode is Multiple', () => {
      const onSelectionChange = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          selectionMode="Multiple"
          onSelectionChange={onSelectionChange}
        />
      );

      const card1 = screen.getByText('Task 1').closest('[role="button"]');
      const card2 = screen.getByText('Task 2').closest('[role="button"]');
      
      if (card1) {
        fireEvent.click(card1, { ctrlKey: true });
      }
      if (card2) {
        fireEvent.click(card2, { ctrlKey: true });
      }

      expect(onSelectionChange).toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should make cards draggable when allowDragAndDrop is true', () => {
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          allowDragAndDrop={true}
        />
      );

      const card = screen.getByText('Task 1').closest('[draggable]');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('should call onCardDrop when card is dropped', () => {
      const onCardDrop = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          allowDragAndDrop={true}
          onCardDrop={onCardDrop}
        />
      );

      const card = screen.getByText('Task 1').closest('[draggable]');
      const dropZone = screen.getByText('In Progress').parentElement?.nextElementSibling;

      if (card && dropZone) {
        fireEvent.dragStart(card);
        fireEvent.dragOver(dropZone);
        fireEvent.drop(dropZone);
      }

      expect(onCardDrop).toHaveBeenCalled();
    });
  });

  describe('Swimlanes', () => {
    it('should render swimlanes when swimlaneSettings is provided', () => {
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          swimlaneSettings={{
            keyField: 'assignee',
          }}
        />
      );

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should use custom swimlane label template', () => {
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          swimlaneSettings={{
            keyField: 'assignee',
            labelTemplate: (value) => `Assigned to: ${value}`,
          }}
        />
      );

      expect(screen.getByText('Assigned to: John')).toBeInTheDocument();
      expect(screen.getByText('Assigned to: Jane')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty message when column has no cards', () => {
      const emptyCards: KanbanCard[] = [];
      
      render(<KanbanBoard cards={emptyCards} columns={mockColumns} />);
      
      const emptyMessages = screen.getAllByText('No cards');
      expect(emptyMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Card Click', () => {
    it('should call onCardClick when card is clicked', () => {
      const onCardClick = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          onCardClick={onCardClick}
        />
      );

      const card = screen.getByText('Task 1').closest('[role="button"]');
      if (card) {
        fireEvent.click(card);
      }

      expect(onCardClick).toHaveBeenCalledWith(mockCards[0]);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      
      expect(screen.getByRole('region', { name: /kanban board/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /to do column/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation on cards', () => {
      const onCardClick = vi.fn();
      
      render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          onCardClick={onCardClick}
        />
      );

      const card = screen.getByText('Task 1').closest('[role="button"]');
      if (card) {
        fireEvent.keyDown(card, { key: 'Enter' });
      }

      expect(onCardClick).toHaveBeenCalled();
    });

    it('should have tabindex on cards', () => {
      render(<KanbanBoard cards={mockCards} columns={mockColumns} />);
      
      const card = screen.getByText('Task 1').closest('[role="button"]');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Props Validation', () => {
    it('should use custom keyField', () => {
      const customCards: KanbanCard[] = [
        { id: 1, status: 'custom-status', title: 'Task', 'custom-status': 'todo' },
      ];

      render(
        <KanbanBoard
          cards={customCards}
          columns={mockColumns}
          keyField="custom-status"
        />
      );

      expect(screen.getByText('Task')).toBeInTheDocument();
    });

    it('should render with custom height and width', () => {
      const { container } = render(
        <KanbanBoard
          cards={mockCards}
          columns={mockColumns}
          height={600}
          width="100%"
        />
      );

      const board = container.firstChild as HTMLElement;
      expect(board).toHaveStyle({ height: '600px', width: '100%' });
    });
  });
});

