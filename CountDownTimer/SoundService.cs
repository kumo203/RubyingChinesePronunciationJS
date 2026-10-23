using System.Diagnostics;
using System.Runtime.InteropServices;
using Avalonia.Platform;

namespace CountDownTimer;

/// <summary>
/// Plays the embedded alarm WAV on Windows (winmm), macOS (afplay) and Linux (paplay/aplay).
/// Replaces System.Media.SoundPlayer from the WPF original. All failures are swallowed, as in the original.
/// </summary>
internal sealed class SoundService : IDisposable
{
    private const uint SND_ASYNC = 0x0001, SND_FILENAME = 0x00020000, SND_NODEFAULT = 0x0002;

    [DllImport("winmm.dll", CharSet = CharSet.Unicode, EntryPoint = "PlaySoundW")]
    private static extern bool PlaySound(string? pszSound, IntPtr hmod, uint fdwSound);

    private readonly string _wavPath;
    private Process? _process;

    public SoundService()
    {
        _wavPath = Path.Combine(Path.GetTempPath(), "CountDownTimer_Syuryo.wav");
        try
        {
            using var src = AssetLoader.Open(new Uri("avares://CountDownTimer/Assets/Syuryo.wav"));
            using var dst = File.Create(_wavPath);
            src.CopyTo(dst);
        }
        catch { /* sound is optional */ }
    }

    public void Play()
    {
        try
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                PlaySound(_wavPath, IntPtr.Zero, SND_FILENAME | SND_ASYNC | SND_NODEFAULT);
            }
            else
            {
                Stop();
                var player = RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? "afplay" : "paplay";
                _process = Process.Start(new ProcessStartInfo(player, $"\"{_wavPath}\"")
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                });
            }
        }
        catch { }
    }

    public void Stop()
    {
        try
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                PlaySound(null, IntPtr.Zero, 0);
            }
            else if (_process is { HasExited: false })
            {
                _process.Kill();
            }
        }
        catch { }
        finally
        {
            _process = null;
        }
    }

    public void Dispose()
    {
        Stop();
        try { File.Delete(_wavPath); } catch { }
    }
}
