# Frontend Patterns — WPF + MVVM

## ViewModel Patterns

### Observable Properties (CommunityToolkit.Mvvm)

Use source generators — never write boilerplate `INotifyPropertyChanged` manually.

```csharp
// ✅ CORRECT — source generator handles the boilerplate
public partial class OrdersViewModel : ViewModelBase
{
    [ObservableProperty]
    private IReadOnlyList<OrderSummaryDto> _orders = [];

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasOrders))]
    private bool _isBusy;

    public bool HasOrders => Orders.Count > 0;
}

// ❌ WRONG — hand-written INPC
private IReadOnlyList<OrderSummaryDto> _orders = [];
public IReadOnlyList<OrderSummaryDto> Orders
{
    get => _orders;
    set { _orders = value; OnPropertyChanged(); }
}
```

### Async Relay Commands

Always guard async commands with an `IsBusy` check to prevent double-execution.

```csharp
public partial class OrdersViewModel : ViewModelBase
{
    private readonly IMediator _mediator;

    [ObservableProperty]
    private IReadOnlyList<OrderSummaryDto> _orders = [];

    public OrdersViewModel(IMediator mediator) => _mediator = mediator;

    [RelayCommand(CanExecute = nameof(IsNotBusy))]
    private async Task LoadOrdersAsync()
    {
        try
        {
            IsBusy = true;
            ClearError();
            Orders = await _mediator.Send(new GetOrdersQuery());
        }
        catch (Exception ex)
        {
            SetError($"Failed to load orders: {ex.Message}");
        }
        finally
        {
            IsBusy = false;
        }
    }

    private bool IsNotBusy => !IsBusy;
}
```

### Messenger Pattern (Cross-ViewModel Communication)

Use `WeakReferenceMessenger` from CommunityToolkit.Mvvm for decoupled ViewModel-to-ViewModel messages.

```csharp
// Sender
WeakReferenceMessenger.Default.Send(new OrderSelectedMessage(order));

// Receiver
public class OrderDetailViewModel : ViewModelBase, IRecipient<OrderSelectedMessage>
{
    public OrderDetailViewModel()
    {
        WeakReferenceMessenger.Default.Register(this);
    }

    public void Receive(OrderSelectedMessage message)
    {
        // Update detail view
    }
}
```

---

## XAML Patterns

### Data Binding Best Practices

```xml
<!-- ✅ CORRECT — bind to ViewModel properties -->
<TextBox Text="{Binding SearchText, UpdateSourceTrigger=PropertyChanged}" />
<Button Command="{Binding SearchCommand}" Content="Search" />
<ListBox ItemsSource="{Binding Orders}" SelectedItem="{Binding SelectedOrder}" />

<!-- ✅ Show/hide based on IsBusy -->
<ProgressBar IsIndeterminate="True"
             Visibility="{Binding IsBusy, Converter={StaticResource BoolToVisibilityConverter}}" />

<!-- ✅ Show error when HasError is true -->
<TextBlock Text="{Binding ErrorMessage}"
           Foreground="{StaticResource ErrorBrush}"
           Visibility="{Binding HasError, Converter={StaticResource BoolToVisibilityConverter}}" />
```

### UserControl Code-Behind Rule

Code-behind ONLY sets DataContext via constructor injection:

```csharp
// ✅ CORRECT
public partial class OrdersView : UserControl
{
    public OrdersView(OrdersViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}

// ❌ WRONG — business logic in code-behind
private void Button_Click(object sender, RoutedEventArgs e)
{
    if (_orders.Count > 0) { ... }  // this belongs in the ViewModel
}
```

---

## Material Design Patterns

### Card-Based Layout

```xml
<Border Margin="0,0,0,12"
        Padding="16"
        CornerRadius="4"
        Background="{DynamicResource MaterialDesignCardBackground}"
        Effect="{DynamicResource MaterialDesignShadowDepth1}">
    <!-- Card content -->
</Border>
```

### Consistent Typography

```xml
<!-- Use MaterialDesign text block styles -->
<TextBlock Text="Page Title"
           Style="{DynamicResource MaterialDesignHeadline5TextBlock}" />
<TextBlock Text="Section"
           Style="{DynamicResource MaterialDesignSubtitle1TextBlock}" />
<TextBlock Text="Body text"
           Style="{DynamicResource MaterialDesignBody1TextBlock}" />
```

### Form Validation Display

```xml
<TextBox md:HintAssist.Hint="Order Name"
         Text="{Binding OrderName, ValidatesOnDataErrors=True}"
         Style="{DynamicResource MaterialDesignOutlinedTextBox}" />
```

---

## Navigation Pattern

Use a `Frame` in `MainWindow.xaml` with a navigation service, or a tab-based approach for simpler apps.

```csharp
// Simple approach — ViewModel controls which view is visible
public partial class MainWindowViewModel : ObservableObject
{
    [ObservableProperty]
    private object _currentView;

    [RelayCommand]
    private void NavigateTo(string viewName)
    {
        CurrentView = viewName switch
        {
            "Orders" => _serviceProvider.GetRequiredService<OrdersView>(),
            "Customers" => _serviceProvider.GetRequiredService<CustomersView>(),
            _ => throw new ArgumentOutOfRangeException(nameof(viewName))
        };
    }
}
```

```xml
<!-- MainWindow.xaml — bind Frame/ContentControl to CurrentView -->
<ContentControl Grid.Column="1" Content="{Binding CurrentView}" />
```
