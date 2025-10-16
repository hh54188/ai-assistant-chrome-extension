from faster_whisper import WhisperModel

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

model_size = "base"

model = WhisperModel(model_size, device="cpu")

segments, info = model.transcribe("E22_v2.mp3", beam_size=5)

print("Detected language '%s' with probability %f" % (info.language, info.language_probability))

for segment in segments:
    print("[%s -> %s] %s" % (format_timestamp(segment.start), format_timestamp(segment.end), segment.text))