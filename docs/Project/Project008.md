---
title: OpenAI의 다양한 API를 활용한 Youtube 영상 자동 STT 및 요약
layout: default
parent: Project
nav_order: 8
permalink: /docs/Project/Project008
---

# OpenAI의 다양한 API를 활용한 Youtube 영상 자동 STT 및 요약

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

최근 ChatGPT의 놀라운 성능을 보고 재밌다에서 그쳤었지만,

유투브에서 이를 활용한 확장 Extension을 보고 그동안 불편하게 생각했던 유투브 STT생성을 보완할 수 있을 것 같다는 생각이 들었고, 이를 통해서 유투브를 통해 여러 딥러닝 관련 리뷰를 편하게 볼 수 있다는 생각이 들어 해당 프로젝트를 진행해보려하였다.

결과론적으로 Github Blog로 자동 Bloging과 Keyword summary까지 생각중에 있으나, 어떤 것을 활용할지는 고민에 있다.

그리고 필자는 Colab으로 진행하였기 때문에 필요한 lib를 install하는 과정부터 설명하고자 한다.

```
!pip install -qq git+https://github.com/openai/whisper.git
!pip install -qq pytube
!pip install -qq openai
!sudo apt update && sudo apt install ffmpeg
!python -m spacy download ko_core_news_lg
!pip install --upgrade youtube-dl
!pip install git+https://github.com/Cupcakus/pafy
```

다음과 같은 lib이 필요하며, 여기서 한 가지 중요한 점은 youtube-dl와 pafy의 install 순서이다. youtube-dl를 pafy install 후에 하게 된다면, 설치 error를 겪게 될 것이다.

Colab에서의 문제인지는 모르겠지만, 아마도 youtube-dl를 설치하는 과정에서 일부 package의 설치되는 것 같다.

```
import whisper, openai, spacy
from pytube import YouTube
from IPython.display import Audio
from spacy.lang.ko.examples import sentences
import pafy
from google.colab import files
```

위와 같이 import 하여 실행을 준비하며, STT를 실행하기 위해서 pafy key를 setup 해주어야한다.

```
key = 'youtube data V3 api key'
pafy.set_api_key(key)
openai.api_key = "openai api key"
```

이렇게 2가지의 key를 setup 해주어야 pafy, openai의 사용이 가능하며, 유투브 url을 통해 영상을 다운받은 뒤 mp3파일을 추출할 것이다. 

```
url = 'https://youtu.be/YsyIXqdhreo'

youtube_link = YouTube(url)

youtube_link.streams.filter(file_extension='mp4').get_by_resolution('720p').download(
    output_path='.', filename='youtube.mp4')
```   

'youtube.mp4' 파일이 다운되게 되며, 이를 ffmpeg를 통해 고음질의 mp3 파일을 추출하는 과정을 진행해야합니다.

```
!ffmpeg -y -i youtube.mp4 -q:a 0 -map a -hide_banner -ab 192000 -loglevel error youtube_audio.mp3
```

이렇게 추출한 192Kbps 음원파일로 whisper를 통한 STT를 진행하기 위한 코드는 아래와 같습니다.

```
model = whisper.load_model('large')
result = model.transcribe('youtube_audio.mp3')
output = result['text']
output
```

whisper의 사용가능한 모델은 아래과 같이 있으며, 저는 가능 큰 모델인 large를 사용하였습니다. 역시 모델의 크기가 클수록 가장 자연스럽게 인식하는 것 같습니다.

> tiny.en, tiny, base.en, base, small.en, small, medium.en, medium, large-v1, large-v2, large

다음으로는 spacy를 통해 문장을 분리해 내야합니다. 왜냐하면 output을 확인해보면 알 수 있지만, 문장의 길이가 엄청나게 길기때문에 openai를 통한 summary를 진행할 수 없기 때문입니다. 그 전처리 과정을 확인하기 위한 코드라고 생각하시면 되고 저희는 함수를 사용할 것 입니다. 여기에서도 load하는 모델의 종류는 3가지가 있는데 그 중 large 크기의 모델이 가장 성능이 좋았습니다.

```
nlp = spacy.load("ko_core_news_lg")
output_text = []

text = output
for sentence in nlp(text).sents:
  output_text.append(sentence.text)

output_text = "\n\n".join(output_text)
output_text
```

```
def text_to_chunks(text):
  chunks = [[]]
  chunk_total_words = 0

  sentences = nlp(text)

  for sentence in sentences.sents:
    chunk_total_words += len(sentence.text.split(" "))

    if chunk_total_words > 300:
      chunks.append([])
      chunk_total_words = len(sentence.text.split(" "))

    chunks[len(chunks)-1].append(sentence.text)
  
  return chunks
 ```
 
 ```
 def summarize_text(text, max_length = 1000):
    response = openai.Completion.create(
        engine = "text-davinci-003",
        prompt = (f"Summarize the following text in {max_length} characters or less: " + text),
        max_tokens = max_length,
        n = 1,
        stop = None,
        temperature = 0.5,
    )
    summary = response.choices[0].text
    return summary
```
 
여기서 위 text_to_chunks을 통해서 긴 문장을 나눈 뒤 summarize_text를 통해 요약을 진행하게 됩니다.

```
chunks = text_to_chunks(output)
chunk_summaries = []

for chunk in chunks:
  chunk_summary = summarize_text(" ".join(chunk))
  chunk_summaries.append(chunk_summary)

summary = " ".join(chunk_summaries)

summary_text = []

text = summary
for sentence in nlp(text).sents:
  summary_text.append(sentence.text)

summary_text = "\n\n".join(summary_text)
summary_text
```

이렇게 모든 과정을 거친 후 나온 summary_text가 전체 요약문입니다.
같은 과정을 거칠때마다 결과가 조금씩 다르게 나오는 것 같지만, 제 생각으로는 요약을 잘 진행하는 것 같습니다.

```
video_info = pafy.new(url)
md_text = []

md_text.append('---')
md_text.append('\n')
md_text.append('keywords: Review')
md_text.append('title : %s' % video_info.title)
md_text.append('badges: true')
md_text.append('comments: true')
md_text.append('layout: post')
md_text.append('categories: [Paper]')
md_text.append('\n')
md_text.append('---')

md_text.append('---')
md_text.append('\n')
md_text.append('YOUTUBE LINK : %s' %url)
md_text.append('PRESENTER : %s' % video_info.author)
md_text.append('DURATION : %s' % video_info.duration)
md_text.append('PUBLISHED : %s' % video_info.published[0:10])
md_text.append('\n')
md_text.append('---')
md_text.append('# FULL SCRIPT')
md_text.append(output_text)
md_text.append('---')
md_text.append('\n')
md_text.append('# SUMMARY')
md_text.append(summary_text)
md_text.append('---')

```

그리고 마지막으로 저는 github blog에 업로드를 위해서 타이틀과 같은 부분을 생성하게 만들고싶었기에, 유투브 url을 통해서 제목, 등록일등을 추출할 수 있게 pafy를 활용하였습니다.

여기서 필요한 정보들을 md_text에 담아 파일로 출력하는 과정까지 진행하였습니다.

```
f = open(video_info.published[0:10] + '-' + video_info.title +".md","w", encoding='UTF-8', newline='')
for num in range(0,len(md_text)):
    f.write("%s\n"% md_text[num])
f.close
```

```
files.download(video_info.published[0:10] + '-' + video_info.title +".md")
```

끝으로, 저는 유투브의 자동 자막 생성의 퀄리티가 너무 낮아 한국 사람의 음성을 실시간으로 번역하는 건 아직 늦었다고 생각을 하고 있었지만, 이번 whisper를 통해 STT를 진행하고 ChatGPT를 통해서 요약문이 작성되는 결과를 확인함으로써 정말 많은 발전이 이루어졌다고 생각이되었으며, 이를 시간대 별로 잘라서 사용한다면 유투브와 같은 동영상 플레이어에도 번역의 퀄리티가 더욱 높아지지 않을까 생각들었으며, 긴 글 봐주셔서 감사합니다.

코드를 더욱 발전화시켜 extension으로 개발하거나, youtube url을 파일로 대량으로 받을 수 있게도 한번 만들어 볼 예정입니다. 끝!