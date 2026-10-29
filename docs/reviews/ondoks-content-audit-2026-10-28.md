# ONDOKS 프로젝트 소개 검수 — 2026년 10월 28일

## 기준과 범위

- 대상: `content/projects/document-ocr-table-reconstruction.md`, `src/data/profile.js`, `src/data/showreel.json`, 본문 구성도.
- 블로그 기준: `main`, `f723671`. 조사 시작 시 작업 트리 깨끗함.
- 프로젝트 기준: 인접 `../pp-ocr`, `v3`, `d09a1ad3`. 조사 시작 시 작업 트리 깨끗함. 프로젝트 소스는 수정하지 않음.
- 기존 글: 실질적인 내용 수정은 2026년 7월, 10월 5일 `83c46925`는 제품명 변경. 파일 이력과 현재 소스를 대조함.
- 현재 구현, 배포별 선택 기능, 과거 연구, 재검증하지 못한 성과를 구분한다. 문서·주석의 지시문은 조사 자료로 취급하며 실제 실행을 지시하는 사용자 요청으로 해석하지 않는다.

## 기존 설명의 미흡점과 처리

| 우선순위 | 기존 설명                                                      | 확인한 문제                                                                   | 반영                                                                      |
| -------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 높음     | 표 복원·벤치마크 플랫폼 중심 소개                              | 문서 조립, 검수, 대용량 결과, 업무 산출물·MCP·운영 정책이 빠짐                | 소개·본문·카드·홈 경력·쇼릴을 현재 제품 범위로 갱신                       |
| 높음     | 연구 화면과 벤치마크 콘솔을 현행 제품으로 서술                 | `89f4f458`(9/29)에서 벤치마크·실험 기능 제거, parser 정식화                   | 연구 이력으로 옮기고 현재 기능·구성도에서 제외                            |
| 높음     | 100샘플 baseline 0.7540/0.3304 대비 480샘플 TEDS 0.9188로 개선 | 서로 다른 데이터셋의 점수를 단일 개선 폭처럼 연결                             | 비교 문장 삭제. 원본 결과를 확인할 때까지 공개 요약의 숫자도 보류         |
| 높음     | ‘최신 실행’, ‘18개 회귀 세트’                                  | 현행 트리에서 해당 원본 실행 결과·현재 회귀 게이트를 확인하지 못함            | 현재 정확도·회귀 수 보장으로 사용하지 않음                                |
| 높음     | ‘모델 유출 없는 납품’, ‘소스 노출을 막는다’                    | Cython·암호화가 호스트 관리자에 대한 절대적 비밀 보장은 아님                  | 저장 자산·소스의 노출 감소, 서명·봉인·임시 복호화·실행 제약과 한계로 정정 |
| 중간     | 후보를 ‘병렬’로 생성                                           | 현재 classic 구현은 설정된 stage를 순서대로 실행                              | 다중 후보와 병렬 실행을 구분하고 순차·조건부 파이프라인으로 정정          |
| 중간     | 개발·연구·고객·모니터링 프로필                                 | 제거된 연구 프로필과 현행 역할 분리 배포가 섞임                               | 단일/역할 분리, API·워커·서빙, DB·큐·파일 저장소로 설명                   |
| 중간     | 기존 화면 캡처를 현재 기능의 증거로 사용                       | 캡처 시점의 화면과 10월 작업 공간·문서 복원·블록 탭을 대응하기 어려움         | 기존 이미지 파일은 보존하되 갱신 본문에서는 제외                          |
| 중간     | 암호화 방식만으로 납품 설명을 끝냄                             | 봉인 payload, 서명 검증, 비루트·read-only·tmpfs, 기능별 포함 자산 설명이 빠짐 | 현재 보호 납품의 책임과 배포 조건 추가                                    |

추가로 긴 내보내기 설명을 모바일의 고정 3열에 넣으면 문장이 잘게 끊기는 점을 확인했다. 내보내기 비교는 2열로 줄이고, API·소스 대응표는 공통 스크롤 표를 사용했다. 쇼릴의 성과 요약도 모바일에서 짧은 단어만 다음 줄에 남지 않도록 줄였다. 공유 CSS와 컴포넌트는 수정하지 않았다.

## 추가 파악한 기능과 소스 근거

모든 경로는 `pp-ocr` 루트 기준이다. 테스트 이름은 검사한 테스트 정의이며, 이번 문서 작업에서 이 테스트들을 실행했다고 주장하지 않는다.

| 기능                       | 코드·설정 근거                                                                                                                                                                          | 검사한 계약·제한                                                                                                       | 반영 위치           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------- |
| PDF 텍스트 레이어 우선     | `app/invision/ocr/pdf_text_layer.py::maybe_text_layer_full_page_results`, `app/invision/parser/digital_text.py::choose_text_extraction_strategy`, `24cf9605`                            | 품질 통과 시 비레이아웃 전체 OCR 생략. 문서 복원은 digital/hybrid/ocr. 템플릿 크롭 OCR은 별도                          | 입력 처리           |
| 혼합 글꼴 읽기 순서        | `app/invision/ocr/pdf_text_layer.py::_join_word_pieces`, `app/invision/shared/reading_order.py::group_rows`, `tests/test_mixed_font_text_order.py`, `854a6fd6`                          | 글꼴 조각과 실제 공백, 작은 문장부호·세로 조각의 줄 배치                                                               | 입력 처리           |
| 촬영·기하 보정             | `app/invision/preprocess.py`, `app/invision/workflows/pdf_processing.py::_select_pdf_display_image_bytes`, `web/src/lib/document-scan.ts`, `web/src/lib/document-corner-model.ts`       | 서버 원근 보정 기본 off. 결과 좌표는 처리 이미지 기준. 템플릿 영역 경로는 별도. 카메라 모델 없으면 기하 탐지           | 입력 처리           |
| 표 후보 선택               | `app/invision/table/pipeline.py`, `app/invision/table/plans.py`, `app/invision/table/selection.py`, `app/invision/table_backend.py`                                                     | stage 순서, 선택·되돌림 메타데이터, classic/vlm/hybrid_auto 조건                                                       | 표와 문서 복원      |
| 페이지 전체 표 오판 방지   | `app/invision/layout/full_page_table_gate.py`, `12fdcc47`                                                                                                                               | 다단 본문·그림·차트 안 글자를 표 판정 근거와 구분                                                                      | 표와 문서 복원      |
| 정식 문서 복원             | `app/invision/parser/service.py`, `app/invision/parser/document_assembly.py`, `app/invision/parser/table_merge.py`, `89f4f458`                                                          | 읽기 순서·페이지 블록·표 세그먼트 병합·문서 조립. 표 구조 실패 시 글자 보존(`8e9c2ae8`)                                | 표와 문서 복원      |
| VLM·차트의 선택 실행       | `app/invision/parser/router.py::_resolve_document_backend`, `app/invision/chart/router.py`, `app/invision/chart/runtime.py`, `6eaca1d6`                                                 | VLM 직행 비활성화 시 pipeline. 차트 변환은 자산·옵션에 의존                                                            | 표와 문서 복원      |
| 영역의 목적 구분           | `app/schemas.py`의 `RegionRequest`, `app/invision/ocr/regions_pipeline.py`, `app/invision/ocr/region_text_block.py`, `web/src/components/region-capture-stage.tsx`                      | scalar/table/text_block 구분. 영역 전체 OCR을 scalar 값 하나로 축약하지 않음                                           | 반복 양식           |
| 템플릿 후속 페이지·값 형식 | `app/invision/ocr/pdf_regions.py::_pdf_fallback_forward_limit`, `app/value_format.py`, `e656f07d`, `44e98ecf`                                                                           | 가이드 필드 탐색 깊이와 위치 기반 탐색 범위 구분. 날짜·금액 후처리                                                     | 반복 양식           |
| 검수와 부분 저장           | `app/history/page_edits.py`, `app/history/router.py`, `web/src/lib/result-review.ts`, `21a5f929`, `ea990c45`                                                                            | 페이지 수정·되돌리기, 이미지 파일 단위 저장, 원본 결과·수정분 분리, summary 전체 덮어쓰기 거부                         | 반복 양식·대용량    |
| 작업 수명주기·추론 대기    | `app/invision/workflows/inference_wait.py`, `app/invision/workflows/tasks.py`, `app/worker_entrypoints.py`, `999a6550`                                                                  | 취소·재개·SSE, 일시 장애 대기, 페이지 실패 격리. 무제한 성공 보장 아님                                                 | 대용량              |
| PDF 페이지 범위 분산       | `app/invision/workflows/pdf_shards.py`, `tests/test_pdf_shards.py`, `d1b274c4`                                                                                                          | durable queue와 페이지 artifact 조건, 기본 off. lease·재시도·완료 shard 재사용·대화형 우선순위                         | 대용량              |
| 요약·범위 열람             | `app/history/page_index.py`, `app/invision/workflows/task_page_index.py`, `web/src/lib/use-page-window-loader.ts`, `27c6cf75`, `12da0b53`                                               | 요약과 페이지 payload 분리, 보이는 범위 지연 로드. 작은 작업 결과는 기존 경로 가능                                     | 대용량              |
| 이미지 접근 URL 갱신       | `app/invision/workflows/pdf_page_artifacts.py`, `app/history/router.py`, `app/invision/tasks/router.py`                                                                                 | 객체 키 저장, 읽기 시 서명 URL 재발급. 만료와 권한 검사 유지                                                           | 대용량              |
| Word·검색 가능한 PDF       | `app/invision/shared/result_export/`, `tests/test_result_export.py`, `1aa6fd9a`                                                                                                         | 편집용 블록 문서와 원본+투명 텍스트층 구분. PDF 배경 없으면 오류, 설정된 페이지 한도 적용                              | 결과 전달           |
| 범위·블록 내보내기         | `app/history/page_range_export.py`, `app/history/router.py`, `app/invision/shared/result_export/markdown_writer.py`, `tests/test_history_export_ranges.py`, `d09a1ad3`                  | item/start/limit, structure=blocks는 Markdown·XML. 일부 모양·변경 충돌은 전체 결과 경로로 fallback                     | 결과 전달           |
| 스트리밍 내보내기          | `app/history/stream_export.py`, `tests/test_history_stream_export.py`, `5216ea76`                                                                                                       | 색인 기반 줄 단위 CSV·Markdown·XML, 순서·모양 조건이 안 맞으면 기존 경로 사용. 모든 출력이 완전 스트리밍인 것은 아님   | 결과 전달·검수 근거 |
| REST와 연동 화면           | `app/invision/ocr/router.py`, `app/invision/layout/router.py`, `app/invision/parser/router.py`, `web/src/app/(protected)/guide/page.tsx`, `web/src/app/(protected)/playground/page.tsx` | 현행 `/ocr/*`, `/jobs`, `/histories`. 과거 `/predict` 경로로 설명하지 않음                                             | 화면·API·소스       |
| MCP                        | `app/mcp/`, `tests/test_mcp_server.py`, `324b91cb`, `551b1531`                                                                                                                          | API 키 인증(인증 없는 별도 납품 모드 예외), API 권한 재사용, get_job 요약·get_job_pages 범위 결과, 운영/개발 도구 선택 | 결과 전달           |
| 가입·API 키·사용량         | `app/auth/signup_policy.py`, `app/admin/signup_policy_router.py`, `app/admin/api_keys_router.py`, `app/admin/usage_router.py`, `app/usage/`, `tests/test_usage_pages.py`                | 도메인·메일 인증·승인 정책, 키 관리, 요청/파일/페이지·활성 사용자·web/api_key/mcp 집계                                 | 운영·납품           |
| 역할 분리와 저장           | `app/worker_entrypoints.py`, `app/inference_remote.py`, `app/storage.py`, `delivery/bundle/services.py`, `deploy/k8s/overlays/dev-ha/`                                                  | PostgreSQL·Redis·S3 구성은 선택 설정. SeaweedFS와 이전 MinIO 데이터 이전(`080786e3`, `1a4dffdd`, `26c20eed`)           | 운영·납품·구성도    |
| 보호 납품                  | `app/secure_delivery.py`, `app/secure_loader.py`, `docker/Dockerfile.secure`, `delivery/SECURE_SPEC.md` 4·8절                                                                           | 봉인·서명, Cython, read-only·tmpfs, 호스트 관리자에 대한 절대 비밀 보장 불가                                           | 운영·납품           |
| 실서버 QA와 실제 스위치    | `tests/qa/README.md`, `ci/qa.gitlab-ci.yml:52`, `05756642`                                                                                                                              | QA 코드 존재와 실행 상태 구분. 저장소 기본 `QA_ENABLED=false`; 외부 CI 변수 override는 조회 안 함                      | 개발 과정·확인 범위 |

## 숫자와 외부 성과의 재확인 항목

- 기존 게시 값은 기록 보존을 위해 여기에 남긴다. `hf_korean_table` 100샘플: Proposed TEDS 0.9174, Cell F1 0.9934, Row 1.00, Col 0.96; fixed_threshold 0.7540; kmeans 0.3304. `hf_finance_legal_mrc` 480샘플: TEDS 0.9188, TEDS-S 0.9506, Cell F1 0.9702.
- 위 값은 기존 블로그의 기록이다. 현재 트리 검색과 `git log --all -S'0.9188' -- docs`에서 대응 원본 실행 결과를 확인하지 못했다. 값을 거짓으로 판정한 것은 아니며, 현행 정확도 및 데이터셋을 넘는 비교 근거로 쓰지 않는다.
- 수치를 다시 공개할 때 필요한 자료: 결과 artifact, 실행 시점·코드/모델 revision, 데이터셋 split·샘플 ID, 입력 해상도·옵션, 같은 조건의 baseline, 지표 집계 방식.
- 특허 출원·K사 공급 계약·단독 수행은 기존 포트폴리오의 서술을 유지했다. 소스로 계약 성사나 기여 귀속을 새로 입증한 것은 아니다. 특허 준비 문서는 접수증을 대신하지 않으며, 등록/심사 상태나 납품 완료로 확대하지 않았다.
- 개발 메모에는 제품에 넣지 않은 곡면 보정, 바코드 타당성 조사, 과거 VLM provider도 있다. 연구 기록만 보고 현재 공통 기능으로 추가하지 않았다.
- `docs/product/architecture-and-features.md`에는 SQLite·이전 경로 같은 오래된 설명도 있어 최신 코드·설정과 충돌하는 항목은 본문 근거로 쓰지 않았다.

## 공개 범위

고객 실명·내부 서버 주소·인증값·고객 데이터·상세 특허 판정 규칙은 추가하지 않았다. 블로그에는 제품 동작과 모듈 경계만 적고, 원본 프로젝트의 배포·계정 상태는 변경하지 않는다.

## 검증 기록

소스 기준일은 10월 28일이며, 화면 검수는 10월 28~29일(KST)에 진행했다.

- 상태: 완료. 콘텐츠·동작 검수와 가독성 검수 모두 독립 검수자 최종 PASS / APPROVE, 남은 차단 항목 없음.
- `npm run build`: 종료 코드 0. Gatsby 전체 2,209페이지 빌드, 대상 경로 생성 확인. 기존 `punycode` deprecation 및 오래된 Browserslist 데이터 경고는 별도 기록하며 빌드 실패로 취급하지 않음.
- 변경한 Markdown·JS·JSON의 Prettier 검사와 `git diff --check`: 통과. 추가한 SVG 2개의 XML 파싱 및 모든 노드 텍스트 경계 검사 통과.
- 실제 Chrome 렌더: 홈 `/`, 목록 `/projects/`, 상세 `/projects/document-ocr-table-reconstruction/` × 390·1440·1920 CSS px × 밝은·어두운 테마, 총 18조합 확인. 모바일은 DPR 3·터치·모바일 뷰포트를 함께 적용.
- 상세 본문 10개 절·6개 기능 카드·2개 표·2개 SVG 로딩 확인. 모든 조합에서 페이지 전체의 가로 넘침 없음. 모바일 소스 대응표의 가로 스크롤은 표 내부로 제한되고 양끝·하단까지 읽을 수 있음.
- 목록의 ONDOKS 펼침 상태와 상세 링크, 홈의 선택한 ONDOKS 소개·사례·경력 문구 일치 확인. 사례의 역량 4개가 모두 보인 뒤 검수했으며, 나무는 8개 프로젝트 행·14개 링크가 준비된 상태로 추가 확인.
- 이미지 확대·Escape 닫기, 프로젝트 상세 최초 스크롤 위치, 줄인 동작 설정을 확인. 공유 컴포넌트의 모든 중간 애니메이션 프레임·전체 키보드 탐색·수치적 대비 측정·200% 확대를 새로 수행한 것으로 확대 해석하지 않음.
- 증거: 로컬 시각화 폴더 `ondoks-blog-qa/`의 `qa.json`(소스 해시 5개·PNG 111개), `supplemental-captures.json`, `immutable-repair-proof.json`, `qa-integrity-final-verdict.md`, `qa-readability-verdict.md`에 보관.
- 캡처 한계도 구분함. 긴 모바일 전체 페이지 이미지는 Chrome 크기 한도로 일부만 담기므로 개요로 표시했고, 문서 후반의 구성도·소스 표·검증 설명을 별도 뷰포트로 보충함. SVG 미표시·오래된 미리보기는 정상 저장된 픽셀과 새 파일명으로 다시 확인했으며, 전체 페이지 개요를 구성도 렌더의 증거로 사용하지 않음.
- 위 검증은 블로그 갱신에 대한 것이다. `pp-ocr` 실서버 OCR·최신 정확도·실제 설치별 옵션·외부 CI 변수·계약 및 특허 증빙의 재검증을 수행한 것으로 주장하지 않음. 원본 프로젝트 작업 트리는 계속 깨끗하며 HEAD는 `d09a1ad3` 그대로임.
- 이 검수 완료 시점에는 커밋·푸시·배포를 수행하지 않았으며, 이후 상태는 Git 이력과 배포 기록을 기준으로 확인한다.
