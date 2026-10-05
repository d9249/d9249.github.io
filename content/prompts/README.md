# Prompt library data

`/prompts/` 페이지는 이 폴더의 JSON 세 개를 합쳐서 보여줍니다.

| 파일                | 내용                                    | 라이선스                               | 갱신 방법                                      |
| ------------------- | --------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| `community.json`    | GitHub 이슈 폼으로 공유받은 프롬프트    | 항목별 (`CC-BY-4.0`, `CC0-1.0`, `MIT`) | `prompt:approved` 라벨 → 워크플로가 자동 추가  |
| `original.json`     | 이 블로그에서 직접 작성한 프롬프트      | CC BY 4.0                              | 직접 편집                                      |
| `open-sources.json` | 재배포가 허용된 공개 출처에서 고른 원문 | CC0 1.0 (prompts.chat), MIT (DAIR.AI)  | `node scripts/prompts/import-open-sources.mjs` |

## 수록 원칙

- 원문을 싣는 것은 직접 쓴 것과 재배포가 명시적으로 허용된 출처(CC0, CC BY, MIT 등)뿐입니다.
- 라이선스 표기가 없는 사이트·SNS의 프롬프트, 다른 큐레이션 사이트가 직접 쓰거나 다시 쓴 설명·별점·분류는 옮기지 않습니다.
- MIT 출처는 저작권 고지와 허가 고지를 함께 둡니다(페이지 하단 "출처와 라이선스").
- prompts.chat 기여자 필드 중 이메일 주소 형태는 공개하지 않습니다.
- 권리자의 삭제 요청은 확인 즉시 반영합니다.

## 항목 형식

```json
{
  "id": "sm-rag-grounded-answer",
  "title": "근거 인용형 RAG 답변",
  "titleEn": "",
  "summary": "한 줄 설명",
  "category": "prompting",
  "target": "chat",
  "pick": true,
  "needsUpload": false,
  "lang": "ko",
  "prompt": "본문. 변수는 ${이름} 또는 ${이름:기본값}",
  "addedAt": "2026-10-05",
  "source": {
    "name": "출처 이름",
    "url": "https://...",
    "authors": [{ "name": "작성자", "url": "https://..." }],
    "license": "CC-BY-4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/deed.ko"
  }
}
```

- `category`: `dev` `prompting` `data` `writing` `learning` `business` `image` `creative` `life`
- `target`: `chat` (범용 챗봇) · `agent` (코딩 에이전트) · `image` (이미지 모델)
- `id` 접두사로 출처를 구분합니다: `community-`, `sm-`, `acp-`, `dair-`

## 공개 출처 다시 가져오기

```bash
node scripts/prompts/import-open-sources.mjs
```

가져올 항목과 한국어 제목·설명은 `scripts/prompts/curation.mjs`에서 관리합니다.

## 공유 자동화

1. 방문자가 `.github/ISSUE_TEMPLATE/prompt-share.yml` 폼으로 이슈를 엽니다 (`prompt:submission` 라벨).
2. 검토 후 `prompt:approved` 라벨을 붙이면 `.github/workflows/prompt-submission.yml`이
   `scripts/prompts/issue-to-prompt.cjs`로 `community.json`에 추가하고, main에 커밋한 뒤 배포를 실행하고 이슈를 닫습니다.
3. 반영된 프롬프트는 `https://d9249.github.io/prompts/#<id>`로 바로 열립니다.
4. 폼 값이 잘못되면 이슈에 고칠 점을 댓글로 남기고 라벨을 뗍니다.

파서 테스트: `node --test scripts/prompts/issue-form.test.cjs`
