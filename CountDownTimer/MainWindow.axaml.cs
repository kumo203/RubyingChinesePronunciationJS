using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Media;
using Avalonia.Threading;

namespace CountDownTimer;

public partial class MainWindow : Window
{
    private readonly DispatcherTimer _timer = new() { Interval = TimeSpan.FromSeconds(1) };
    private readonly SoundService _sound = new();
    private readonly IBrush? _normalBrush;
    private DateTime _timeLimit;
    private bool _isPlay;

    public MainWindow()
    {
        InitializeComponent();
        _normalBrush = DisplayLabel.Foreground;
        DisplayLabel.Text = "Click";

        _timer.Tick += Timer_Tick;
        DoubleTapped += OnDoubleTapped;
        Closing += (_, _) =>
        {
            _timer.Stop();
            _sound.Dispose();
        };
    }

    // Double-click (or double-tap) starts / restarts the countdown.
    private void OnDoubleTapped(object? sender, TappedEventArgs e)
    {
        var remaining = _timeLimit - DateTime.Now;
        _timer.Stop();

        // Same quirk as the original: a few seconds of lead time are added to the configured minutes.
        _timeLimit = DateTime.Now
            .AddMinutes(Settings.TimeValue)
            .AddSeconds(remaining > TimeSpan.Zero ? 5 : 30);

        if (_isPlay) StopSound();
        _timer.Start();
    }

    private void Timer_Tick(object? sender, EventArgs e)
    {
        var remaining = _timeLimit - DateTime.Now;
        _timer.Stop();

        DisplayLabel.Foreground = remaining > TimeSpan.Zero ? _normalBrush : Brushes.Red;
        DisplayLabel.Text = $"{Math.Abs(remaining.Minutes):00}:{Math.Abs(remaining.Seconds):00}";

        if (remaining <= TimeSpan.FromSeconds(1)) PlaySound();
        _timer.Start();
    }

    private void PlaySound()
    {
        if (_isPlay) return;
        _sound.Play();
        _isPlay = true;
    }

    private void StopSound()
    {
        _isPlay = false;
        _sound.Stop();
    }
}
