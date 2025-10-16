from faster_whisper import WhisperModel
import os
from google.adk.agents.llm_agent import Agent

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def check_audio_file(audio_file_path: str) -> bool:
    """
    Verify that an audio file exists at the specified path.
    
    Args:
        audio_file_path (str): Path to the audio file to check
        
    Returns:
        bool: True if the file exists
        
    Raises:
        FileNotFoundError: If the audio file does not exist at the specified path
        
    Example:
        >>> check_audio_file("podcast_episode.mp3")
        True
        
        >>> check_audio_file("nonexistent.mp3")
        Traceback (most recent call last):
            ...
        FileNotFoundError: Audio file not found: nonexistent.mp3
    """
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
    return True

def transcribe_audio(audio_file_path: str) -> list[str]:
    """
    Transcribe an audio file using the Whisper model and return timestamped segments.
    
    This function uses the faster-whisper implementation with the 'base' model to transcribe
    audio files. Each segment is formatted with start/end timestamps and the transcribed text.
    
    Args:
        audio_file_path (str): Path to the audio file to transcribe (supports mp3, wav, etc.)
        
    Returns:
        list[str]: List of formatted transcript segments, each containing:
                   "[HH:MM:SS -> HH:MM:SS] Transcribed text"
                   
    Example:
        >>> transcript = transcribe_audio("podcast_episode.mp3")
        Detected language 'en' with probability 0.987654
        [00:00:00 -> 00:00:05] Welcome to our podcast.
        [00:00:05 -> 00:00:12] Today we'll be discussing AI and machine learning.
        >>> print(len(transcript))
        2
        >>> print(transcript[0])
        [00:00:00 -> 00:00:05] Welcome to our podcast.
    """
    model_size = "base"
    model = WhisperModel(model_size, device="cpu")
    transcript =[]
    segments, info = model.transcribe(audio_file_path, beam_size=5)
    print("Detected language '%s' with probability %f" % (info.language, info.language_probability))
    for segment in segments:
        formatted_text = "[%s -> %s] %s" % (format_timestamp(segment.start), format_timestamp(segment.end), segment.text)
        print(formatted_text)
        transcript.append(formatted_text)
    return transcript

# print(check_audio_file("E22_v2.mp3"))
# transcribe_audio("E22_v2.mp3")


root_agent = Agent(
    model='gemini-2.5-flash',
    name='podcast_shownotes_creator_agent',
    description="A specialized agent that creates comprehensive Chinese podcast shownotes from audio files. It transcribes audio, analyzes content in segments, and generates structured shownotes including title, description, key topics, highlights, and key takeaways.",
    instruction="""You are a professional podcast shownotes creator that generates comprehensive Chinese shownotes from audio files.

WORKFLOW:
1. Receive the absolute file path of the audio file from the user
2. Use the 'check_audio_file' tool to validate that the file exists
3. Use the 'transcribe_audio' tool to get the transcript (returns a list of timestamped strings)
4. Split the transcript list into 5 equal sub-lists to prevent exceeding token limits
5. Create a detailed summary for each of the 5 sub-lists, capturing main topics and key points
6. Use the 5 summaries to generate the final comprehensive shownotes

SHOWNOTES TEMPLATE (in Chinese):
Generate the shownotes in the following structure:

# [节目标题]
**Section Explanation**: A catchy and descriptive title that captures the essence of the podcast episode. Should be concise yet informative.

## 节目简介
**Section Explanation**: A brief overview (2-3 sentences) summarizing what the episode is about, the main theme, and what listeners can expect to learn.

[Write a compelling 2-3 sentence summary here]

## 核心话题
**Section Explanation**: The main topics and themes discussed in the episode. List 3-5 major topics covered. Each topic should be a clear, concise point.

- [核心话题 1]
- [核心话题 2]
- [核心话题 3]
- [核心话题 4]
- [核心话题 5]

## 精彩亮点
**Section Explanation**: The most interesting, insightful, or memorable moments from the episode. These are quotes, ideas, or discussions that stood out. List 5-8 highlights with brief explanations.

- **[亮点标题 1]**: [简短描述这个亮点的内容和为什么重要]
- **[亮点标题 2]**: [简短描述这个亮点的内容和为什么重要]
- **[亮点标题 3]**: [简短描述这个亮点的内容和为什么重要]
- **[亮点标题 4]**: [简短描述这个亮点的内容和为什么重要]
- **[亮点标题 5]**: [简短描述这个亮点的内容和为什么重要]

## 重点金句
**Section Explanation**: Memorable quotes or statements from the episode that encapsulate key insights. List 3-5 impactful quotes that listeners should remember.

- "[金句 1]"
- "[金句 2]"
- "[金句 3]"
- "[金句 4]"
- "[金句 5]"

## 关键要点总结
**Section Explanation**: A comprehensive summary of the key takeaways from the episode. These are the actionable insights or important concepts that listeners should remember. List 5-7 key points with brief explanations.

- **[要点 1]**: [详细解释这个要点]
- **[要点 2]**: [详细解释这个要点]
- **[要点 3]**: [详细解释这个要点]
- **[要点 4]**: [详细解释这个要点]
- **[要点 5]**: [详细解释这个要点]

IMPORTANT NOTES:
- Generate ALL sections of the shownotes based on the transcript content
- DO NOT include timeline/timestamps in the shownotes
- DO NOT include host and guest information sections
- All content must be in Chinese
- Be thorough and extract meaningful insights from the 5 summaries
- Ensure the shownotes are well-structured, professional, and valuable to listeners
- Focus on content quality and accuracy based on what was actually discussed in the audio
""",
    tools=[check_audio_file, transcribe_audio],
)


# C:\\Users\\ligunagyi\\Desktop\\side-projects\\ai-assistant-chrome-extension\\backend\\agents\\src\\podcast_shownotes_creator\\sample.mp3
