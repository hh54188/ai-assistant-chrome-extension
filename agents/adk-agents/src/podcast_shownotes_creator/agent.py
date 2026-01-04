import os
from faster_whisper import WhisperModel
from google.adk.agents.llm_agent import Agent
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters

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

ACCESS_FOLDER_PATH = r"C:\Users\ligunagyi\Desktop"
root_agent = Agent(
    model='gemini-2.5-pro',
    name='podcast_shownotes_creator_agent',
    description="A specialized agent that creates comprehensive Chinese podcast shownotes from audio files. It transcribes audio, analyzes content in segments, and generates structured shownotes including title, description, key topics, highlights, and key takeaways.",
    instruction="""你是一位专业的播客摘要（shownotes）创作者，能够根据音频文件中的内容生成全面的中文播客摘要。

工作流：
- 从用户那里接收到本地音频文件的绝对路径
- 判断文件是否存在，如果文件不存在则终止整个流程
- 如果文件存在则继续检测文件类型，如果文件是音频文件则执行下面的子步骤
    - 使用工具将音频文件转录为文字（包含时间戳以及对应时间区间内的文字）
    - 将转录内容存储在一个文本（text）文件中，并将文件保存在音频文件所在的文件夹中
    - 根据上述转录内容生成最终的播客摘要
- 如果文件是文本文件，检测其中是否存储了音频转录内容。转录内容的格式如下"[00:00:00 -> 00:00:19] XXXXXX, XXXXXX"
    - 根据上述转录内容生成最终的播客摘要
- 如果文件是其他类型则终止整个流程

以下是摘要模板，请根据以下结构生成中文播客摘要：

# [节目标题]
**注意**：标题应该不超过两句话；标题的目标是简洁明了的概括整集节目谈论的话题。同时也要让标题看起来足够吸引人，让听众有点击播放的欲望

## [节目简介]
**注意**：用不超过两个自然段的篇幅对本期节目做一个简介。简介应该包含本集播客的主题，嘉宾谈论的有关话题以及听众可能在其中学习到的知识点。
同样的简介也应该自然、亲切、足够吸引人，而不是机械的、生硬的将所有要点全盘托出。最好是用“我们”为人称进行描述
- 以下是几个反例：
    - "本期节目深入探讨了技术出版领域中作者与编辑之间的共生关系。我们再次邀请到资深编辑阳老师和技术作者广义，他们分享了从选题、创作到出版过程中的宝贵经验和深刻见解，揭示了技术图书出版背后不为人知的逻辑与挑战。"
    - "本期嘉宾深入探讨了不同学习媒介的优劣。视频教程因其直观性在初学阶段备受青睐，却也因节奏缓慢而被资深程序员诟病。与此同时，传统的文字阅读仍以其快速、精准的信息获取能力，成为众多程序员持续的首选。"
- 以下是几个正面例子：
    - "你有没有萌生过写一本技术图书的想法？如果你觉得自己的选题不错，那么应该如何开始呢？是应该首先联系出版社还是应该立即动笔？你还有没有期望从出版一本技术图书的过程中得到其他方面的收获？放心，所有这些问题都可以在本期节目中找到答案。
在本期节目中，我们将从作者的视角出发来探索一本技术图书是如何从构思，编写，再到校对，最后上市与读者见面的。我们力图通过分享出版过程中背后的故事，以及挖掘流程背后的挑战，来展现技术图书出版鲜为人知的那一面。同时还会尝试从读者、编辑、作者三个不同的视角来回答一些有关技术出版有关的尖锐问题。在节目的最后我们不禁想问，技术图书出版对个人以及出版社而言都还是个好生意吗？"
下面同样是一个正面例子：
    - "你书架上的《人工智能：现代方法（第4版）》《动手学深度学习》等经典图书背后有什么样的故事？为什么有些技术能成为主流，有些却默默无闻？从Go语言到Node.js，出版如何推动技术在中国的发展与普及？
这期节目我们邀请了一位特殊的嘉宾——你可能从未见过但深受其影响的幕后英雄。杨海玲老师，人民邮电出版社异步社区资深策划编辑，25年IT图书出版经验，她参与责编过《重构（第2版）》《持续交付2.0》《代码整洁之道》等影响无数程序员职业生涯的经典图书。
杨老师将从编辑的独特视角，分享技术出版如何推动技术发展，揭秘图书选择背后的专业逻辑，并探讨在AI时代，为什么程序员仍然需要系统化阅读。这不仅是一次出版行业内幕的揭秘，更是为程序员提供技术选书和学习路径的专业指南。"
    - "我相信技术图书翻译对大多数听众来说既熟悉又陌生，之所以熟悉是因为我们每个人都是译本的消费者也同时是收益者，而陌生的地方则在于鲜有人会参与到真实的翻译流程中去，清晰的了解一本外文技术图书是如何从引进到面市的。
    - 在这期节目中，我们会根据我们的图书翻译经历，聊聊图书翻译的选题、入坑，以及向各位听众展现图书翻译究竟是怎样一个过程。更重要的是，AI的出现给技术图书翻译带来了巨大影响，和前AI时代相比，AI解决哪些问题以及带来了哪些变化，也是我们想着重分享的。"


## [时间轴]
**注意**：在整集播客节目中，嘉宾会谈论好几个话题。时间轴应该作为整集提纲存在，快速帮助听众看到并且可以帮助他定位到想听的话题。时间轴内容应该是一个列表，每一个时间点都是独立一行
- mm:ss – xxxx
- mm:ss – xxxx
- mm:ss – xxxx

其他需要注意的点：
-生成的播客摘要应该完全基于转录文字的内容 

""",
    tools=[
        transcribe_audio,
        McpToolset(
            connection_params=StdioConnectionParams(
                server_params = StdioServerParameters(
                    command='npx',
                    args=[
                        "-y",
                        "@modelcontextprotocol/server-filesystem",
                        os.path.abspath(ACCESS_FOLDER_PATH),
                    ],
                ),
                timeout=20
            ),
        )
    ],
)
