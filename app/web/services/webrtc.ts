/**
 * Creates a local mock media stream to keep video features functional without backend signaling.
 */
export async function createMockStream(): Promise<MediaStream | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  let frame = 0;
  const interval = window.setInterval(() => {
    frame += 1;

    context.fillStyle = '#020617';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    context.lineWidth = 2;

    for (let i = 0; i < 12; i += 1) {
      context.beginPath();
      context.moveTo(i * 120, 0);
      context.lineTo(i * 120 + (frame % 120), canvas.height);
      context.stroke();
    }

    context.fillStyle = 'rgba(148, 163, 184, 0.9)';
    context.font = '700 24px sans-serif';
    context.fillText('Trinetra Live Simulation', 40, 52);
    context.font = '400 18px sans-serif';
    context.fillText(new Date().toLocaleTimeString(), 40, 84);
  }, 80);

  const stream = canvas.captureStream(24);
  const [track] = stream.getVideoTracks();
  track.addEventListener('ended', () => {
    window.clearInterval(interval);
  });

  return stream;
}
