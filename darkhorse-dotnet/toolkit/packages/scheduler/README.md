# @react-toolkit/scheduler

A comprehensive, multi-view calendar scheduler component for React with resource management, recurring events, and import/export capabilities.

## Features

- **Multiple View Modes**: Day, Week, WorkWeek, Month, Year, Agenda, and Timeline variants
- **Resource Management**: Group events by resources with visual differentiation
- **Event Management**: Create, edit, delete events with customizable dialogs
- **Recurring Events**: Support for recurring event series with individual occurrence editing
- **Time Configuration**: Customizable work hours, work days, time zones, and time scales
- **Import/Export**: iCalendar (.ics) and Excel export support
- **Print Support**: Built-in print functionality
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Customizable**: Event templates, date headers, and styling options
- **TypeScript**: Fully typed with comprehensive interfaces

## Installation

```bash
npm install @react-toolkit/scheduler @react-toolkit/core @react-toolkit/design-tokens
```

## Basic Usage

```tsx
import React, { useState } from 'react';
import { Scheduler, SchedulerEvent } from '@react-toolkit/scheduler';

function MyCalendar() {
  const [events, setEvents] = useState<SchedulerEvent[]>([
    {
      id: 1,
      subject: 'Team Meeting',
      start: new Date(2025, 11, 15, 10, 0),
      end: new Date(2025, 11, 15, 11, 0),
      location: 'Conference Room A',
      description: 'Weekly team sync',
    },
    {
      id: 2,
      subject: 'Project Review',
      start: new Date(2025, 11, 16, 14, 0),
      end: new Date(2025, 11, 16, 15, 30),
      location: 'Online',
    },
  ]);

  const handleEventCreate = (event: SchedulerEvent) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (event: SchedulerEvent) => {
    setEvents(events.map(e => (e.id === event.id ? event : e)));
  };

  const handleEventDelete = (eventIds: Array<string | number>) => {
    setEvents(events.filter(e => !eventIds.includes(e.id)));
  };

  return (
    <Scheduler
      currentDate={new Date()}
      initialView="Week"
      events={events}
      onEventCreate={handleEventCreate}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
    />
  );
}
```

## View Modes

### Time Grid Views

**Day View**: Shows a single day with hourly time slots.

```tsx
<Scheduler initialView="Day" currentDate={new Date()} events={events} />
```

**Week View**: Shows a full week (7 days) with time slots.

```tsx
<Scheduler initialView="Week" currentDate={new Date()} events={events} />
```

**WorkWeek View**: Shows only work days (configurable, default Mon-Fri).

```tsx
<Scheduler
  initialView="WorkWeek"
  currentDate={new Date()}
  events={events}
  workDays={[1, 2, 3, 4, 5]} // Monday-Friday
/>
```

### Calendar Views

**Month View**: Traditional monthly calendar grid.

```tsx
<Scheduler initialView="Month" currentDate={new Date()} events={events} />
```

**Year View**: Overview of all 12 months with event indicators.

```tsx
<Scheduler initialView="Year" currentDate={new Date()} events={events} />
```

### List View

**Agenda View**: List of upcoming events grouped by date.

```tsx
<Scheduler initialView="Agenda" currentDate={new Date()} events={events} />
```

### Timeline Views

Timeline views display resources vertically with time horizontally (Gantt-style):

- **TimelineDay**: Hourly timeline for a single day
- **TimelineWeek**: Daily timeline for a week
- **TimelineWorkWeek**: Work days timeline
- **TimelineMonth**: Daily timeline for a month
- **TimelineYear**: Monthly timeline for a year

```tsx
<Scheduler
  initialView="TimelineWeek"
  currentDate={new Date()}
  events={events}
  resources={[
    { id: 1, label: 'Meeting Room A', color: '#3b82f6' },
    { id: 2, label: 'Meeting Room B', color: '#10b981' },
    { id: 3, label: 'Conference Hall', color: '#f59e0b' },
  ]}
/>
```

## Resource Management

Assign events to resources and group them visually:

```tsx
const resources = [
  { id: 'emp1', label: 'John Doe', color: '#3b82f6' },
  { id: 'emp2', label: 'Jane Smith', color: '#10b981' },
  { id: 'emp3', label: 'Bob Johnson', color: '#f59e0b' },
];

const events = [
  {
    id: 1,
    subject: 'Client Meeting',
    start: new Date(2025, 11, 15, 10, 0),
    end: new Date(2025, 11, 15, 11, 0),
    resourceId: 'emp1', // Assigned to John Doe
  },
  {
    id: 2,
    subject: 'Team Workshop',
    start: new Date(2025, 11, 15, 14, 0),
    end: new Date(2025, 11, 15, 16, 0),
    resourceId: ['emp1', 'emp2', 'emp3'], // Multiple resources
  },
];

<Scheduler
  currentDate={new Date()}
  events={events}
  resources={resources}
  initialView="TimelineDay"
/>
```

## Time Configuration

### Work Hours and Days

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  workDays={[1, 2, 3, 4, 5]} // Monday-Friday
  firstDayOfWeek={0} // 0=Sunday, 1=Monday
  dayStartHour="00:00"
  dayEndHour="23:59"
  workStartHour="09:00"
  workEndHour="18:00"
/>
```

### Time Scale

Control the granularity of time slots:

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  timeScale={{
    majorSlot: 60, // 60 minutes per major slot
    minorSlotCount: 2, // 2 minor slots = 30-minute intervals
    showGridlines: true,
  }}
/>
```

### Time Format and Timezone

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  timeFormat="HH:mm" // 24-hour format (or "hh:mm a" for 12-hour)
  timezone="America/New_York"
/>
```

## Recurring Events

Support for recurring event series:

```tsx
const recurringEvent = {
  id: 'series-1',
  subject: 'Daily Standup',
  start: new Date(2025, 11, 15, 9, 0),
  end: new Date(2025, 11, 15, 9, 15),
  recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR', // iCalendar RRULE
  recurrenceSeriesId: 'series-1',
};

// Individual occurrence
const occurrence = {
  id: 'occurrence-1',
  subject: 'Daily Standup (Modified)',
  start: new Date(2025, 11, 16, 9, 30), // Different time
  end: new Date(2025, 11, 16, 9, 45),
  recurrenceSeriesId: 'series-1', // References parent series
  recurrenceId: '20251216T090000', // Original occurrence time
};
```

## Event Templates

Customize how events are displayed:

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  eventTemplate={(event) => (
    <div>
      <strong>{event.subject}</strong>
      {event.location && <div>📍 {event.location}</div>}
      {event.description && <div>{event.description}</div>}
    </div>
  )}
/>
```

## Date Header Template

Customize date headers in time grid views:

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  dateHeaderTemplate={({ date }) => (
    <div>
      <div style={{ fontSize: '12px' }}>
        {date.toLocaleDateString('en-US', { weekday: 'short' })}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
        {date.getDate()}
      </div>
    </div>
  )}
/>
```

## Import/Export

### iCalendar Import

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  icalImport={{
    enabled: true,
    onImport: async (file: File) => {
      // Parse .ics file and return events
      const text = await file.text();
      // Use an iCalendar parser library
      const parsedEvents = parseICalendar(text);
      return parsedEvents;
    },
  }}
  onEventCreate={(event) => {
    // Add imported events to state
    setEvents([...events, event]);
  }}
/>
```

### iCalendar Export

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  icalExport={{
    enabled: true,
    onExport: (events) => {
      // Generate .ics file
      const icsContent = generateICalendar(events);
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calendar.ics';
      a.click();
    },
  }}
/>
```

### Excel Export

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  excelExport={{
    enabled: true,
    onExport: (events) => {
      // Generate Excel file using a library like xlsx
      const worksheet = XLSX.utils.json_to_sheet(events);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
      XLSX.writeFile(workbook, 'events.xlsx');
    },
  }}
/>
```

## Print Support

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  printOptions={{
    enabled: true,
    onBeforePrint: () => {
      console.log('Preparing to print...');
    },
    onAfterPrint: () => {
      console.log('Print completed');
    },
  }}
/>
```

## Event Callbacks

### Before Edit

Prevent editing of certain events:

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  onBeforeEventEdit={(event) => {
    if (event.isReadonly) {
      return { cancel: true };
    }
  }}
/>
```

### View and Date Changes

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  onViewChange={(view) => {
    console.log('View changed to:', view);
  }}
  onDateChange={(date) => {
    console.log('Date changed to:', date);
  }}
/>
```

### Error Handling

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  onError={(error) => {
    console.error('Scheduler error:', error);
    // Display error to user
  }}
/>
```

## Imperative API

Use a ref to control the scheduler programmatically:

```tsx
import { useRef } from 'react';
import { Scheduler, SchedulerHandle } from '@react-toolkit/scheduler';

function MyCalendar() {
  const schedulerRef = useRef<SchedulerHandle>(null);

  const handleGoToToday = () => {
    schedulerRef.current?.goToDate(new Date());
  };

  const handleSwitchToMonth = () => {
    schedulerRef.current?.setView('Month');
  };

  const handleCreateEvent = () => {
    schedulerRef.current?.openEditor(
      {
        subject: 'New Event',
        start: new Date(),
        end: new Date(),
      },
      'Add'
    );
  };

  return (
    <>
      <button onClick={handleGoToToday}>Today</button>
      <button onClick={handleSwitchToMonth}>Month View</button>
      <button onClick={handleCreateEvent}>New Event</button>

      <Scheduler
        ref={schedulerRef}
        currentDate={new Date()}
        events={events}
        onEventCreate={handleEventCreate}
      />
    </>
  );
}
```

### Available Methods

- `goToDate(date: Date)`: Navigate to a specific date
- `setView(view: SchedulerView)`: Change the current view
- `openEditor(event, mode)`: Open the event editor
- `closeEditor()`: Close the event editor
- `getVisibleEvents()`: Get currently visible events
- `print()`: Trigger print
- `exportICalendar()`: Trigger iCalendar export
- `exportExcel()`: Trigger Excel export

## Accessibility

The Scheduler component is fully accessible with:

- **Keyboard Navigation**: Arrow keys, Tab, Enter, Space
- **Screen Reader Support**: ARIA labels, roles, and announcements
- **Focus Management**: Visible focus indicators
- **High Contrast**: Respects system high-contrast settings

### Keyboard Shortcuts

- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Arrow Keys`: Navigate between time slots/events
- `Enter` / `Space`: Activate selected element
- `Escape`: Close dialogs

## Styling

The component uses CSS Modules and design tokens for styling. You can customize the appearance by:

### Using Design Tokens

Modify design token values in your theme:

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-light: #dbeafe;
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-border-primary: #e5e7eb;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --border-radius-md: 8px;
}
```

### Custom CSS

Add custom styles using the `className` prop:

```tsx
<Scheduler
  currentDate={new Date()}
  events={events}
  className="my-custom-scheduler"
  style={{ height: '600px' }}
/>
```

## TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import {
  Scheduler,
  SchedulerEvent,
  SchedulerResource,
  SchedulerView,
  SchedulerHandle,
  SchedulerProps,
} from '@react-toolkit/scheduler';
```

## API Reference

### SchedulerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentDate` | `Date` | **Required** | The currently displayed date |
| `initialView` | `SchedulerView` | `'Week'` | Initial view mode |
| `views` | `SchedulerView[]` | All views | Available views in toolbar |
| `timezone` | `string` | - | IANA timezone (e.g., 'America/New_York') |
| `events` | `SchedulerEvent[]` | **Required** | Events to display |
| `resources` | `SchedulerResource[]` | `[]` | Resources for grouping |
| `workDays` | `number[]` | `[1,2,3,4,5]` | Work days (0=Sunday) |
| `firstDayOfWeek` | `number` | `0` | First day of week (0=Sunday) |
| `dayStartHour` | `string` | `'00:00'` | Day start time |
| `dayEndHour` | `string` | `'23:59'` | Day end time |
| `workStartHour` | `string` | `'09:00'` | Work hours start |
| `workEndHour` | `string` | `'18:00'` | Work hours end |
| `timeScale` | `SchedulerTimeScale` | `{majorSlot: 60, minorSlotCount: 2}` | Time slot configuration |
| `timeFormat` | `string` | `'hh:mm a'` | Time display format |
| `allowDragAndDrop` | `boolean` | `true` | Enable drag and drop |
| `allowResize` | `boolean` | `true` | Enable event resizing |
| `eventTemplate` | `(event) => ReactNode` | - | Custom event rendering |
| `dateHeaderTemplate` | `(args) => ReactNode` | - | Custom date header |
| `onEventCreate` | `(event) => void` | - | Event creation callback |
| `onEventUpdate` | `(event) => void` | - | Event update callback |
| `onEventDelete` | `(ids) => void` | - | Event deletion callback |
| `onViewChange` | `(view) => void` | - | View change callback |
| `onDateChange` | `(date) => void` | - | Date change callback |
| `onBeforeEventEdit` | `(event) => {cancel?: boolean}` | - | Before edit callback |
| `onError` | `(error) => void` | - | Error handler |

### SchedulerEvent

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string \| number` | ✓ | Unique identifier |
| `subject` | `string` | ✓ | Event title |
| `start` | `Date \| string` | ✓ | Start date/time |
| `end` | `Date \| string` | ✓ | End date/time |
| `location` | `string` | - | Event location |
| `description` | `string` | - | Event description |
| `isAllDay` | `boolean` | - | All-day event flag |
| `isReadonly` | `boolean` | - | Read-only flag |
| `recurrenceRule` | `string` | - | iCalendar RRULE |
| `recurrenceId` | `string \| number` | - | Occurrence identifier |
| `recurrenceSeriesId` | `string \| number` | - | Parent series ID |
| `resourceId` | `string \| number \| array` | - | Assigned resource(s) |
| `meta` | `Record<string, unknown>` | - | Additional metadata |

### SchedulerResource

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string \| number` | ✓ | Unique identifier |
| `label` | `string` | ✓ | Display name |
| `color` | `string` | - | Visual color |
| `meta` | `Record<string, unknown>` | - | Additional metadata |

## Examples

### Conference Room Booking

```tsx
const rooms = [
  { id: 'room-a', label: 'Conference Room A', color: '#3b82f6' },
  { id: 'room-b', label: 'Conference Room B', color: '#10b981' },
  { id: 'room-c', label: 'Meeting Room C', color: '#f59e0b' },
];

const bookings = [
  {
    id: 1,
    subject: 'Team Standup',
    start: new Date(2025, 11, 15, 9, 0),
    end: new Date(2025, 11, 15, 9, 30),
    resourceId: 'room-a',
  },
  {
    id: 2,
    subject: 'Client Presentation',
    start: new Date(2025, 11, 15, 10, 0),
    end: new Date(2025, 11, 15, 12, 0),
    resourceId: 'room-b',
  },
];

<Scheduler
  currentDate={new Date()}
  initialView="TimelineDay"
  events={bookings}
  resources={rooms}
  workStartHour="08:00"
  workEndHour="18:00"
/>
```

### Employee Schedule

```tsx
const employees = [
  { id: 1, label: 'John Doe', color: '#3b82f6' },
  { id: 2, label: 'Jane Smith', color: '#10b981' },
];

const shifts = [
  {
    id: 1,
    subject: 'Morning Shift',
    start: new Date(2025, 11, 15, 8, 0),
    end: new Date(2025, 11, 15, 16, 0),
    resourceId: 1,
  },
  {
    id: 2,
    subject: 'Afternoon Shift',
    start: new Date(2025, 11, 15, 16, 0),
    end: new Date(2025, 11, 16, 0, 0),
    resourceId: 2,
  },
];

<Scheduler
  currentDate={new Date()}
  initialView="TimelineWeek"
  events={shifts}
  resources={employees}
  timeScale={{ majorSlot: 120, minorSlotCount: 2 }} // 2-hour intervals
/>
```

## Performance

The Scheduler is optimized for performance:

- **Efficient Rendering**: Only visible events are rendered
- **Event Memoization**: Event calculations are memoized
- **Virtual Scrolling**: Large event lists are handled efficiently
- **Tested**: Performs smoothly with 500+ events

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/your-repo/issues) page.

