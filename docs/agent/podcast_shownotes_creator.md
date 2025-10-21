# Podcast Shownotes Creator Agent

## Overview
A specialized agent that creates comprehensive Chinese podcast shownotes from audio files. It transcribes audio using Whisper AI, analyzes content in segments, and generates structured shownotes including title, description, key topics, highlights, and key takeaways.

## Usage

### Prerequisites
- Run the terminal as administrator
- Navigate to the `backend/agents` folder
- Enable the virtual environment
- Navigate to the `backend/agents/src` folder
- Have audio file ready (mp3, wav, etc.)

### Running the Agent
```bash
adk run podcast_shownotes_creator
```

## Features
- Audio file validation
- Automatic speech-to-text transcription using Whisper
- Timestamped transcript generation
- Intelligent content segmentation to handle long podcasts
- Comprehensive Chinese shownotes generation
- Structured output with multiple sections

## Arguments

### Input
- **audio_file_path** (str): The absolute path to the audio file
  - Required: Yes
  - Format: Absolute file path
  - Supported formats: MP3, WAV, M4A, and other formats supported by Whisper
  - Example: `C:\Users\username\Desktop\podcast_episode.mp3` (Windows) or `/Users/username/Desktop/podcast_episode.mp3` (macOS/Linux)

## Example Usage

### Query Example
```
"Please create shownotes for this podcast: C:\Users\liguangyi\Desktop\podcast\E22_v2.mp3"
```

### Workflow
1. Agent validates the audio file exists
2. Transcribes the audio using Whisper (base model)
3. Splits transcript into 5 equal segments to prevent token limit issues
4. Creates detailed summary for each segment
5. Generates comprehensive shownotes from all summaries

### Example Output Structure
```markdown
# AI技术在教育领域的应用与挑战

## 节目简介
本期节目深入探讨了人工智能技术在现代教育中的应用场景，分析了AI如何改变传统教学模式，以及教育工作者面临的机遇与挑战。我们邀请了资深教育专家分享实践经验。

## 核心话题
- AI辅助个性化学习的实现路径
- 教师角色在AI时代的转变
- 教育数据隐私与伦理问题
- AI评估系统的准确性与公平性
- 未来教育技术的发展趋势

## 精彩亮点
- **个性化学习革命**: AI系统能够根据每个学生的学习速度和风格调整教学内容，实现真正的因材施教
- **教师赋能工具**: AI不是要取代教师，而是帮助教师从重复性工作中解放出来，专注于创造性教学
- **数据驱动决策**: 通过学习数据分析，教育管理者可以做出更明智的课程设计和资源分配决策
- **全球教育公平**: AI技术有潜力缩小教育资源分配不均的问题，让优质教育触达更多学生
- **持续学习支持**: AI助手可以提供24/7的学习支持，帮助学生随时解决问题

## 重点金句
- "AI不会取代教师，但会用AI的教师会取代不会用AI的教师"
- "个性化教育不再是梦想，而是正在发生的现实"
- "我们需要在技术创新和教育伦理之间找到平衡点"
- "最好的教育技术是让人感觉不到技术存在的技术"
- "未来的教育是人机协作的教育，而不是人机对抗"

## 关键要点总结
- **技术与教学融合**: AI技术应该作为教学工具而非目的，重点是提升教学效果而非炫耀技术
- **数据安全优先**: 在应用AI教育工具时，必须建立严格的数据保护机制，保障学生隐私
- **教师培训必要性**: 学校需要投入资源培训教师使用AI工具，确保技术真正服务于教学
- **评估系统改进**: AI评估系统需要持续优化算法，避免偏见，确保评价的公平性和准确性
- **渐进式实施策略**: AI教育应用应该循序渐进，从试点项目开始，逐步扩大规模
```

## Shownotes Sections

The agent generates the following sections in Chinese:

1. **节目标题** (Episode Title)
   - Catchy and descriptive title

2. **节目简介** (Episode Summary)
   - 2-3 sentence overview of the episode

3. **核心话题** (Core Topics)
   - 3-5 main topics discussed

4. **精彩亮点** (Highlights)
   - 5-8 interesting moments with explanations

5. **重点金句** (Key Quotes)
   - 3-5 memorable quotes

6. **关键要点总结** (Key Takeaways)
   - 5-7 actionable insights with detailed explanations

## Available Tools

### 1. check_audio_file(audio_file_path: str) -> bool
Validates that the audio file exists at the specified path.
- Returns `True` if file exists
- Raises `FileNotFoundError` if file not found
- Must be called before transcription

### 2. transcribe_audio(audio_file_path: str) -> list[str]
Transcribes audio file using Whisper model.
- Returns list of timestamped transcript segments
- Format: `[HH:MM:SS -> HH:MM:SS] Transcribed text`
- Detects language automatically
- Uses "base" model size for balance of speed and accuracy

### Helper Functions

#### format_timestamp(seconds) -> str
Converts seconds to HH:MM:SS format for timestamps.

## API Keys Required

### Required API Keys
- `GOOGLE_API_KEY` - For Gemini model access

### `.env` Configuration
Create a `.env` file in the `backend/agents` directory:
```
GOOGLE_GENAI_USE_VERTEXAI=0
GOOGLE_API_KEY=AIxxx
```

Note: Whisper model runs locally and does not require additional API keys.

## Model Configuration

### LLM Model
- Model: `gemini-2.5-flash`
- Agent Name: `podcast_shownotes_creator_agent`

### Whisper Model
- Model Size: `base`
- Device: CPU
- Beam Size: 5

## Technical Details
- Location: `backend/agents/src/podcast_shownotes_creator/agent.py`
- Type: LLM Agent with audio processing tools
- Processing: Local Whisper model for transcription
- Language: Chinese for shownotes output

## Performance Considerations

### Transcript Segmentation
The agent splits long transcripts into 5 equal segments to:
- Prevent exceeding token limits
- Maintain processing efficiency
- Ensure comprehensive analysis

### Whisper Model Selection
Using "base" model provides:
- Reasonable accuracy for most use cases
- Faster processing than larger models
- Lower memory requirements
- Suitable for CPU processing

### Model Size Options
If you need different accuracy/speed tradeoffs, you can modify the `model_size` variable in the code:
- `tiny` - Fastest, lowest accuracy
- `base` - Balanced (default)
- `small` - Better accuracy, slower
- `medium` - High accuracy, much slower
- `large` - Best accuracy, very slow

## Supported Audio Formats
- MP3
- WAV
- M4A
- FLAC
- OGG
- And other formats supported by ffmpeg/av

## Limitations
- Whisper model runs on CPU (can be slow for long podcasts)
- Best results with clear audio quality
- Background noise may affect transcription accuracy
- Very long podcasts (>2 hours) may take significant time to process

## Tips for Best Results
1. Use high-quality audio files with minimal background noise
2. Ensure speakers are clearly audible
3. For very long podcasts (>2 hours), consider splitting the file
4. If transcription quality is poor, consider using a larger Whisper model
5. Ensure sufficient disk space for temporary model files

## Error Handling
- Validates audio file existence before processing
- Handles missing files gracefully with clear error messages
- Reports language detection confidence
- Provides progress updates during transcription

