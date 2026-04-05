import { jsx as _jsx } from "react/jsx-runtime";
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanbanCardDialog } from '../KanbanCardDialog';
describe('KanbanCardDialog', () => {
    const mockCard = {
        id: 1,
        status: 'todo',
        title: 'Task 1',
        summary: 'Description 1',
        tags: ['urgent', 'bug'],
        assignee: 'John',
        priority: 'High',
    };
    const mockFields = [
        { key: 'title', label: 'Title', type: 'TextBox', required: true },
        { key: 'summary', label: 'Description', type: 'TextArea' },
        { key: 'assignee', label: 'Assignee', type: 'DropDown', options: [
                { value: 'John', label: 'John' },
                { value: 'Jane', label: 'Jane' },
            ] },
        { key: 'tags', label: 'Tags', type: 'Tags' },
        { key: 'priority', label: 'Priority', type: 'DropDown', options: [
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
            ] },
    ];
    const defaultProps = {
        card: mockCard,
        fields: mockFields,
        open: true,
        onSave: vi.fn(),
        onDelete: vi.fn(),
        onClose: vi.fn(),
    };
    describe('Rendering', () => {
        it('should render dialog when open', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText('Edit Card')).toBeInTheDocument();
        });
        it('should not render when closed', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps, open: false }));
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
        it('should render all fields', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
        });
        it('should pre-populate fields with card data', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const titleInput = screen.getByLabelText(/title/i);
            const summaryInput = screen.getByLabelText(/description/i);
            expect(titleInput.value).toBe('Task 1');
            expect(summaryInput.value).toBe('Description 1');
        });
        it('should show required indicator for required fields', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const titleLabel = screen.getByText(/title/i).parentElement;
            expect(titleLabel).toHaveTextContent('*');
        });
    });
    describe('Field Types', () => {
        it('should render TextBox fields', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const input = screen.getByLabelText(/title/i);
            expect(input).toBeInstanceOf(HTMLInputElement);
            expect(input).toHaveAttribute('type', 'text');
        });
        it('should render TextArea fields', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const textarea = screen.getByLabelText(/description/i);
            expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
        });
        it('should render DropDown fields', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const select = screen.getByLabelText(/assignee/i);
            expect(select).toBeInstanceOf(HTMLSelectElement);
        });
        it('should render dropdown options', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const select = screen.getByLabelText(/assignee/i);
            const options = Array.from(select.options).map(opt => opt.value);
            expect(options).toContain('John');
            expect(options).toContain('Jane');
        });
        it('should render Tags field as text input', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const tagsInput = screen.getByLabelText(/tags/i);
            expect(tagsInput).toBeInstanceOf(HTMLInputElement);
            expect(tagsInput.value).toBe('urgent, bug');
        });
    });
    describe('Form Interaction', () => {
        it('should update field values on change', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: 'New Title' } });
            expect(titleInput.value).toBe('New Title');
        });
        it('should update textarea value', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const summaryInput = screen.getByLabelText(/description/i);
            fireEvent.change(summaryInput, { target: { value: 'New Description' } });
            expect(summaryInput.value).toBe('New Description');
        });
        it('should update dropdown value', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const select = screen.getByLabelText(/assignee/i);
            fireEvent.change(select, { target: { value: 'Jane' } });
            expect(select.value).toBe('Jane');
        });
    });
    describe('Validation', () => {
        it('should show error for empty required field', async () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: '' } });
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);
            await waitFor(() => {
                expect(screen.getByText(/title is required/i)).toBeInTheDocument();
            });
            expect(onSave).not.toHaveBeenCalled();
        });
        it('should not show error for valid required field', async () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);
            expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
            expect(onSave).toHaveBeenCalled();
        });
        it('should clear error when field is filled', async () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: '' } });
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);
            await waitFor(() => {
                expect(screen.getByText(/title is required/i)).toBeInTheDocument();
            });
            fireEvent.change(titleInput, { target: { value: 'New Title' } });
            await waitFor(() => {
                expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
            });
        });
    });
    describe('Actions', () => {
        it('should call onSave with updated data', () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);
            expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }));
        });
        it('should call onClose when cancel is clicked', () => {
            const onClose = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onClose: onClose }));
            const cancelButton = screen.getByText('Cancel');
            fireEvent.click(cancelButton);
            expect(onClose).toHaveBeenCalled();
        });
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onClose: onClose }));
            const closeButton = screen.getByLabelText(/close dialog/i);
            fireEvent.click(closeButton);
            expect(onClose).toHaveBeenCalled();
        });
        it('should call onDelete after confirmation', () => {
            const onDelete = vi.fn();
            global.confirm = vi.fn(() => true);
            render(_jsx(KanbanCardDialog, { ...defaultProps, onDelete: onDelete }));
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);
            expect(onDelete).toHaveBeenCalledWith(1);
        });
        it('should not call onDelete if not confirmed', () => {
            const onDelete = vi.fn();
            global.confirm = vi.fn(() => false);
            render(_jsx(KanbanCardDialog, { ...defaultProps, onDelete: onDelete }));
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);
            expect(onDelete).not.toHaveBeenCalled();
        });
    });
    describe('Keyboard Shortcuts', () => {
        it('should close dialog on Escape key', () => {
            const onClose = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onClose: onClose }));
            const dialog = screen.getByRole('dialog').querySelector('div');
            if (dialog) {
                fireEvent.keyDown(dialog, { key: 'Escape' });
            }
            expect(onClose).toHaveBeenCalled();
        });
        it('should save on Ctrl+Enter', () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const dialog = screen.getByRole('dialog').querySelector('div');
            if (dialog) {
                fireEvent.keyDown(dialog, { key: 'Enter', ctrlKey: true });
            }
            expect(onSave).toHaveBeenCalled();
        });
    });
    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(_jsx(KanbanCardDialog, { ...defaultProps }));
            const dialog = screen.getByRole('dialog');
            expect(dialog).toHaveAttribute('aria-modal', 'true');
            expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
        });
        it('should mark invalid fields with aria-invalid', async () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: '' } });
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);
            await waitFor(() => {
                expect(titleInput).toHaveAttribute('aria-invalid', 'true');
            });
        });
        it('should link error messages with aria-describedby', async () => {
            const onSave = vi.fn();
            render(_jsx(KanbanCardDialog, { ...defaultProps, onSave: onSave }));
            const titleInput = screen.getByLabelText(/title/i);
            fireEvent.change(titleInput, { target: { value: '' } });
            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);
            await waitFor(() => {
                expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
            });
        });
    });
});
//# sourceMappingURL=KanbanCardDialog.test.js.map